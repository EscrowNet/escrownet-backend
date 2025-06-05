import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/auth.types';
import { NotificationService } from './notification.service';
import {
  Notification,
  NotificationTemplate,
  NotificationPreferences,
  NotificationFilters,
  NotificationStats,
} from './notification.types';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Send a notification' })
  @ApiResponse({ status: 201, description: 'Notification sent successfully' })
  async sendNotification(
    @Body() notification: Notification,
  ): Promise<Notification> {
    const results = await this.notificationService.sendNotification(notification);
    if (results.some(result => !result.success)) {
      throw new Error('Failed to send notification through some channels');
    }
    return notification;
  }

  @Get()
  @ApiOperation({ summary: 'Get notifications with filters' })
  @ApiResponse({ status: 200, description: 'Returns filtered notifications' })
  async getNotifications(
    @Query() filters: NotificationFilters,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.notificationService.repository.findNotifications(
      filters,
      page,
      limit,
    );
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get notification statistics' })
  @ApiResponse({ status: 200, description: 'Returns notification statistics' })
  async getStats(): Promise<NotificationStats> {
    return this.notificationService.getNotificationStats();
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Param('id') id: string): Promise<void> {
    await this.notificationService.markAsRead(id);
  }

  @Post('templates')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create notification template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async createTemplate(
    @Body() template: NotificationTemplate,
  ): Promise<NotificationTemplate> {
    return this.notificationService.repository.createTemplate(template);
  }

  @Put('templates/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update notification template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  async updateTemplate(
    @Param('id') id: string,
    @Body() template: NotificationTemplate,
  ): Promise<NotificationTemplate> {
    return this.notificationService.repository.updateTemplate(template);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get notification template' })
  @ApiResponse({ status: 200, description: 'Returns notification template' })
  async getTemplate(
    @Param('id') id: string,
  ): Promise<NotificationTemplate | null> {
    return this.notificationService.repository.findTemplateById(id);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  async updatePreferences(
    @Body() preferences: NotificationPreferences,
  ): Promise<NotificationPreferences> {
    return this.notificationService.repository.setPreferences(preferences);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  @ApiResponse({ status: 200, description: 'Returns notification preferences' })
  async getPreferences(
    @Query('userId') userId: string,
  ): Promise<NotificationPreferences | null> {
    return this.notificationService.repository.getPreferences(userId);
  }
} 