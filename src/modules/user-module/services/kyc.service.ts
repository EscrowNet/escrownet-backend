import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';
import { KYCSubmissionDto } from '../dto/kyc-submission.dto';
import axios from 'axios';

@Injectable()
export class KYCService {
  private readonly jumioApiUrl: string;
  private readonly jumioApiToken: string;
  private readonly jumioApiSecret: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.jumioApiUrl = this.configService.get<string>('JUMIO_API_URL');
    this.jumioApiToken = this.configService.get<string>('JUMIO_API_TOKEN');
    this.jumioApiSecret = this.configService.get<string>('JUMIO_API_SECRET');
  }

  async submitKYC(userId: number, kycSubmissionDto: KYCSubmissionDto) {
    // Check if user already has a pending or approved KYC
    const existingKYC = await this.prisma.kYC.findFirst({
      where: {
        userId,
        status: {
          in: ['PENDING', 'APPROVED'],
        },
      },
    });

    if (existingKYC) {
      throw new BadRequestException('User already has a pending or approved KYC');
    }

    // Submit to Jumio for verification
    const jumioResponse = await this.submitToJumio(kycSubmissionDto);

    // Create KYC record in database
    const kyc = await this.prisma.kYC.create({
      data: {
        userId,
        documentType: kycSubmissionDto.documentType,
        documentNumber: kycSubmissionDto.documentNumber,
        documentImageUrl: kycSubmissionDto.documentImageUrl,
        selfieImageUrl: kycSubmissionDto.selfieImageUrl,
        dateOfBirth: kycSubmissionDto.dateOfBirth,
        countryOfResidence: kycSubmissionDto.countryOfResidence,
        status: 'PENDING',
        jumioReference: jumioResponse.reference,
      },
    });

    return kyc;
  }

  private async submitToJumio(kycSubmissionDto: KYCSubmissionDto) {
    try {
      const response = await axios.post(
        `${this.jumioApiUrl}/api/v1/verification`,
        {
          customerInternalReference: kycSubmissionDto.documentNumber,
          userReference: kycSubmissionDto.documentNumber,
          documentType: kycSubmissionDto.documentType,
          documentNumber: kycSubmissionDto.documentNumber,
          documentImageUrl: kycSubmissionDto.documentImageUrl,
          selfieImageUrl: kycSubmissionDto.selfieImageUrl,
          dateOfBirth: kycSubmissionDto.dateOfBirth,
          countryOfResidence: kycSubmissionDto.countryOfResidence,
        },
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(
              `${this.jumioApiToken}:${this.jumioApiSecret}`,
            ).toString('base64')}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new BadRequestException('Failed to submit KYC to verification service');
    }
  }

  async getKYCStatus(userId: number) {
    const kyc = await this.prisma.kYC.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!kyc) {
      return null;
    }

    return kyc;
  }
} 