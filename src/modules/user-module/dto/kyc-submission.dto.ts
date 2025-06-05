import { IsString, IsNotEmpty, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum DocumentType {
  PASSPORT = 'passport',
  NATIONAL_ID = 'national_id',
  DRIVERS_LICENSE = 'drivers_license',
}

export class KYCSubmissionDto {
  @IsEnum(DocumentType)
  @IsNotEmpty()
  documentType: DocumentType;

  @IsString()
  @IsNotEmpty()
  documentNumber: string;

  @IsString()
  @IsNotEmpty()
  documentImageUrl: string;

  @IsString()
  @IsNotEmpty()
  selfieImageUrl: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  dateOfBirth: Date;

  @IsString()
  @IsNotEmpty()
  countryOfResidence: string;
} 