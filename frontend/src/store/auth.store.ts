import { defineStore } from 'pinia';
import { User, AuthState } from '@/store/models';
import { useMenuStore } from '../store/menu.store'
import { authService } from './services/auth.service';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    permissions: [],
    roles: []
  }),

  getters: {
    menuStore: useMenuStore,
    isAdmin: (state) => state.roles.includes('admin'),
    hasPermission: (state) => (permission: string) => state.permissions.includes(permission),
    hasRole: (state) => (role: string) => state.roles.includes(role)
  },

  actions: {
    setAuth(authData: { user: User; token: string; refreshToken: string }) {
      this.isAuthenticated = true;
      this.user = authData.user;
      this.token = authData.token;
      this.refreshToken = authData.refreshToken;
      this.permissions = authData.user.permissions || [];
      this.roles = authData.user.roles || [];

      // Store in localStorage for persistence
      localStorage.setItem('token', authData.token);
      localStorage.setItem('refreshToken', authData.refreshToken);
      localStorage.setItem('user', JSON.stringify(authData.user));
    },

    async login(email: string, password: string) {
      try {
        return await authService.login(email, password);
      } catch (error) {
        throw error;
      }
    },

    async logout() {
      // Clear auth state
      this.isAuthenticated = false;
      this.user = null;
      this.token = null;
      this.refreshToken = null;
      this.permissions = [];
      this.roles = [];

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      // Clear menu items cache
      this.menuStore.clearMenuItemsCache();

      // Clear other caches if needed
      // this.pageStore.clearCache();
      // this.roleStore.clearCache();
      // this.userStore.clearCache();
      // etc.
      
      return await authService.logout();      
    },

    async signup(username: string, email: string, password: string) {
      try {
        return await authService.signup(username, email, password);
      } catch (error) {
        throw error;
      }
    },

    async getRefreshToken() {      
      return await authService.getRefreshToken();       
    },

    initializeFromStorage() {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      const userStr = localStorage.getItem('user');

      if (token && refreshToken && userStr) {
        try {
          const user = JSON.parse(userStr);
          this.setAuth({ user, token, refreshToken });
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          this.logout();
        }
      }
    },

    async checkAuth() {
      try {
        // If no token exists, user is not authenticated
        if (!this.token) {
          //this.logout();
          return false;
        }

        // Check if token is expired
        const tokenData = JSON.parse(atob(this.token.split('.')[1]));
        const isExpired = tokenData.exp * 1000 < Date.now();

        if (isExpired) {
          // Try to refresh the token
          const success = await this.getRefreshToken();
          if (!success) {
            //this.logout();
            return false;
          }
        }

        // Verify the token
        return await authService.verifyAuth(this.token);
      } catch (error) {
        console.error('Auth check failed:', error);
        //this.logout();
        return false;
      }
    }
  }
}); 