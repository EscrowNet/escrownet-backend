import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Evidence, EvidenceType } from './dispute.types';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class EvidenceService {
  private readonly logger = new Logger(EvidenceService.name);
  private readonly storageType: 's3' | 'local';
  private readonly evidence: Map<string, Evidence> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {
    this.storageType = this.configService.get<'s3' | 'local'>('EVIDENCE_STORAGE_TYPE') || 'local';
  }

  async addEvidence(
    disputeId: string,
    type: EvidenceType,
    title: string,
    description: string,
    file?: Express.Multer.File,
    uploadedBy: string,
  ): Promise<Evidence> {
    try {
      let fileUrl: string | undefined;
      let fileType: string | undefined;
      let fileSize: number | undefined;

      if (file) {
        const uploadResult = await this.uploadFile(file);
        fileUrl = uploadResult.url;
        fileType = file.mimetype;
        fileSize = file.size;
      }

      const evidence: Evidence = {
        id: Math.random().toString(36).substring(7),
        disputeId,
        type,
        title,
        description,
        fileUrl,
        fileType,
        fileSize,
        uploadedBy,
        uploadedAt: new Date(),
        verified: false,
      };

      this.evidence.set(evidence.id, evidence);

      await this.auditService.logEvent(
        'DATA_ACCESS',
        'Evidence added to dispute',
        uploadedBy,
        {
          disputeId,
          evidenceId: evidence.id,
          type,
          title,
        },
        'INFO',
        'DISPUTE',
      );

      return evidence;
    } catch (error) {
      this.logger.error(`Failed to add evidence: ${error.message}`);
      throw error;
    }
  }

  private async uploadFile(file: Express.Multer.File): Promise<{ url: string }> {
    try {
      if (this.storageType === 's3') {
        // Implement S3 upload logic here
        throw new Error('S3 upload not implemented');
      } else {
        // Implement local file storage logic here
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = `uploads/${fileName}`;
        // Save file to local storage
        return { url: filePath };
      }
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw error;
    }
  }

  async getEvidence(evidenceId: string): Promise<Evidence | null> {
    return this.evidence.get(evidenceId) || null;
  }

  async getDisputeEvidence(disputeId: string): Promise<Evidence[]> {
    return Array.from(this.evidence.values()).filter(
      evidence => evidence.disputeId === disputeId,
    );
  }

  async verifyEvidence(evidenceId: string, verifiedBy: string): Promise<Evidence> {
    const evidence = this.evidence.get(evidenceId);
    if (!evidence) {
      throw new Error('Evidence not found');
    }

    evidence.verified = true;
    this.evidence.set(evidenceId, evidence);

    await this.auditService.logEvent(
      'DATA_ACCESS',
      'Evidence verified',
      verifiedBy,
      {
        evidenceId,
        disputeId: evidence.disputeId,
      },
      'INFO',
      'DISPUTE',
    );

    return evidence;
  }

  async deleteEvidence(evidenceId: string, deletedBy: string): Promise<void> {
    const evidence = this.evidence.get(evidenceId);
    if (!evidence) {
      throw new Error('Evidence not found');
    }

    this.evidence.delete(evidenceId);

    await this.auditService.logEvent(
      'DATA_ACCESS',
      'Evidence deleted',
      deletedBy,
      {
        evidenceId,
        disputeId: evidence.disputeId,
      },
      'WARNING',
      'DISPUTE',
    );
  }
} 