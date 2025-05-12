import { createMachine, assign } from 'xstate'
import api from '../utils/api'

// Define interfaces
export interface MenuItem {
  _id?: string;
  label: string;
  url: string;
  roles: string[];
  order: number;
}

export interface Menu {
  _id: string;
  name: string;
  items: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  _id: string;
  name: string;
  description: string;
}

export interface MenuFormData {
  name: string
  items: MenuItem[]
}

export interface MenuContext {
  menus: Menu[];
  roles: Role[];
  selectedMenu: Menu | null;
  errorMessage: string | null;
  isLoading: boolean;
  formData: {
    name: string;
    items: MenuItem[];
  };
}

interface MenuResponse {
  menus: any[]
  roles: any[]
  message?: string
}

export type MenuEvent =
  | { type: 'FETCH' }
  | { type: 'CREATE' }
  | { type: 'EDIT'; id: string }
  | { type: 'DELETE'; id: string }
  | { type: 'SAVE'; data: any }
  | { type: 'CANCEL' }
  | { type: 'RETRY' }
  | { type: 'ADD_ITEM' }
  | { type: 'REMOVE_ITEM'; index: number }
  | { type: 'done.invoke.fetchData'; data: MenuResponse }
  | { type: 'error.platform.fetchData'; data: { message: string } }
  | { type: 'done.invoke.deleteMenu'; data: { message: string } }
  | { type: 'error.platform.deleteMenu'; data: { message: string } }

export type MenuState =
  | { value: 'idle'; context: MenuContext }
  | { value: 'loading'; context: MenuContext }
  | { value: 'creating'; context: MenuContext }
  | { value: 'editing'; context: MenuContext }
  | { value: 'deleting'; context: MenuContext }
  | { value: 'error'; context: MenuContext }

// Create menu management machine
export const createMenuMachine = (initialContext: Partial<MenuContext> = {}) => {
  return createMachine<MenuContext, MenuEvent, MenuState>({
    id: 'menuManagement',
    initial: 'idle',
    context: {
      menus: [],
      roles: [],
      selectedMenu: null,
      errorMessage: null,
      isLoading: false,
      formData: { name: '', items: [] },
      ...initialContext
    },
    states: {
      idle: {       
        on: {
          FETCH: { target: 'loading' },
          CREATE: { target: 'creating' },
          EDIT: { 
            target: 'editing',
            actions: ['selectMenu']
          },
          DELETE: { 
            target: 'deleting',
            actions: ['selectMenu']
          }
        }
      },
      loading: {
        entry: assign({ isLoading: true }),
        invoke: {
          src: 'fetchData',
          onDone: {
            target: 'idle',
            actions: ['setData']
          },
          onError: {
            target: 'error',
            actions: ['setError']
          }
        }
      },
      creating: {
        tags: ['creating'],
        entry: assign({ 
          formData: { name: '', items: [] },
          selectedMenu: null 
        }),
        on: {
          SAVE: { 
            target: 'loading',
            actions: ['createMenu']
          },
          CANCEL: { target: 'idle' },
          ADD_ITEM: {
            actions: ['addMenuItem']
          },
          REMOVE_ITEM: {
            actions: ['removeMenuItem']
          }
        }
      },
      editing: {
        entry: assign({
          formData: (context) => ({ 
            name: context.selectedMenu?.name || '',
            items: context.selectedMenu?.items || []
          })
        }),
        on: {
          SAVE: { 
            target: 'loading',
            actions: ['updateMenu']
          },
          CANCEL: { target: 'idle' },
          ADD_ITEM: {
            actions: ['addMenuItem']
          },
          REMOVE_ITEM: {
            actions: ['removeMenuItem']
          }
        }
      },
      deleting: {
        invoke: {
          src: 'deleteMenu',
          onDone: {
            target: 'loading',
            actions: ['removeMenu']
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
      setData: assign({
        menus: (_, event) => {
          if ('data' in event) {
            return event.data.menus || []
          }
          return []
        },
        roles: (_, event) => {
          if ('data' in event) {
            return event.data.roles || []
          }
          return []
        },
        isLoading: (_) => false,
        errorMessage: (_) => null
      }),
      selectMenu: assign({
        selectedMenu: (context, event) => {
          if ('id' in event) {
            return context.menus.find(menu => menu._id === event.id) || null
          }
          return null
        }
      }),
      removeMenu: assign({
        menus: (context) => {
          if (context.selectedMenu && context.selectedMenu._id) {
            return context.menus.filter(menu => menu._id !== context.selectedMenu?._id)
          }
          return context.menus
        },
        selectedMenu: (_) => null
      }),
      addMenuItem: assign({
        formData: (context) => {
          const newItem: MenuItem = {
            label: '',
            url: '',
            roles: [],
            order: context.formData.items.length
          }
          return {
            ...context.formData,
            items: [...context.formData.items, newItem]
          }
        }
      }),
      removeMenuItem: assign({
        formData: (context, event) => {
          if ('index' in event) {
            return {
              ...context.formData,
              items: context.formData.items.filter((_: MenuItem, index: number) => index !== event.index)
            }
          }
          return context.formData
        }
      }),
      setError: assign({
        errorMessage: (_, event) => {
          if ('data' in event) {
            const error = event.data.message || 'Operation failed'
            console.error('Menu Error:', error)
            return error
          }
          console.error('Menu Error: Operation failed')
          return 'Operation failed'
        },
        isLoading: (_) => false
      }),
      createMenu: async (context) => {
        // Validate menu items
        const validItems = context.formData.items.map(item => ({
          ...item,
          url: item.url.startsWith('/') ? item.url : `/${item.url}`
        }))
        
        const response = await api.post('/menus', {
          ...context.formData,
          items: validItems
        })
        return response.data
      },
      updateMenu: async (context) => {
        if (!context.selectedMenu || !context.selectedMenu._id) return Promise.reject('No menu selected')
        
        // Validate menu items
        const validItems = context.formData.items.map(item => ({
          ...item,
          url: item.url.startsWith('/') ? item.url : `/${item.url}`
        }))
        
        const response = await api.put(`/menus/${context.selectedMenu?._id}`, {
          ...context.formData,
          items: validItems
        })
        return response.data
      }
    },
    services: {
      fetchData: async () => {
        try {
          // Fetch menus
          const menusResponse = await api.get('/menus')
          
          // Fetch roles for menu item visibility
          const rolesResponse = await api.get('/roles')
          
          return {
            menus: menusResponse.data,
            roles: rolesResponse.data
          }
        } catch (error) {
          console.error('Menu Error: Failed to fetch data', error)
          throw error
        }
      },
      deleteMenu: async (context) => {
        if (!context.selectedMenu || !context.selectedMenu._id) {
          console.error('Menu Error: No menu selected for deletion')
          return Promise.reject('No menu selected')
        }
        
        try {
          const response = await api.delete(`/menus/${context.selectedMenu?._id}`)
          return response.data
        } catch (error) {
          console.error('Menu Error: Failed to delete menu', error)
          throw error
        }
      },
      createMenu: async (context) => {
        // Validate menu items
        const validItems = context.formData.items.map(item => ({
          ...item,
          url: item.url.startsWith('/') ? item.url : `/${item.url}`
        }))
        
        const response = await api.post('/menus', {
          ...context.formData,
          items: validItems
        })
        return response.data
      },
      updateMenu: async (context) => {
        if (!context.selectedMenu || !context.selectedMenu._id) return Promise.reject('No menu selected')
        
        // Validate menu items
        const validItems = context.formData.items.map(item => ({
          ...item,
          url: item.url.startsWith('/') ? item.url : `/${item.url}`
        }))
        
        const response = await api.put(`/menus/${context.selectedMenu?._id}`, {
          ...context.formData,
          items: validItems
        })
        return response.data
      }
    }
  })
}