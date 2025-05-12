import { createMachine, assign } from 'xstate'
import api from '../utils/api'
import { useToast } from 'vue-toastification'

const toast = useToast()

// Define interfaces
export interface Page {
  _id: string;
  title: string;
  content: string;
  slug: string;
  isPublished: boolean;
  publishedAt?: string;
  publishedBy?: string;
  draft?: {
    content: string;
    lastSaved: string;
    savedBy: string;
  };
  versions: Array<{
    content: string;
    publishedAt: string;
    publishedBy: string;
  }>;
  parentId?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface PageContext {
  pages: Page[];
  selectedPage: Page | null;
  errorMessage: string | null;
  isLoading: boolean;
  formData: Partial<Page>;
}

export type PageEvent =
  | { type: 'FETCH' }
  | { type: 'CREATE' }
  | { type: 'EDIT'; id: string }
  | { type: 'DELETE'; id: string }
  | { type: 'SAVE'; data: Partial<Page> }
  | { type: 'CANCEL' }
  | { type: 'RETRY' }

export type PageState =
  | { value: 'idle'; context: PageContext }
  | { value: 'loading'; context: PageContext }
  | { value: 'creating'; context: PageContext }
  | { value: 'editing'; context: PageContext }
  | { value: 'deleting'; context: PageContext }
  | { value: 'error'; context: PageContext }

// Create page management machine
export const createPageMachine = (initialContext: Partial<PageContext> = {}) => {
  return createMachine<PageContext, PageEvent, PageState>({
    id: 'pageManagement',
    initial: 'idle',
    context: {
      pages: [],
      selectedPage: null,
      errorMessage: null,
      isLoading: false,
      formData: {},
      ...initialContext
    },
    states: {
      idle: {
        on: {
          FETCH: { target: 'loading' },
          CREATE: { 
            target: 'creating',
            actions: assign({
              formData: {
                title: '',
                content: '',
                slug: '',
                isPublished: false
              }
            })
          },
          EDIT: { 
            target: 'editing',
            actions: ['selectPage', 'initializeFormData']
          },
          DELETE: { 
            target: 'deleting',
            actions: ['selectPage']
          }
        }
      },
      loading: {
        entry: assign({ isLoading: true }),
        invoke: {
          src: 'fetchPages',
          onDone: {
            target: 'idle',
            actions: ['setPages']
          },
          onError: {
            target: 'error',
            actions: ['setError']
          }
        }
      },
      creating: {
        on: {
          SAVE: { 
            target: 'loading',
            actions: ['createPage']
          },
          CANCEL: {
            target: 'idle',
            actions: ['clearForm']
          }
        }
      },
      editing: {
        on: {
          SAVE: { 
            target: 'loading',
            actions: ['updatePage']
          },
          CANCEL: {
            target: 'idle',
            actions: ['clearForm']
          }
        }
      },
      deleting: {
        invoke: {
          src: 'deletePage',
          onDone: {
            target: 'loading',
            actions: ['handleDeleteSuccess']
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
      setPages: assign({
        pages: (_, event) => {
          if ('data' in event) {
            return event.data.pages || []
          }
          return []
        },
        isLoading: false,
        errorMessage: null
      }),
      selectPage: assign({
        selectedPage: (context, event) => {
          if ('id' in event) {
            return context.pages.find(page => page._id === event.id) || null
          }
          return null
        }
      }),
      initializeFormData: assign({
        formData: (context) => ({
          ...context.selectedPage
        })
      }),
      clearForm: assign({
        selectedPage: null,
        formData: {},
        errorMessage: null
      }),
      handleDeleteSuccess: assign({
        pages: (context) => context.pages.filter(page => page._id !== context.selectedPage?._id),
        selectedPage: null,
        errorMessage: null
      }),
      setError: assign({
        errorMessage: (_, event) => {
          if ('data' in event) {
            const error = event.data.message || 'Operation failed'
            toast.error(error)
            return error
          }
          const error = 'Operation failed'
          toast.error(error)
          return error
        },
        isLoading: false
      })
    },
    services: {
      fetchPages: async () => {
        try {
          const response = await api.get('/pages')
          return response.data
        } catch (error) {
          console.error('Failed to fetch pages:', error)
          throw error
        }
      },
      deletePage: async (context) => {
        if (!context.selectedPage?._id) {
          throw new Error('No page selected')
        }
        
        try {
          const response = await api.delete(`/pages/${context.selectedPage._id}`)
          toast.success('Page deleted successfully')
          return response.data
        } catch (error) {
          console.error('Failed to delete page:', error)
          throw error
        }
      },
      createPage: async (context) => {
        try {
          const response = await api.post('/pages', context.formData)
          toast.success('Page created successfully')
          return response.data
        } catch (error) {
          console.error('Failed to create page:', error)
          throw error
        }
      },
      updatePage: async (context) => {
        if (!context.selectedPage?._id) {
          throw new Error('No page selected')
        }

        try {
          const response = await api.put(`/pages/${context.selectedPage._id}`, context.formData)
          toast.success('Page updated successfully')
          return response.data
        } catch (error) {
          console.error('Failed to update page:', error)
          throw error
        }
      }
    }
  })
}