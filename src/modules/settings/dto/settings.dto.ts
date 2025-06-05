import { IsString, IsOptional, IsBoolean, IsArray, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSettingDto {
  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsObject()
  value: any;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  allowedRoles?: string[];
}

export class UpdateSettingDto {
  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  value?: any;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  allowedRoles?: string[];
}

export class SettingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  value: any;

  @ApiProperty()
  isSystem: boolean;

  @ApiProperty()
  description: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: [String] })
  allowedRoles: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
} 