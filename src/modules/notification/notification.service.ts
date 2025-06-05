import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as admin from 'firebase-admin';
import * as Handlebars from 'handlebars';
import {
  Notification,
  NotificationTemplate,
  NotificationPreferences,
  NotificationChannel,
  NotificationStatus,
  NotificationQueueItem,
  NotificationDeliveryResult,
  EmailNotification,
  PushNotification,
  InAppNotification,
} from './notification.types';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private emailTransporter: nodemailer.Transporter;
  private firebaseApp: admin.app.App;

  constructor(
    private readonly repository: NotificationRepository,
    private readonly configService: ConfigService,
  ) {
    this.initializeEmailTransporter();
    this.initializeFirebase();
  }

  private initializeEmailTransporter() {
    const smtpConfig = {
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE'),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    };

    this.emailTransporter = nodemailer.createTransport(smtpConfig);
  }

  private initializeFirebase() {
    const firebaseConfig = {
      credential: admin.credential.cert({
        projectId: this.configService.get('FIREBASE_PROJECT_ID'),
        clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
        privateKey: this.configService.get('FIREBASE_PRIVATE_KEY'),
      }),
    };

    this.firebaseApp = admin.initializeApp(firebaseConfig);
  }

  async sendNotification(
    notification: Notification,
    preferences?: NotificationPreferences,
  ): Promise<NotificationDeliveryResult[]> {
    try {
      // Check user preferences
      const userPreferences = preferences || await this.repository.getPreferences(notification.userId);
      if (!userPreferences) {
        throw new Error('User preferences not found');
      }

      // Filter channels based on user preferences
      const enabledChannels = notification.channels.filter(channel => {
        switch (channel) {
          case 'EMAIL':
            return userPreferences.email;
          case 'PUSH':
            return userPreferences.push;
          case 'IN_APP':
            return userPreferences.inApp;
          default:
            return false;
        }
      });

      if (enabledChannels.length === 0) {
        throw new Error('No enabled notification channels');
      }

      // Check quiet hours
      if (userPreferences.quietHours && this.isInQuietHours(userPreferences.quietHours)) {
        // Add to queue for later delivery
        await this.queueNotification(notification, enabledChannels);
        return enabledChannels.map(channel => ({
          success: true,
          channel,
          metadata: { queued: true },
        }));
      }

      // Send through each enabled channel
      const results = await Promise.all(
        enabledChannels.map(channel => this.sendThroughChannel(notification, channel)),
      );

      // Update notification status
      const allSuccessful = results.every(result => result.success);
      notification.status = allSuccessful ? 'SENT' : 'FAILED';
      await this.repository.updateNotification(notification);

      return results;
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
      throw error;
    }
  }

  private async sendThroughChannel(
    notification: Notification,
    channel: NotificationChannel,
  ): Promise<NotificationDeliveryResult> {
    try {
      switch (channel) {
        case 'EMAIL':
          return await this.sendEmail(notification as EmailNotification);
        case 'PUSH':
          return await this.sendPush(notification as PushNotification);
        case 'IN_APP':
          return await this.sendInApp(notification as InAppNotification);
        default:
          throw new Error(`Unsupported channel: ${channel}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send through ${channel}: ${error.message}`);
      return {
        success: false,
        channel,
        error: error.message,
      };
    }
  }

  private async sendEmail(notification: EmailNotification): Promise<NotificationDeliveryResult> {
    try {
      const template = await this.repository.findTemplateById(notification.templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const compiledSubject = Handlebars.compile(template.subject);
      const compiledBody = Handlebars.compile(template.body);

      const mailOptions = {
        to: notification.to,
        from: notification.from,
        replyTo: notification.replyTo,
        cc: notification.cc,
        bcc: notification.bcc,
        subject: compiledSubject(notification.data),
        html: compiledBody(notification.data),
        attachments: notification.attachments,
      };

      await this.emailTransporter.sendMail(mailOptions);
      return {
        success: true,
        channel: 'EMAIL',
      };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      return {
        success: false,
        channel: 'EMAIL',
        error: error.message,
      };
    }
  }

  private async sendPush(notification: PushNotification): Promise<NotificationDeliveryResult> {
    try {
      const message: admin.messaging.MulticastMessage = {
        tokens: notification.deviceTokens,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data,
        android: notification.android,
        apns: {
          payload: {
            aps: {
              badge: notification.ios?.badge,
              sound: notification.ios?.sound,
              'content-available': notification.ios?.contentAvailable ? 1 : 0,
              'mutable-content': notification.ios?.mutableContent ? 1 : 0,
            },
          },
        },
      };

      const response = await this.firebaseApp.messaging().sendMulticast(message);
      return {
        success: response.successCount > 0,
        channel: 'PUSH',
        metadata: {
          successCount: response.successCount,
          failureCount: response.failureCount,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      return {
        success: false,
        channel: 'PUSH',
        error: error.message,
      };
    }
  }

  private async sendInApp(notification: InAppNotification): Promise<NotificationDeliveryResult> {
    try {
      // Store in-app notification
      await this.repository.createNotification(notification);
      return {
        success: true,
        channel: 'IN_APP',
      };
    } catch (error) {
      this.logger.error(`Failed to send in-app notification: ${error.message}`);
      return {
        success: false,
        channel: 'IN_APP',
        error: error.message,
      };
    }
  }

  private async queueNotification(
    notification: Notification,
    channels: NotificationChannel[],
  ): Promise<void> {
    const queueItem: NotificationQueueItem = {
      id: `${notification.id}-${Date.now()}`,
      notification,
      attempts: 0,
      nextAttempt: this.calculateNextAttempt(notification),
      metadata: { channels },
    };

    await this.repository.addToQueue(queueItem);
  }

  private calculateNextAttempt(notification: Notification): Date {
    // Implement retry logic with exponential backoff
    const baseDelay = 5 * 60 * 1000; // 5 minutes
    const maxDelay = 24 * 60 * 60 * 1000; // 24 hours
    const delay = Math.min(baseDelay * Math.pow(2, notification.priority === 'HIGH' ? 0 : 1), maxDelay);
    return new Date(Date.now() + delay);
  }

  private isInQuietHours(quietHours: { start: string; end: string; timezone: string }): boolean {
    const now = new Date();
    const [startHour, startMinute] = quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = quietHours.end.split(':').map(Number);

    const startTime = new Date(now);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(now);
    endTime.setHours(endHour, endMinute, 0, 0);

    return now >= startTime && now <= endTime;
  }

  async processQueue(): Promise<void> {
    try {
      const queueItems = Array.from(this.repository['queue'].values())
        .filter(item => item.nextAttempt <= new Date())
        .sort((a, b) => a.nextAttempt.getTime() - b.nextAttempt.getTime());

      for (const item of queueItems) {
        try {
          const results = await this.sendNotification(
            item.notification,
            await this.repository.getPreferences(item.notification.userId),
          );

          const allSuccessful = results.every(result => result.success);
          if (allSuccessful) {
            await this.repository['queue'].delete(item.id);
          } else {
            item.attempts++;
            item.nextAttempt = this.calculateNextAttempt(item.notification);
            item.lastError = results.find(r => !r.success)?.error;
            await this.repository.updateQueueItem(item);
          }
        } catch (error) {
          this.logger.error(`Failed to process queue item: ${error.message}`);
          item.attempts++;
          item.nextAttempt = this.calculateNextAttempt(item.notification);
          item.lastError = error.message;
          await this.repository.updateQueueItem(item);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to process queue: ${error.message}`);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = await this.repository.findNotificationById(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.status = 'READ';
    notification.readAt = new Date();
    await this.repository.updateNotification(notification);
  }

  async getNotificationStats(): Promise<NotificationStats> {
    return this.repository.getStats();
  }
} 