import { Injectable, Logger } from '@nestjs/common';
import { AuditEvent, AuditFilters } from './audit.types';

@Injectable()
export class AuditRepository {
  private readonly logger = new Logger(AuditRepository.name);
  private events: AuditEvent[] = [];

  async create(event: AuditEvent): Promise<AuditEvent> {
    try {
      this.events.push(event);
      return event;
    } catch (error) {
      this.logger.error(`Failed to create audit event: ${error.message}`);
      throw error;
    }
  }

  async find(
    filters: AuditFilters,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ events: AuditEvent[]; total: number }> {
    try {
      let filteredEvents = this.events;

      if (filters.type) {
        filteredEvents = filteredEvents.filter(event => event.type === filters.type);
      }
      if (filters.userId) {
        filteredEvents = filteredEvents.filter(event => event.userId === filters.userId);
      }
      if (filters.module) {
        filteredEvents = filteredEvents.filter(event => event.module === filters.module);
      }
      if (filters.severity) {
        filteredEvents = filteredEvents.filter(event => event.severity === filters.severity);
      }
      if (filters.startDate) {
        filteredEvents = filteredEvents.filter(
          event => event.timestamp >= filters.startDate!,
        );
      }
      if (filters.endDate) {
        filteredEvents = filteredEvents.filter(
          event => event.timestamp <= filters.endDate!,
        );
      }

      // Sort by timestamp in descending order
      filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedEvents = filteredEvents.slice(start, end);

      return {
        events: paginatedEvents,
        total: filteredEvents.length,
      };
    } catch (error) {
      this.logger.error(`Failed to find audit events: ${error.message}`);
      throw error;
    }
  }

  async findAll(filters: AuditFilters): Promise<AuditEvent[]> {
    try {
      let filteredEvents = this.events;

      if (filters.type) {
        filteredEvents = filteredEvents.filter(event => event.type === filters.type);
      }
      if (filters.userId) {
        filteredEvents = filteredEvents.filter(event => event.userId === filters.userId);
      }
      if (filters.module) {
        filteredEvents = filteredEvents.filter(event => event.module === filters.module);
      }
      if (filters.severity) {
        filteredEvents = filteredEvents.filter(event => event.severity === filters.severity);
      }
      if (filters.startDate) {
        filteredEvents = filteredEvents.filter(
          event => event.timestamp >= filters.startDate!,
        );
      }
      if (filters.endDate) {
        filteredEvents = filteredEvents.filter(
          event => event.timestamp <= filters.endDate!,
        );
      }

      return filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      this.logger.error(`Failed to find all audit events: ${error.message}`);
      throw error;
    }
  }
} 