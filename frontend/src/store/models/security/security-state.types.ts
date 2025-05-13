import { SecuritySettings } from './security-settings.types';
import { AuditLog } from './audit-log.types';

export interface SecurityState {
  settings: SecuritySettings | null;
  auditLogs: AuditLog[];
  errorMessage: string | null;
  isLoading: boolean;
} 