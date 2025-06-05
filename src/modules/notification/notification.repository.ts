import { Injectable, Logger } from '@nestjs/common';
import {
  Notification,
  NotificationTemplate,
  NotificationPreferences,
  NotificationFilters,
  NotificationStats,
  NotificationQueueItem,
} from './notification.types';

@Injectable()
export class NotificationRepository {
  private readonly logger = new Logger(NotificationRepository.name);
  private notifications: Map<string, Notification> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private queue: Map<string, NotificationQueueItem> = new Map();

  async createNotification(notification: Notification): Promise<Notification> {
    try {
      this.notifications.set(notification.id, notification);
      return notification;
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`);
      throw error;
    }
  }

  async findNotificationById(id: string): Promise<Notification | null> {
    return this.notifications.get(id) || null;
  }

  async findNotifications(
    filters: NotificationFilters,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ notifications: Notification[]; total: number }> {
    try {
      let filteredNotifications = Array.from(this.notifications.values());

      if (filters.userId) {
        filteredNotifications = filteredNotifications.filter(
          notification => notification.userId === filters.userId,
        );
      }
      if (filters.category) {
        filteredNotifications = filteredNotifications.filter(
          notification => notification.category === filters.category,
        );
      }
      if (filters.status) {
        filteredNotifications = filteredNotifications.filter(
          notification => notification.status === filters.status,
        );
      }
      if (filters.priority) {
        filteredNotifications = filteredNotifications.filter(
          notification => notification.priority === filters.priority,
        );
      }
      if (filters.channels && filters.channels.length > 0) {
        filteredNotifications = filteredNotifications.filter(notification =>
          filters.channels!.some(channel =>
            notification.channels.includes(channel),
          ),
        );
      }
      if (filters.fromDate) {
        filteredNotifications = filteredNotifications.filter(
          notification => notification.createdAt >= filters.fromDate!,
        );
      }
      if (filters.toDate) {
        filteredNotifications = filteredNotifications.filter(
          notification => notification.createdAt <= filters.toDate!,
        );
      }
      if (filters.read !== undefined) {
        filteredNotifications = filteredNotifications.filter(
          notification => !!notification.readAt === filters.read,
        );
      }

      // Sort by createdAt in descending order
      filteredNotifications.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );

      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedNotifications = filteredNotifications.slice(start, end);

      return {
        notifications: paginatedNotifications,
        total: filteredNotifications.length,
      };
    } catch (error) {
      this.logger.error(`Failed to find notifications: ${error.message}`);
      throw error;
    }
  }

  async updateNotification(notification: Notification): Promise<Notification> {
    try {
      if (!this.notifications.has(notification.id)) {
        throw new Error('Notification not found');
      }
      this.notifications.set(notification.id, notification);
      return notification;
    } catch (error) {
      this.logger.error(`Failed to update notification: ${error.message}`);
      throw error;
    }
  }

  async createTemplate(template: NotificationTemplate): Promise<NotificationTemplate> {
    try {
      this.templates.set(template.id, template);
      return template;
    } catch (error) {
      this.logger.error(`Failed to create template: ${error.message}`);
      throw error;
    }
  }

  async findTemplateById(id: string): Promise<NotificationTemplate | null> {
    return this.templates.get(id) || null;
  }

  async updateTemplate(template: NotificationTemplate): Promise<NotificationTemplate> {
    try {
      if (!this.templates.has(template.id)) {
        throw new Error('Template not found');
      }
      this.templates.set(template.id, template);
      return template;
    } catch (error) {
      this.logger.error(`Failed to update template: ${error.message}`);
      throw error;
    }
  }

  async setPreferences(preferences: NotificationPreferences): Promise<NotificationPreferences> {
    try {
      this.preferences.set(preferences.userId, preferences);
      return preferences;
    } catch (error) {
      this.logger.error(`Failed to set preferences: ${error.message}`);
      throw error;
    }
  }

  async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    return this.preferences.get(userId) || null;
  }

  async addToQueue(queueItem: NotificationQueueItem): Promise<NotificationQueueItem> {
    try {
      this.queue.set(queueItem.id, queueItem);
      return queueItem;
    } catch (error) {
      this.logger.error(`Failed to add to queue: ${error.message}`);
      throw error;
    }
  }

  async getQueueItem(id: string): Promise<NotificationQueueItem | null> {
    return this.queue.get(id) || null;
  }

  async updateQueueItem(queueItem: NotificationQueueItem): Promise<NotificationQueueItem> {
    try {
      if (!this.queue.has(queueItem.id)) {
        throw new Error('Queue item not found');
      }
      this.queue.set(queueItem.id, queueItem);
      return queueItem;
    } catch (error) {
      this.logger.error(`Failed to update queue item: ${error.message}`);
      throw error;
    }
  }

  async getStats(): Promise<NotificationStats> {
    const notifications = Array.from(this.notifications.values());
    const stats: NotificationStats = {
      total: notifications.length,
      sent: notifications.filter(n => n.status === 'SENT').length,
      failed: notifications.filter(n => n.status === 'FAILED').length,
      delivered: notifications.filter(n => n.status === 'DELIVERED').length,
      read: notifications.filter(n => n.status === 'READ').length,
      byCategory: {
        ESCROW: notifications.filter(n => n.category === 'ESCROW').length,
        KYC: notifications.filter(n => n.category === 'KYC').length,
        SECURITY: notifications.filter(n => n.category === 'SECURITY').length,
        SYSTEM: notifications.filter(n => n.category === 'SYSTEM').length,
        OTHER: notifications.filter(n => n.category === 'OTHER').length,
      },
      byChannel: {
        EMAIL: notifications.filter(n => n.channels.includes('EMAIL')).length,
        PUSH: notifications.filter(n => n.channels.includes('PUSH')).length,
        IN_APP: notifications.filter(n => n.channels.includes('IN_APP')).length,
      },
    };
    return stats;
  }
} 