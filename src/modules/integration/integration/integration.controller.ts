import { Controller, Post, Get, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Integration')
@Controller('integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Post('api')
  @ApiOperation({ summary: 'Register a new API integration' })
  @ApiResponse({ status: 201, description: 'API integration registered successfully' })
  async registerApiIntegration(
    @Body() body: { name: string; apiKey: string; config: Record<string, any> },
  ) {
    return this.integrationService.registerApiIntegration(
      body.name,
      body.apiKey,
      body.config,
    );
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Create a new webhook' })
  @ApiResponse({ status: 201, description: 'Webhook created successfully' })
  async createWebhook(
    @Body()
    body: {
      name: string;
      url: string;
      events: string[];
      secret: string;
    },
  ) {
    return this.integrationService.createWebhook(
      body.name,
      body.url,
      body.events,
      body.secret,
    );
  }

  @Post('webhook/:id/trigger')
  @ApiOperation({ summary: 'Trigger a webhook' })
  @ApiResponse({ status: 200, description: 'Webhook triggered successfully' })
  async triggerWebhook(
    @Param('id') webhookId: string,
    @Body() payload: any,
  ) {
    return this.integrationService.triggerWebhook(webhookId, payload);
  }

  @Get('health/:name')
  @ApiOperation({ summary: 'Get integration health status' })
  @ApiResponse({ status: 200, description: 'Health status retrieved successfully' })
  async getIntegrationHealth(@Param('name') integrationName: string) {
    return this.integrationService.getIntegrationHealth(integrationName);
  }

  @Get('list')
  @ApiOperation({ summary: 'List all integrations' })
  @ApiResponse({ status: 200, description: 'Integrations retrieved successfully' })
  async getAllIntegrations() {
    return this.integrationService.getAllIntegrations();
  }
} 