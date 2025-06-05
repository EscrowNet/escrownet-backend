import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto, UpdateSettingDto, SettingResponseDto } from './dto/settings.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new setting' })
  @ApiResponse({ status: 201, description: 'Setting created successfully', type: SettingResponseDto })
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all settings' })
  @ApiResponse({ status: 200, description: 'Return all settings', type: [SettingResponseDto] })
  findAll() {
    return this.settingsService.findAll();
  }

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Get public settings' })
  @ApiResponse({ status: 200, description: 'Return public settings' })
  getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  @Get('system')
  @Roles('admin')
  @ApiOperation({ summary: 'Get system settings' })
  @ApiResponse({ status: 200, description: 'Return system settings', type: [SettingResponseDto] })
  getSystemSettings() {
    return this.settingsService.getSystemSettings();
  }

  @Get(':key')
  @Roles('admin')
  @ApiOperation({ summary: 'Get a setting by key' })
  @ApiResponse({ status: 200, description: 'Return the setting', type: SettingResponseDto })
  findOne(@Param('key') key: string) {
    return this.settingsService.findOne(key);
  }

  @Patch(':key')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a setting' })
  @ApiResponse({ status: 200, description: 'Setting updated successfully', type: SettingResponseDto })
  update(@Param('key') key: string, @Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.update(key, updateSettingDto);
  }

  @Delete(':key')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a setting' })
  @ApiResponse({ status: 200, description: 'Setting deleted successfully' })
  remove(@Param('key') key: string) {
    return this.settingsService.remove(key);
  }

  @Get('maintenance-mode/status')
  @Public()
  @ApiOperation({ summary: 'Get maintenance mode status' })
  @ApiResponse({ status: 200, description: 'Return maintenance mode status' })
  getMaintenanceMode() {
    return this.settingsService.isMaintenanceMode();
  }

  @Patch('maintenance-mode')
  @Roles('admin')
  @ApiOperation({ summary: 'Set maintenance mode' })
  @ApiResponse({ status: 200, description: 'Maintenance mode updated successfully' })
  setMaintenanceMode(@Body('enabled') enabled: boolean) {
    return this.settingsService.setMaintenanceMode(enabled);
  }
} 