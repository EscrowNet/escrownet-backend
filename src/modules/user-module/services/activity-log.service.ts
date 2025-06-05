import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export type ActivityType =
  | 'PROFILE_UPDATE'
  | 'PREFERENCES_UPDATE'
  | 'KYC_SUBMISSION'
  | 'WALLET_BINDING'
  | 'WALLET_REMOVAL'
  | 'LOGIN'
  | 'LOGOUT';

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  async logActivity(
    userId: number,
    activityType: ActivityType,
    metadata: Record<string, any> = {},
  ) {
    return this.prisma.activityLog.create({
      data: {
        userId,
        activityType,
        metadata,
      },
    });
  }

  async getUserActivityLogs(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.activityLog.count({
        where: { userId },
      }),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRecentActivity(userId: number, limit = 5) {
    return this.prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
} 