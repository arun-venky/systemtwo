import { ref, computed } from 'vue';
import { SecuritySettings, AuditLog, AuditLogFilters } from '@/store/models';
import { useMachine } from '@xstate/vue';
import { createSecurityMachine } from '../machines/securityMachine';

export function useSecurityManagement() {
  const { state, send } = useMachine(createSecurityMachine());
  const showSettingsModal = ref(false);
  const showAuditLogModal = ref(false);
  const selectedSettings = ref<SecuritySettings | null>(null);
  const auditLogs = ref<AuditLog[]>([]);
  const auditLogFilters = ref<AuditLogFilters>({
    startDate: undefined,
    endDate: undefined,
    action: undefined,
    userId: undefined,
    ipAddress: undefined,
    page: 1,
    limit: 10
  });

  // Computed properties
  const isLoading = computed(() => state.value.matches('loading'));
  const hasError = computed(() => state.value.matches('error'));
  const errorMessage = computed(() => state.value.context.errorMessage);
  const currentSettings = computed(() => state.value.context.settings);
  const currentAuditLogs = computed(() => state.value.context.auditLogs);

  const isCurrentState = (stateName: "idle" | "loading" | "creating" | "editing" | "deleting" | "error") => 
    state.value.hasTag(stateName);

  const raiseEvent = (event: string, data?: any) => {
    send({ type: event, ...data });
  };

  // Security Settings Management
  const openSettingsModal = async () => {
    try {
      send('FETCH');
      selectedSettings.value = currentSettings.value;
      showSettingsModal.value = true;
    } catch (error) {
      console.error('Failed to fetch security settings:', error);
      send({ type: 'ERROR', error });
    }
  };

  const updateSecuritySettings = async (settings: Partial<SecuritySettings>) => {
    try {
      send({ type: 'UPDATE_SETTINGS', settings });
      showSettingsModal.value = false;
    } catch (error) {
      console.error('Failed to update security settings:', error);
      send({ type: 'ERROR', error });
    }
  };

  // Audit Log Management
  const openAuditLogModal = async () => {
    try {
      send({ type: 'GET_AUDIT_LOGS', filters: auditLogFilters.value });
      auditLogs.value = currentAuditLogs.value;
      showAuditLogModal.value = true;
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      send({ type: 'ERROR', error });
    }
  };

  const applyAuditLogFilters = async () => {
    try {
      send({ type: 'GET_AUDIT_LOGS', filters: auditLogFilters.value });
      auditLogs.value = currentAuditLogs.value;
    } catch (error) {
      console.error('Failed to apply audit log filters:', error);
      send({ type: 'ERROR', error });
    }
  };

  const clearAuditLogFilters = () => {
    auditLogFilters.value = {
      startDate: undefined,
      endDate: undefined,
      action: undefined,
      userId: undefined,
      ipAddress: undefined,
      page: 1,
      limit: 10
    };
    applyAuditLogFilters();
  };

  const loadMoreLogs = async () => {
    try {
      auditLogFilters.value.page = (auditLogFilters.value.page || 1) + 1;
      send({ type: 'GET_AUDIT_LOGS', filters: auditLogFilters.value });
      auditLogs.value = [...auditLogs.value, ...currentAuditLogs.value];
    } catch (error) {
      console.error('Failed to load more logs:', error);
      send({ type: 'ERROR', error });
    }
  };

  // Export functionality
  const exportAuditLogs = async () => {
    try {
      const exportFilters = {
        ...auditLogFilters.value,
        limit: 1000 // Export more logs
      };
      send({ type: 'GET_AUDIT_LOGS', filters: exportFilters });
      const logs = currentAuditLogs.value;
      
      const csvContent = convertLogsToCSV(logs);
      downloadCSV(csvContent, 'audit-logs.csv');
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      send({ type: 'ERROR', error });
    }
  };

  // Helper functions
  const convertLogsToCSV = (logs: AuditLog[]) => {
    const headers = ['Timestamp', 'User ID', 'Action', 'Resource', 'Details', 'IP Address'];
    const rows = logs.map(log => [
      new Date(log.timestamp).toISOString(),
      log.userId,
      log.action,
      log.resource,
      JSON.stringify(log.details),
      log.ipAddress
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    // State
    state,
    isLoading,
    hasError,
    errorMessage,
    showSettingsModal,
    showAuditLogModal,
    selectedSettings,
    auditLogs,
    auditLogFilters,
    currentSettings,
    currentAuditLogs,

    // Methods
    isCurrentState,
    raiseEvent,
    openSettingsModal,
    updateSecuritySettings,
    openAuditLogModal,
    applyAuditLogFilters,
    clearAuditLogFilters,
    loadMoreLogs,
    exportAuditLogs
  };
} 