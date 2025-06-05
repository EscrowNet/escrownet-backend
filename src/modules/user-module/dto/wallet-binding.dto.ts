import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum WalletType {
  STARKNET = 'starknet',
  ETHEREUM = 'ethereum',
}

export class WalletBindingDto {
  @IsEnum(WalletType)
  @IsNotEmpty()
  walletType: WalletType;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  signature: string;

  @IsString()
  @IsNotEmpty()
  message: string;
} 