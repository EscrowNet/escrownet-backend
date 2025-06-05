export type NotificationChannel = 'EMAIL' | 'PUSH' | 'IN_APP';
export type NotificationPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED' | 'READ';
export type NotificationCategory = 'ESCROW' | 'KYC' | 'SECURITY' | 'SYSTEM' | 'OTHER';

export interface NotificationTemplate {
  id: string;
  name: string;
  category: NotificationCategory;
  channels: NotificationChannel[];
  subject: string;
  body: string;
  variables: string[];
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
  categories: {
    [key in NotificationCategory]: boolean;
  };
  quietHours?: {
    start: string; // HH:mm format
    end: string; // HH:mm format
    timezone: string;
  };
  metadata?: Record<string, any>;
}

export interface Notification {
  id: string;
  userId: string;
  templateId: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  status: NotificationStatus;
  subject: string;
  body: string;
  data: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
}

export interface EmailNotification extends Notification {
  to: string;
  from: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: {
    filename: string;
    content: Buffer;
    contentType: string;
  }[];
}

export interface PushNotification extends Notification {
  deviceTokens: string[];
  title: string;
  icon?: string;
  badge?: number;
  sound?: string;
  clickAction?: string;
  android?: {
    channelId?: string;
    priority?: 'high' | 'normal';
    ttl?: number;
  };
  ios?: {
    badge?: number;
    sound?: string;
    contentAvailable?: boolean;
    mutableContent?: boolean;
  };
}

export interface InAppNotification extends Notification {
  read: boolean;
  archived: boolean;
  expiresAt?: Date;
}

export interface NotificationFilters {
  userId?: string;
  category?: NotificationCategory;
  status?: NotificationStatus;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  fromDate?: Date;
  toDate?: Date;
  read?: boolean;
}

export interface NotificationPagination {
  page: number;
  limit: number;
}

export interface NotificationStats {
  total: number;
  sent: number;
  failed: number;
  delivered: number;
  read: number;
  byCategory: {
    [key in NotificationCategory]: number;
  };
  byChannel: {
    [key in NotificationChannel]: number;
  };
}

export interface NotificationQueueItem {
  id: string;
  notification: Notification;
  attempts: number;
  nextAttempt: Date;
  lastError?: string;
  metadata?: Record<string, any>;
}

export interface NotificationDeliveryResult {
  success: boolean;
  channel: NotificationChannel;
  error?: string;
  metadata?: Record<string, any>;
} 