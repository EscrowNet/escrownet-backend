import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { KYCService } from './services/kyc.service';
import { WalletService } from './services/wallet.service';
import { ActivityLogService } from './services/activity-log.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPreferencesDto } from './dto/user-preferences.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private kycService: KYCService,
    private walletService: WalletService,
    private activityLogService: ActivityLogService,
  ) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        kyc: true,
        wallets: true,
        preferences: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        email: updateUserDto.email,
        phone: updateUserDto.phone,
        updatedAt: new Date(),
      },
    });

    await this.activityLogService.logActivity(userId, 'PROFILE_UPDATE', {
      updatedFields: Object.keys(updateUserDto),
    });

    return user;
  }

  async updatePreferences(userId: number, preferencesDto: UserPreferencesDto) {
    const preferences = await this.prisma.userPreferences.upsert({
      where: { userId },
      update: {
        emailNotifications: preferencesDto.emailNotifications,
        pushNotifications: preferencesDto.pushNotifications,
        twoFactorEnabled: preferencesDto.twoFactorEnabled,
        language: preferencesDto.language,
      },
      create: {
        userId,
        emailNotifications: preferencesDto.emailNotifications,
        pushNotifications: preferencesDto.pushNotifications,
        twoFactorEnabled: preferencesDto.twoFactorEnabled,
        language: preferencesDto.language,
      },
    });

    await this.activityLogService.logActivity(userId, 'PREFERENCES_UPDATE', {
      updatedFields: Object.keys(preferencesDto),
    });

    return preferences;
  }

  async getActivityLogs(userId: number, page = 1, limit = 10) {
    return this.activityLogService.getUserActivityLogs(userId, page, limit);
  }
} 