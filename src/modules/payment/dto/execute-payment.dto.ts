import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class ExecutePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsString()
  transactionHash: string;
} 