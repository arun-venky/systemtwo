import { defineStore } from 'pinia';
import { Menu, MenuItem, MenuState } from '@/store/models';
import { menuService } from './services/menu.service';

export const useMenuStore = defineStore('menu', {
  state: (): MenuState => ({
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    permissions: [],
    roles: [],
    menuItemsCache: {} as Record<string, MenuItem[]>
  }),

  getters: {    
  },

  actions: {
    async fetchMenus() {
        try {
          const data = await menuService.fetchMenus();
          return { menus: data.menus, roles: data.roles };
        } catch (error) {
          throw error;
        }
      },
    
      async createMenu(menuData: Partial<Menu>) {
        try {
          return await menuService.createMenu(menuData);
        } catch (error) {
          throw error;
        }
      },
    
      async updateMenu(id: string, menuData: Partial<Menu>) {
        try {
          return await menuService.updateMenu(id, menuData);
        } catch (error) {
          throw error;
        }
      },
    
      async deleteMenu(id: string) {
        try {
          return await menuService.deleteMenu(id);
        } catch (error) {
          throw error;
        }
      },
    
      async bulkDelete(menus: string[]) {
        try {
          return await Promise.all(menus.map(id => this.deleteMenu(id)));      
        } catch (error) {
          throw error;
        }
      },
    
      async addMenuItem(menuId: string, item: MenuItem) {
        try {
          return await menuService.addMenuItem(menuId, item);
        } catch (error) {
          throw error;
        }
      },
    
      async updateMenuItem(menuId: string, itemId: string, item: Partial<MenuItem>) {
        try {
          return await menuService.updateMenuItem(menuId, itemId, item);
        } catch (error) {
          throw error;
        }
      },
    
      async deleteMenuItem(menuId: string, itemId: string) {
        try {
          return await menuService.deleteMenuItem(menuId, itemId);
        } catch (error) {
          throw error;
        }
      },
    
      async reorderMenuItems(menuId: string, itemIds: string[]) {
        try {
          return await menuService.reorderMenuItems(menuId, itemIds);
        } catch (error) {
          throw error;
        }
      },
    
      async getMenuItems(menuId: string, forceRefresh = false) {
        try {
          return await menuService.getMenuItems(menuId, forceRefresh);
        } catch (error) {
          throw error;
        }
      },
    
      clearMenuItemsCache(menuId?: string) {
        menuService.clearMenuItemsCache(menuId);
      }    
  }
}); 