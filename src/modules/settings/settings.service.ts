import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { CreateSettingDto, UpdateSettingDto } from './dto/settings.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class SettingsService {
  private readonly CACHE_PREFIX = 'setting:';
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  private getCacheKey(key: string): string {
    return `${this.CACHE_PREFIX}${key}`;
  }

  async create(createSettingDto: CreateSettingDto): Promise<Setting> {
    const existingSetting = await this.settingsRepository.findOne({
      where: { key: createSettingDto.key },
    });

    if (existingSetting) {
      throw new BadRequestException(`Setting with key ${createSettingDto.key} already exists`);
    }

    const setting = this.settingsRepository.create(createSettingDto);
    const savedSetting = await this.settingsRepository.save(setting);
    
    // Invalidate cache
    await this.cacheManager.del(this.getCacheKey(setting.key));
    
    return savedSetting;
  }

  async findAll(): Promise<Setting[]> {
    return this.settingsRepository.find();
  }

  async findOne(key: string): Promise<Setting> {
    // Try to get from cache first
    const cachedSetting = await this.cacheManager.get<Setting>(this.getCacheKey(key));
    if (cachedSetting) {
      return cachedSetting;
    }

    // If not in cache, get from database
    const setting = await this.settingsRepository.findOne({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key ${key} not found`);
    }

    // Cache the result
    await this.cacheManager.set(this.getCacheKey(key), setting, this.CACHE_TTL);

    return setting;
  }

  async update(key: string, updateSettingDto: UpdateSettingDto): Promise<Setting> {
    const setting = await this.findOne(key);

    if (setting.isSystem && updateSettingDto.value !== undefined) {
      throw new BadRequestException('Cannot update value of system settings');
    }

    Object.assign(setting, updateSettingDto);
    const updatedSetting = await this.settingsRepository.save(setting);

    // Invalidate cache
    await this.cacheManager.del(this.getCacheKey(key));

    return updatedSetting;
  }

  async remove(key: string): Promise<void> {
    const setting = await this.findOne(key);

    if (setting.isSystem) {
      throw new BadRequestException('Cannot delete system settings');
    }

    await this.settingsRepository.remove(setting);
    await this.cacheManager.del(this.getCacheKey(key));
  }

  async getValue<T>(key: string, defaultValue?: T): Promise<T> {
    try {
      const setting = await this.findOne(key);
      return setting.value as T;
    } catch (error) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw error;
    }
  }

  async isMaintenanceMode(): Promise<boolean> {
    return this.getValue<boolean>('maintenance_mode', false);
  }

  async setMaintenanceMode(enabled: boolean): Promise<void> {
    await this.update('maintenance_mode', { value: enabled });
  }

  async getSystemSettings(): Promise<Setting[]> {
    return this.settingsRepository.find({
      where: { isSystem: true },
    });
  }

  async getPublicSettings(): Promise<Setting[]> {
    return this.settingsRepository.find({
      where: { isActive: true },
      select: ['key', 'value', 'description'],
    });
  }
} 