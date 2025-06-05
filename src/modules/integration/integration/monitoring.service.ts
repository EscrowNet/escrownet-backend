import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  lastChecked: Date;
  errorCount: number;
  lastError?: string;
  responseTime?: number;
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private healthStatuses: Map<string, HealthStatus> = new Map();
  private readonly checkInterval: number;

  constructor(private readonly configService: ConfigService) {
    this.checkInterval = this.configService.get<number>('HEALTH_CHECK_INTERVAL') || 60000;
    this.startHealthChecks();
  }

  private startHealthChecks() {
    setInterval(() => {
      this.healthStatuses.forEach((status, integrationName) => {
        this.performHealthCheck(integrationName);
      });
    }, this.checkInterval);
  }

  async initializeHealthCheck(integrationName: string): Promise<void> {
    this.healthStatuses.set(integrationName, {
      status: 'healthy',
      lastChecked: new Date(),
      errorCount: 0,
    });
  }

  private async performHealthCheck(integrationName: string): Promise<void> {
    try {
      const startTime = Date.now();
      // Implement actual health check logic here
      // This could be an API call, database check, etc.
      const responseTime = Date.now() - startTime;

      const status = this.healthStatuses.get(integrationName);
      if (status) {
        status.lastChecked = new Date();
        status.responseTime = responseTime;
        status.status = 'healthy';
        this.healthStatuses.set(integrationName, status);
      }
    } catch (error) {
      this.logger.error(`Health check failed for ${integrationName}: ${error.message}`);
      this.recordError(integrationName, error.message);
    }
  }

  async getHealthStatus(integrationName: string): Promise<HealthStatus | null> {
    return this.healthStatuses.get(integrationName) || null;
  }

  async recordError(integrationName: string, error: string): Promise<void> {
    const status = this.healthStatuses.get(integrationName);
    if (status) {
      status.errorCount++;
      status.lastError = error;
      status.status = 'unhealthy';
      this.healthStatuses.set(integrationName, status);
    }
  }

  async getAllHealthStatuses(): Promise<Map<string, HealthStatus>> {
    return this.healthStatuses;
  }

  async resetErrorCount(integrationName: string): Promise<void> {
    const status = this.healthStatuses.get(integrationName);
    if (status) {
      status.errorCount = 0;
      status.status = 'healthy';
      this.healthStatuses.set(integrationName, status);
    }
  }
} 