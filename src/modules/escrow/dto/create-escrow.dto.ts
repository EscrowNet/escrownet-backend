import { IsString, IsNumber, IsNotEmpty, IsDateString } from "class-validator";

export class CreateEscrowDto {
    @IsString()
    @IsNotEmpty()
    sellerAddress: string;

    @IsString()
    @IsNotEmpty()
    buyerAddress: string;

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsString()
    @IsNotEmpty()
    tokenAddress: string;

    @IsDateString()
    @IsNotEmpty()
    deadline: string;

    @IsString()
    @IsNotEmpty()
    conditions: string;
}
