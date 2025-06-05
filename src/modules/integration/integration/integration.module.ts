import { Module } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { IntegrationController } from './integration.controller';
import { WebhookService } from './webhook.service';
import { ApiKeyService } from './api-key.service';
import { MonitoringService } from './monitoring.service';
import { ConfigModule } from '@nestjs/config';
import { EncryptionService } from './encryption.service';

@Module({
  imports: [ConfigModule],
  controllers: [IntegrationController],
  providers: [
    IntegrationService,
    WebhookService,
    ApiKeyService,
    MonitoringService,
    EncryptionService,
  ],
  exports: [IntegrationService],
})
export class IntegrationModule {} 