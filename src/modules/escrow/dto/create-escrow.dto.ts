import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EscrowType } from '../entities/escrow.entity';

export class ReleaseConditionDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  parameters?: Record<string, any>;
}

export class CreateEscrowDto {
  @IsString()
  @IsNotEmpty()
  buyerAddress: string;

  @IsString()
  @IsNotEmpty()
  sellerAddress: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsEnum(EscrowType)
  type: EscrowType;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReleaseConditionDto)
  releaseConditions?: ReleaseConditionDto[];

  @IsOptional()
  @IsString()
  arbitratorAddress?: string;

  @IsOptional()
  @Type(() => Date)
  releaseDate?: Date;

  @IsOptional()
  @Type(() => Date)
  expiryDate?: Date;
}
