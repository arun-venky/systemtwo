import { defineStore } from 'pinia';
import { User, UserFormData, UserState } from '@/store/models';
import { userService } from './services/user.service';

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    users: [],
    selectedUser: null,
    errorMessage: null,
    isLoading: false,
    formData: {}
  }),

  getters: {    
  },

  actions: {
    async fetchUsers() {
        try {
          return await userService.fetchUsers();
        } catch (error) {
          console.error('User Error: Failed to fetch users', error);
          throw error;
        }
      },
    
      async getUserById(id: string) {
        try {
          return await userService.getUserById(id);
        } catch (error) {
          console.error('User Error: Failed to get user', error);
          throw error;
        }
      },
    
      async createUser(userData: UserFormData) {
        try {
          // Validate required fields
          if (!userData.username || !userData.email || !userData.password) {
            throw new Error('Missing required fields');
          }
          return await userService.createUser(userData);
        } catch (error) {
          console.error('User Error: Failed to create user', error);
          throw error;
        }
      },
    
      async updateUser(id: string, userData: UserFormData) {
        try {
          // Validate that at least one field is being updated
          if (!userData.username && !userData.email && !userData.password) {
            throw new Error('No fields to update');
          }
          return await userService.updateUser(id, userData);
        } catch (error) {
          console.error('User Error: Failed to update user', error);
          throw error;
        }
      },
    
      async deleteUser(id: string) {
        try {
          return await userService.deleteUser(id);
        } catch (error) {
          console.error('User Error: Failed to delete user', error);
          throw error;
        }
      },
    
      async verifyEmail(token: string) {
        try {
          return await userService.verifyEmail(token);
        } catch (error) {
          console.error('User Error: Failed to verify email', error);
          throw error;
        }
      },
    
      async resendVerificationEmail(email: string) {
        try {
          return await userService.resendVerificationEmail(email);
        } catch (error) {
          console.error('User Error: Failed to resend verification email', error);
          throw error;
        }
      },
    
      async changePassword(currentPassword: string, newPassword: string) {
        try {
          return await userService.changePassword(currentPassword, newPassword);
        } catch (error) {
          console.error('User Error: Failed to change password', error);
          throw error;
        }
      },
    
      async updateProfile(userData: Partial<User>) {
        try {
          return await userService.updateProfile(userData);
        } catch (error) {
          console.error('User Error: Failed to update profile', error);
          throw error;
        }
      },
    
      async requestPasswordReset(email: string) {
        try {
          return await userService.requestPasswordReset(email);
        } catch (error) {
          console.error('User Error: Failed to request password reset', error);
          throw error;
        }
      },
    
      async resetPassword(token: string, newPassword: string) {
        try {
          return await userService.resetPassword(token, newPassword);
        } catch (error) {
          console.error('User Error: Failed to reset password', error);
          throw error;
        }
      }    
  }
}); 