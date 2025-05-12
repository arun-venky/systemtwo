import { createMachine, assign } from 'xstate'
import api from '../utils/api'

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
  | { type: 'SAVE'; data: any }
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
          CREATE: { target: 'creating' },
          EDIT: { 
            target: 'editing',
            actions: ['selectPage']
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
        entry: assign({ 
          formData: { title: '', content: '', slug: '' },
          selectedPage: null 
        }),
        on: {
          SAVE: { 
            target: 'loading',
            actions: ['createPage']
          },
          CANCEL: { target: 'idle' }
        }
      },
      editing: {
        entry: assign({
          formData: (context) => ({ 
            title: context.selectedPage?.title || '',
            content: context.selectedPage?.content || '',
            slug: context.selectedPage?.slug || ''
          })
        }),
        on: {
          SAVE: { 
            target: 'loading',
            actions: ['updatePage']
          },
          CANCEL: { target: 'idle' }
        }
      },
      deleting: {
        invoke: {
          src: 'deletePage',
          onDone: {
            target: 'loading',
            actions: ['removePage']
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
        isLoading: (_) => false,
        errorMessage: (_) => null
      }),
      selectPage: assign({
        selectedPage: (context, event) => {
          if ('id' in event) {
            return context.pages.find(page => page._id === event.id) || null
          }
          return null
        }
      }),
      removePage: assign({
        pages: (context) => {
          if (context.selectedPage && context.selectedPage._id) {
            return context.pages.filter(page => page._id !== context.selectedPage?._id)
          }
          return context.pages
        },
        selectedPage: (_) => null
      }),
      setError: assign({
        errorMessage: (_, event) => {
          if ('data' in event) {
            const error = event.data.message || 'Operation failed'
            console.error('Page Error:', error)
            return error
          }
          console.error('Page Error: Operation failed')
          return 'Operation failed'
        },
        isLoading: (_) => false
      }),
      createPage: () => {}, // Handled in service
      updatePage: () => {}  // Handled in service
    },
    services: {
      fetchPages: async () => {
        try {
          const response = await api.get('/pages')
          return response.data
        } catch (error) {
          console.error('Page Error: Failed to fetch pages', error)
          throw error
        }
      },
      deletePage: async (context) => {
        if (!context.selectedPage || !context.selectedPage._id) {
          console.error('Page Error: No page selected for deletion')
          return Promise.reject('No page selected')
        }
        
        try {
          const response = await api.delete(`/pages/${context.selectedPage?._id}`)
          return response.data
        } catch (error) {
          console.error('Page Error: Failed to delete page', error)
          throw error
        }
      },
      createPage: async (context) => {
        // Validate page data
        if (!context.formData.title || !context.formData.slug) {
          console.error('Page Error: Missing required fields (title or slug)')
          return Promise.reject('Missing required fields')
        }

        // Validate slug format
        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
        if (!slugRegex.test(context.formData.slug)) {
          console.error('Page Error: Invalid slug format')
          return Promise.reject('Invalid slug format')
        }

        try {
          const response = await api.post('/pages', {
            ...context.formData,
            isPublished: false,
            order: context.pages.length
          })
          return response.data
        } catch (error) {
          console.error('Page Error: Failed to create page', error)
          throw error
        }
      },
      updatePage: async (context) => {
        if (!context.selectedPage) {
          console.error('Page Error: No page selected for update')
          return Promise.reject('No page selected')
        }

        // Validate update data
        if (context.formData.slug) {
          const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
          if (!slugRegex.test(context.formData.slug)) {
            console.error('Page Error: Invalid slug format')
            return Promise.reject('Invalid slug format')
          }
        }
        
        try {
          const response = await api.put(`/pages/${context.selectedPage._id}`, context.formData)
          return response.data
        } catch (error) {
          console.error('Page Error: Failed to update page', error)
          throw error
        }
      }
    }
  })
}