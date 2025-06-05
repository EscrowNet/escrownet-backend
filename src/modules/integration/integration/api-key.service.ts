import { Injectable, Logger } from '@nestjs/common';

interface ApiIntegration {
  id: string;
  name: string;
  encryptedKey: string;
  config: Record<string, any>;
  createdAt: Date;
  lastUsed?: Date;
  status: 'active' | 'inactive';
}

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);
  private integrations: Map<string, ApiIntegration> = new Map();

  async storeApiKey(
    name: string,
    encryptedKey: string,
    config: Record<string, any>,
  ): Promise<ApiIntegration> {
    const integration: ApiIntegration = {
      id: Math.random().toString(36).substring(7),
      name,
      encryptedKey,
      config,
      createdAt: new Date(),
      status: 'active',
    };

    this.integrations.set(integration.id, integration);
    return integration;
  }

  async getApiKey(integrationId: string): Promise<string | null> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      return null;
    }
    return integration.encryptedKey;
  }

  async updateIntegrationConfig(
    integrationId: string,
    config: Record<string, any>,
  ): Promise<ApiIntegration> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    integration.config = { ...integration.config, ...config };
    this.integrations.set(integrationId, integration);
    return integration;
  }

  async getAllIntegrations(): Promise<ApiIntegration[]> {
    return Array.from(this.integrations.values());
  }

  async updateIntegrationStatus(
    integrationId: string,
    status: 'active' | 'inactive',
  ): Promise<ApiIntegration> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    integration.status = status;
    this.integrations.set(integrationId, integration);
    return integration;
  }

  async recordApiUsage(integrationId: string): Promise<void> {
    const integration = this.integrations.get(integrationId);
    if (integration) {
      integration.lastUsed = new Date();
      this.integrations.set(integrationId, integration);
    }
  }
} 