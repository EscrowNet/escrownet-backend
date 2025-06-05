import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth-module/guards/jwt-auth.guard';
import { RolesGuard } from '../auth-module/guards/roles.guard';
import { Roles } from '../auth-module/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPreferencesDto } from './dto/user-preferences.dto';
import { KYCSubmissionDto } from './dto/kyc-submission.dto';
import { WalletBindingDto } from './dto/wallet-binding.dto';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER, UserRole.ADMIN)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    return this.userService.getProfile(req.user.userId);
  }

  @Put('profile')
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateProfile(req.user.userId, updateUserDto);
  }

  @Put('preferences')
  async updatePreferences(
    @Request() req,
    @Body() preferencesDto: UserPreferencesDto,
  ) {
    return this.userService.updatePreferences(req.user.userId, preferencesDto);
  }

  @Post('kyc')
  async submitKYC(
    @Request() req,
    @Body() kycSubmissionDto: KYCSubmissionDto,
  ) {
    return this.userService.kycService.submitKYC(req.user.userId, kycSubmissionDto);
  }

  @Post('wallet')
  async bindWallet(
    @Request() req,
    @Body() walletBindingDto: WalletBindingDto,
  ) {
    return this.userService.walletService.bindWallet(
      req.user.userId,
      walletBindingDto,
    );
  }

  @Get('activity')
  async getActivityLogs(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.userService.getActivityLogs(req.user.userId, page, limit);
  }
} 