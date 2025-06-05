import { IsBoolean, IsString, IsOptional } from 'class-validator';

export class UserPreferencesDto {
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  twoFactorEnabled?: boolean;

  @IsString()
  @IsOptional()
  language?: string;
} 