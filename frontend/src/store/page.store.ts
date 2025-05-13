import { defineStore } from 'pinia';
import { Page, PageState } from '@/store/models';
import { pageService } from './services/page.service';

export const usePageStore = defineStore('page', {
  state: (): PageState => ({
    pages: [],
    selectedPage: null,
    errorMessage: null,
    isLoading: false,
    formData: {
      title: '',
      content: '',
      slug: '',
      parentId: ''
    }
  }),

  getters: {    
  },

  actions: {
    async fetchPages() {
        try {
          return await pageService.fetchPages();
        } catch (error) {
          throw error;
        }
      },
    
      async getPageById(id: string) {
        try {
          return await pageService.getPageById(id);
        } catch (error) {
          throw error;
        }
      },
    
      async getPageBySlug(slug: string) {
        try {
          return await pageService.getPageBySlug(slug);
        } catch (error) {
          throw error;
        }
      },
    
      async createPage(pageData: Partial<Page>) {
        try {
          return await pageService.createPage(pageData);
        } catch (error) {
          throw error;
        }
      },
    
      async updatePage(id: string, pageData: Partial<Page>) {
        try {
          return await pageService.updatePage(id, pageData);
        } catch (error) {
          throw error;
        }
      },
    
      async deletePage(id: string) {
        try {
          return await pageService.deletePage(id);
        } catch (error) {
          throw error;
        }
      },
    
      async managePages(operations: any[]) {
        try {
          return await pageService.managePages(operations);
        } catch (error) {
          throw error;
        }
      },
    
      async publishPage(id: string) {
        try {
          return await pageService.publishPage(id);
        } catch (error) {
          throw error;
        }
      },
    
      async unpublishPage(id: string) {
        try {
          return await pageService.unpublishPage(id);
        } catch (error) {
          throw error;
        }
      },
    
      async getPageVersions(id: string) {
        try {
          return await pageService.getPageVersions(id);
        } catch (error) {
          throw error;
        }
      },
    
      async restorePageVersion(id: string, versionId: string) {
        try {
          return await pageService.restorePageVersion(id, versionId);
        } catch (error) {
          throw error;
        }
      },
    
      async getPageDraft(id: string) {
        try {
          return await pageService.getPageDraft(id);
        } catch (error) {
          throw error;
        }
      },
    
      async savePageDraft(id: string, draftData: any) {
        try {
          return await pageService.savePageDraft(id, draftData);
        } catch (error) {
          throw error;
        }
      },
    
      async deletePageDraft(id: string) {
        try {
          return await pageService.deletePageDraft(id);
        } catch (error) {
          throw error;
        }
      },
    
      async duplicatePage(id: string, newTitle: string) {
        try {
          return await pageService.duplicatePage(id, newTitle);
        } catch (error) {
          throw error;
        }
      },
    
      async movePage(id: string, newParentId: string) {
        try {
          return await pageService.movePage(id, newParentId);
        } catch (error) {
          throw error;
        }
      },
    
      async getPageTree() {
        try {
          return await pageService.getPageTree();
        } catch (error) {
          throw error;
        }
      }     
  }
}); 