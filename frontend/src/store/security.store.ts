import { defineStore } from 'pinia';
import { SecuritySettings, SecurityState, AuditLog, AuditLogFilters } from '@/store/models';
import { securityService } from './services/security.service';

export const useSecurityStore = defineStore('security', {
  state: (): SecurityState => ({
    settings: null,
    auditLogs: [] as AuditLog[],
    errorMessage: null,
    isLoading: false
  }),

  getters: {    
  },

  actions: {
    async getAuditLogs(filters: AuditLogFilters) {
        try {
          return await securityService.getAuditLogs(filters);
        } catch (error) {
          throw error;
        }
      },
    
      async getSecuritySettings() {
        try {
          return await securityService.getSecuritySettings();
        } catch (error) {
          throw error;
        }
      },
    
      async updateSecuritySettings(settings: Partial<SecuritySettings>) {
        try {
          return await securityService.updateSecuritySettings(settings);
        } catch (error) {
          throw error;
        }
      }    
  }
}); 