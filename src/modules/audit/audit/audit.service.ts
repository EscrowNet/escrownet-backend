import { Injectable, Logger } from '@nestjs/common';
import { AuditRepository } from './audit.repository';
import { AuditEvent, AuditEventType, AuditEventSeverity } from './audit.types';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly auditRepository: AuditRepository) {}

  async logEvent(
    type: AuditEventType,
    action: string,
    userId: string,
    details: Record<string, any>,
    severity: AuditEventSeverity = 'INFO',
    module?: string,
  ): Promise<AuditEvent> {
    try {
      const event: AuditEvent = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date(),
        type,
        action,
        userId,
        details,
        severity,
        module,
        ipAddress: details.ipAddress,
        userAgent: details.userAgent,
      };

      await this.auditRepository.create(event);
      return event;
    } catch (error) {
      this.logger.error(`Failed to log audit event: ${error.message}`);
      throw error;
    }
  }

  async getEvents(
    filters: {
      type?: AuditEventType;
      userId?: string;
      module?: string;
      severity?: AuditEventSeverity;
      startDate?: Date;
      endDate?: Date;
    },
    page: number = 1,
    limit: number = 50,
  ): Promise<{ events: AuditEvent[]; total: number }> {
    return this.auditRepository.find(filters, page, limit);
  }

  async exportEvents(
    filters: {
      type?: AuditEventType;
      userId?: string;
      module?: string;
      severity?: AuditEventSeverity;
      startDate?: Date;
      endDate?: Date;
    },
    format: 'csv' | 'json' = 'json',
  ): Promise<string> {
    const events = await this.auditRepository.findAll(filters);
    
    if (format === 'csv') {
      return this.convertToCSV(events);
    }
    
    return JSON.stringify(events, null, 2);
  }

  private convertToCSV(events: AuditEvent[]): string {
    if (events.length === 0) return '';

    const headers = [
      'ID',
      'Timestamp',
      'Type',
      'Action',
      'User ID',
      'Severity',
      'Module',
      'IP Address',
      'User Agent',
      'Details',
    ];

    const rows = events.map(event => [
      event.id,
      event.timestamp.toISOString(),
      event.type,
      event.action,
      event.userId,
      event.severity,
      event.module || '',
      event.ipAddress || '',
      event.userAgent || '',
      JSON.stringify(event.details),
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');
  }
} 