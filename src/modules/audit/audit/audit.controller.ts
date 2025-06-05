import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Headers,
  Res,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuditEventType, AuditEventSeverity } from './audit.types';

@ApiTags('Audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('events')
  @ApiOperation({ summary: 'Get audit events with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated audit events' })
  async getEvents(
    @Query('type') type?: AuditEventType,
    @Query('userId') userId?: string,
    @Query('module') module?: string,
    @Query('severity') severity?: AuditEventSeverity,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.getEvents(
      {
        type,
        userId,
        module,
        severity,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get('export')
  @ApiOperation({ summary: 'Export audit events' })
  @ApiResponse({ status: 200, description: 'Returns exported audit events' })
  async exportEvents(
    @Query('type') type?: AuditEventType,
    @Query('userId') userId?: string,
    @Query('module') module?: string,
    @Query('severity') severity?: AuditEventSeverity,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format: 'csv' | 'json' = 'json',
    @Res() res: Response,
  ) {
    const data = await this.auditService.exportEvents(
      {
        type,
        userId,
        module,
        severity,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      format,
    );

    const filename = `audit-export-${new Date().toISOString()}.${format}`;
    const contentType = format === 'csv' ? 'text/csv' : 'application/json';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(data);
  }

  @Post('log')
  @ApiOperation({ summary: 'Log an audit event' })
  @ApiResponse({ status: 201, description: 'Audit event logged successfully' })
  async logEvent(
    @Body()
    body: {
      type: AuditEventType;
      action: string;
      userId: string;
      details: Record<string, any>;
      severity?: AuditEventSeverity;
      module?: string;
    },
    @Headers('x-forwarded-for') ipAddress?: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.auditService.logEvent(
      body.type,
      body.action,
      body.userId,
      { ...body.details, ipAddress, userAgent },
      body.severity,
      body.module,
    );
  }
} 