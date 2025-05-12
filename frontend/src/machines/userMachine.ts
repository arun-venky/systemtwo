import { createMachine, assign } from 'xstate'
import api from '../utils/api'

// Define interfaces
export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserContext {
  users: User[];
  selectedUser: User | null;
  errorMessage: string | null;
  isLoading: boolean;
  formData: Partial<User>;
}

export type UserEvent =
  | { type: 'FETCH' }
  | { type: 'CREATE' }
  | { type: 'EDIT'; id: string }
  | { type: 'DELETE'; id: string }
  | { type: 'SAVE'; data: any }
  | { type: 'CANCEL' }
  | { type: 'RETRY' }

export type UserState =
  | { value: 'idle'; context: UserContext }
  | { value: 'loading'; context: UserContext }
  | { value: 'creating'; context: UserContext }
  | { value: 'editing'; context: UserContext }
  | { value: 'deleting'; context: UserContext }
  | { value: 'error'; context: UserContext }

// Create user management machine
export const createUserMachine = (initialContext: Partial<UserContext> = {}) => {
  return createMachine<UserContext, UserEvent, UserState>({
    id: 'userManagement',
    initial: 'idle',
    context: {
      users: [],
      selectedUser: null,
      errorMessage: null,
      isLoading: false,
      formData: {},
      ...initialContext
    },
    states: {
      idle: {
        on: {
          FETCH: { target: 'loading' },
          CREATE: { target: 'creating' },
          EDIT: { 
            target: 'editing',
            actions: ['selectUser']
          },
          DELETE: { 
            target: 'deleting',
            actions: ['selectUser']
          }
        }
      },
      loading: {
        entry: assign({ isLoading: true }),
        invoke: {
          src: 'fetchUsers',
          onDone: {
            target: 'idle',
            actions: ['setUsers']
          },
          onError: {
            target: 'error',
            actions: ['setError']
          }
        }
      },
      creating: {
        entry: assign({ 
          formData: {},
          selectedUser: null 
        }),
        on: {
          SAVE: { 
            target: 'loading',
            actions: ['createUser']
          },
          CANCEL: { target: 'idle' }
        }
      },
      editing: {
        entry: assign({
          formData: (context) => ({ ...context.selectedUser })
        }),
        on: {
          SAVE: { 
            target: 'loading',
            actions: ['updateUser']
          },
          CANCEL: { target: 'idle' }
        }
      },
      deleting: {
        invoke: {
          src: 'deleteUser',
          onDone: {
            target: 'loading',
            actions: ['removeUser']
          },
          onError: {
            target: 'error',
            actions: ['setError']
          }
        }
      },
      error: {
        on: {
          RETRY: { target: 'loading' },
          CANCEL: { target: 'idle' }
        }
      }
    }
  }, {
    actions: {
      setUsers: assign({
        users: (_, event) => {
          if ('data' in event) {
            return event.data.users || []
          }
          return []
        },
        isLoading: (_) => false,
        errorMessage: (_) => null
      }),
      selectUser: assign({
        selectedUser: (context, event) => {
          if ('id' in event) {
            return context.users.find(user => user._id === event.id) || null
          }
          return null
        }
      }),
      removeUser: assign({
        users: (context) => {
          if (context.selectedUser && context.selectedUser._id) {
            return context.users.filter(user => user._id !== context.selectedUser?._id)
          }
          return context.users
        },
        selectedUser: (_) => null
      }),
      setError: assign({
        errorMessage: (_, event) => {
          if ('data' in event) {
            const error = event.data.message || 'Operation failed'
            console.error('User Error:', error)
            return error
          }
          console.error('User Error: Operation failed')
          return 'Operation failed'
        },
        isLoading: (_) => false
      }),
      createUser: () => {}, // Handled in service
      updateUser: () => {}  // Handled in service
    },
    services: {
      fetchUsers: async () => {
        try {
          const response = await api.get('/users')
          return response.data
        } catch (error) {
          console.error('User Error: Failed to fetch users', error)
          throw error
        }
      },
      deleteUser: async (context) => {
        if (!context.selectedUser || !context.selectedUser._id) {
          console.error('User Error: No user selected for deletion')
          return Promise.reject('No user selected')
        }
        
        try {
          const response = await api.delete(`/users/${context.selectedUser?._id}`)
          return response.data
        } catch (error) {
          console.error('User Error: Failed to delete user', error)
          throw error
        }
      },
      createUser: async (context) => {
        // Validate user data
        if (!context.formData?.username || !context.formData?.email || !context.formData?.password) {
          console.error('User Error: Missing required fields')
          return Promise.reject('Missing required fields')
        }

        try {
          const response = await api.post('/users', context.formData)
          return response.data
        } catch (error) {
          console.error('User Error: Failed to create user', error)
          throw error
        }
      },
      updateUser: async (context) => {
        if (!context.selectedUser || !context.selectedUser._id) {
          console.error('User Error: No user selected for update')
          return Promise.reject('No user selected')
        }

        // Validate update data
        if (!context.formData.username && !context.formData.email) {
          console.error('User Error: No fields to update')
          return Promise.reject('No fields to update')
        }
        
        try {
          const response = await api.put(`/users/${context.selectedUser?._id}`, context.formData)
          return response.data
        } catch (error) {
          console.error('User Error: Failed to update user', error)
          throw error
        }
      }
    }
  })
}