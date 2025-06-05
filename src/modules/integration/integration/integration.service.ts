import { Injectable, Logger } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { ApiKeyService } from './api-key.service';
import { MonitoringService } from './monitoring.service';
import { EncryptionService } from './encryption.service';

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);

  constructor(
    private readonly webhookService: WebhookService,
    private readonly apiKeyService: ApiKeyService,
    private readonly monitoringService: MonitoringService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async registerApiIntegration(
    name: string,
    apiKey: string,
    config: Record<string, any>,
  ) {
    try {
      const encryptedKey = await this.encryptionService.encrypt(apiKey);
      await this.apiKeyService.storeApiKey(name, encryptedKey, config);
      await this.monitoringService.initializeHealthCheck(name);
      return { success: true, message: 'API integration registered successfully' };
    } catch (error) {
      this.logger.error(`Failed to register API integration: ${error.message}`);
      throw error;
    }
  }

  async createWebhook(
    name: string,
    url: string,
    events: string[],
    secret: string,
  ) {
    try {
      const encryptedSecret = await this.encryptionService.encrypt(secret);
      return await this.webhookService.createWebhook(name, url, events, encryptedSecret);
    } catch (error) {
      this.logger.error(`Failed to create webhook: ${error.message}`);
      throw error;
    }
  }

  async triggerWebhook(webhookId: string, payload: any) {
    try {
      return await this.webhookService.triggerWebhook(webhookId, payload);
    } catch (error) {
      this.logger.error(`Failed to trigger webhook: ${error.message}`);
      throw error;
    }
  }

  async getIntegrationHealth(integrationName: string) {
    return await this.monitoringService.getHealthStatus(integrationName);
  }

  async getAllIntegrations() {
    return await this.apiKeyService.getAllIntegrations();
  }
} 