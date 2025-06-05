import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('metrics/escrow-activity')
  async getEscrowActivityMetrics(@Query('timeframe') timeframe: string) {
    return this.analyticsService.getEscrowActivityMetrics(timeframe);
  }

  @Get('metrics/transaction-volume')
  async getTransactionVolumeMetrics(@Query('timeframe') timeframe: string) {
    return this.analyticsService.getTransactionVolumeMetrics(timeframe);
  }

  @Get('metrics/disputes')
  async getDisputeMetrics(@Query('timeframe') timeframe: string) {
    return this.analyticsService.getDisputeMetrics(timeframe);
  }

  @Post('reports/custom')
  async generateCustomReport(
    @Body() params: {
      metrics: string[];
      timeframe: string;
      format: 'json' | 'csv';
    },
  ) {
    return this.analyticsService.generateCustomReport(params);
  }
} 