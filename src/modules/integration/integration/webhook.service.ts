import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  createdAt: Date;
  lastTriggered?: Date;
  status: 'active' | 'inactive';
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private webhooks: Map<string, Webhook> = new Map();

  constructor(private readonly configService: ConfigService) {}

  async createWebhook(
    name: string,
    url: string,
    events: string[],
    secret: string,
  ): Promise<Webhook> {
    const webhook: Webhook = {
      id: Math.random().toString(36).substring(7),
      name,
      url,
      events,
      secret,
      createdAt: new Date(),
      status: 'active',
    };

    this.webhooks.set(webhook.id, webhook);
    return webhook;
  }

  async triggerWebhook(webhookId: string, payload: any): Promise<boolean> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    try {
      const maxRetries = this.configService.get<number>('WEBHOOK_MAX_RETRIES') || 3;
      let retryCount = 0;

      while (retryCount < maxRetries) {
        try {
          await axios.post(webhook.url, payload, {
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': this.generateSignature(payload, webhook.secret),
            },
          });

          webhook.lastTriggered = new Date();
          this.webhooks.set(webhookId, webhook);
          return true;
        } catch (error) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    } catch (error) {
      this.logger.error(`Failed to trigger webhook ${webhookId}: ${error.message}`);
      throw error;
    }
  }

  private generateSignature(payload: any, secret: string): string {
    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  async getWebhook(webhookId: string): Promise<Webhook | null> {
    return this.webhooks.get(webhookId) || null;
  }

  async listWebhooks(): Promise<Webhook[]> {
    return Array.from(this.webhooks.values());
  }

  async updateWebhookStatus(webhookId: string, status: 'active' | 'inactive'): Promise<Webhook> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    webhook.status = status;
    this.webhooks.set(webhookId, webhook);
    return webhook;
  }
} 