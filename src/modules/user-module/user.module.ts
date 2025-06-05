import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../../database/prisma.service';
import { KYCService } from './services/kyc.service';
import { WalletService } from './services/wallet.service';
import { ActivityLogService } from './services/activity-log.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService,
    KYCService,
    WalletService,
    ActivityLogService,
  ],
  exports: [UserService],
})
export class UserModule {} 