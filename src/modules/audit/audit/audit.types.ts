export type AuditEventType =
  | 'USER_ACTION'
  | 'SYSTEM_ACTION'
  | 'SECURITY_EVENT'
  | 'DATA_ACCESS'
  | 'CONFIGURATION_CHANGE'
  | 'INTEGRATION_EVENT';

export type AuditEventSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface AuditEvent {
  id: string;
  timestamp: Date;
  type: AuditEventType;
  action: string;
  userId: string;
  details: Record<string, any>;
  severity: AuditEventSeverity;
  module?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditFilters {
  type?: AuditEventType;
  userId?: string;
  module?: string;
  severity?: AuditEventSeverity;
  startDate?: Date;
  endDate?: Date;
}

export interface AuditPagination {
  page: number;
  limit: number;
}

export interface AuditExportOptions {
  format: 'csv' | 'json';
  filters: AuditFilters;
} 