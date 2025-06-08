import { Injectable, Logger } from '@nestjs/common';
import { DisputeRepository } from './dispute.repository';
import { EvidenceService } from './evidence.service';
import { ArbitratorService } from './arbitrator.service';
import { AuditService } from '../audit/audit.service';
import {
  Dispute,
  DisputeStatus,
  DisputeResolution,
  DisputeFilters,
  DisputeResolutionRequest,
} from './dispute.types';

@Injectable()
export class DisputeService {
  private readonly logger = new Logger(DisputeService.name);

  constructor(
    private readonly disputeRepository: DisputeRepository,
    private readonly evidenceService: EvidenceService,
    private readonly arbitratorService: ArbitratorService,
    private readonly auditService: AuditService,
  ) {}

  async createDispute(
    escrowId: string,
    createdBy: string,
    title: string,
    description: string,
  ): Promise<Dispute> {
    try {
      const dispute: Dispute = {
        id: Math.random().toString(36).substring(7),
        escrowId,
        status: 'OPEN',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy,
        title,
        description,
        evidence: [],
        timeline: [
          {
            id: Math.random().toString(36).substring(7),
            disputeId: '',
            type: 'STATUS_CHANGE',
            description: 'Dispute created',
            performedBy: createdBy,
            timestamp: new Date(),
          },
        ],
      };

      dispute.timeline[0].disputeId = dispute.id;
      await this.disputeRepository.create(dispute);

      await this.auditService.logEvent(
        'SYSTEM_ACTION',
        'Dispute created',
        createdBy,
        {
          disputeId: dispute.id,
          escrowId,
          title,
        },
        'INFO',
        'DISPUTE',
      );

      return dispute;
    } catch (error) {
      this.logger.error(`Failed to create dispute: ${error.message}`);
      throw error;
    }
  }

  async updateDisputeStatus(
    disputeId: string,
    status: DisputeStatus,
    updatedBy: string,
  ): Promise<Dispute> {
    const dispute = await this.disputeRepository.findById(disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    dispute.status = status;
    dispute.updatedAt = new Date();
    dispute.timeline.push({
      id: Math.random().toString(36).substring(7),
      disputeId,
      type: 'STATUS_CHANGE',
      description: `Status changed to ${status}`,
      performedBy: updatedBy,
      timestamp: new Date(),
    });

    await this.disputeRepository.update(dispute);

    await this.auditService.logEvent(
      'SYSTEM_ACTION',
      'Dispute status updated',
      updatedBy,
      {
        disputeId,
        newStatus: status,
      },
      'INFO',
      'DISPUTE',
    );

    return dispute;
  }

  async assignArbitrator(
    disputeId: string,
    arbitratorId: string,
    assignedBy: string,
  ): Promise<Dispute> {
    const dispute = await this.disputeRepository.findById(disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    const updatedDispute = await this.arbitratorService.assignArbitrator(
      disputeId,
      arbitratorId,
    );

    dispute.assignedTo = arbitratorId;
    dispute.status = 'ARBITRATOR_ASSIGNED';
    dispute.updatedAt = new Date();
    dispute.timeline.push({
      id: Math.random().toString(36).substring(7),
      disputeId,
      type: 'ARBITRATOR_ASSIGNED',
      description: `Arbitrator assigned: ${arbitratorId}`,
      performedBy: assignedBy,
      timestamp: new Date(),
    });

    await this.disputeRepository.update(dispute);

    await this.auditService.logEvent(
      'SYSTEM_ACTION',
      'Arbitrator assigned to dispute',
      assignedBy,
      {
        disputeId,
        arbitratorId,
      },
      'INFO',
      'DISPUTE',
    );

    return dispute;
  }

  async resolveDispute(
    disputeId: string,
    resolution: DisputeResolutionRequest,
    resolvedBy: string,
  ): Promise<Dispute> {
    const dispute = await this.disputeRepository.findById(disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    if (dispute.status !== 'ARBITRATION') {
      throw new Error('Dispute is not in arbitration state');
    }

    dispute.resolution = resolution.resolution;
    dispute.resolutionNotes = resolution.notes;
    dispute.resolutionDate = new Date();
    dispute.status = 'RESOLVED';
    dispute.updatedAt = new Date();
    dispute.timeline.push({
      id: Math.random().toString(36).substring(7),
      disputeId,
      type: 'RESOLUTION',
      description: `Dispute resolved: ${resolution.resolution}`,
      performedBy: resolvedBy,
      timestamp: new Date(),
      metadata: {
        notes: resolution.notes,
        evidenceIds: resolution.evidenceIds,
      },
    });

    await this.disputeRepository.update(dispute);

    await this.auditService.logEvent(
      'SYSTEM_ACTION',
      'Dispute resolved',
      resolvedBy,
      {
        disputeId,
        resolution: resolution.resolution,
      },
      'INFO',
      'DISPUTE',
    );

    return dispute;
  }

  async getDispute(disputeId: string): Promise<Dispute | null> {
    return this.disputeRepository.findById(disputeId);
  }

  async getDisputes(
    filters: DisputeFilters,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ disputes: Dispute[]; total: number }> {
    return this.disputeRepository.find(filters, page, limit);
  }

  async getDisputeTimeline(disputeId: string): Promise<Dispute['timeline']> {
    const dispute = await this.disputeRepository.findById(disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }
    return dispute.timeline;
  }
} 