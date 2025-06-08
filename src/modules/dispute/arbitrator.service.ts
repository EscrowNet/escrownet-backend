import { Injectable, Logger } from '@nestjs/common';
import { Arbitrator, Dispute } from './dispute.types';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ArbitratorService {
  private readonly logger = new Logger(ArbitratorService.name);
  private arbitrators: Map<string, Arbitrator> = new Map();

  constructor(private readonly auditService: AuditService) {}

  async registerArbitrator(
    userId: string,
    name: string,
    email: string,
    specialization: string[],
  ): Promise<Arbitrator> {
    try {
      const arbitrator: Arbitrator = {
        id: Math.random().toString(36).substring(7),
        userId,
        name,
        email,
        specialization,
        activeCases: 0,
        totalResolved: 0,
        rating: 5.0,
        status: 'ACTIVE',
        assignedDisputes: [],
      };

      this.arbitrators.set(arbitrator.id, arbitrator);

      await this.auditService.logEvent(
        'SYSTEM_ACTION',
        'Arbitrator registered',
        userId,
        {
          arbitratorId: arbitrator.id,
          name,
          email,
          specialization,
        },
        'INFO',
        'DISPUTE',
      );

      return arbitrator;
    } catch (error) {
      this.logger.error(`Failed to register arbitrator: ${error.message}`);
      throw error;
    }
  }

  async assignArbitrator(disputeId: string, arbitratorId: string): Promise<Dispute> {
    const arbitrator = this.arbitrators.get(arbitratorId);
    if (!arbitrator) {
      throw new Error('Arbitrator not found');
    }

    if (arbitrator.status !== 'ACTIVE') {
      throw new Error('Arbitrator is not active');
    }

    if (arbitrator.activeCases >= 5) {
      throw new Error('Arbitrator has reached maximum active cases');
    }

    arbitrator.activeCases++;
    arbitrator.assignedDisputes.push(disputeId);
    this.arbitrators.set(arbitratorId, arbitrator);

    await this.auditService.logEvent(
      'SYSTEM_ACTION',
      'Arbitrator assigned to dispute',
      arbitrator.userId,
      {
        disputeId,
        arbitratorId,
      },
      'INFO',
      'DISPUTE',
    );

    // Return updated dispute (this would be handled by the dispute service)
    throw new Error('Not implemented');
  }

  async updateArbitratorStatus(
    arbitratorId: string,
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    updatedBy: string,
  ): Promise<Arbitrator> {
    const arbitrator = this.arbitrators.get(arbitratorId);
    if (!arbitrator) {
      throw new Error('Arbitrator not found');
    }

    arbitrator.status = status;
    this.arbitrators.set(arbitratorId, arbitrator);

    await this.auditService.logEvent(
      'SYSTEM_ACTION',
      'Arbitrator status updated',
      updatedBy,
      {
        arbitratorId,
        newStatus: status,
      },
      'INFO',
      'DISPUTE',
    );

    return arbitrator;
  }

  async getArbitrator(arbitratorId: string): Promise<Arbitrator | null> {
    return this.arbitrators.get(arbitratorId) || null;
  }

  async getAvailableArbitrators(): Promise<Arbitrator[]> {
    return Array.from(this.arbitrators.values()).filter(
      arbitrator => arbitrator.status === 'ACTIVE' && arbitrator.activeCases < 5,
    );
  }

  async updateArbitratorRating(
    arbitratorId: string,
    newRating: number,
    disputeId: string,
  ): Promise<Arbitrator> {
    const arbitrator = this.arbitrators.get(arbitratorId);
    if (!arbitrator) {
      throw new Error('Arbitrator not found');
    }

    // Calculate new average rating
    const totalRatings = arbitrator.totalResolved;
    const currentTotal = arbitrator.rating * totalRatings;
    arbitrator.rating = (currentTotal + newRating) / (totalRatings + 1);
    arbitrator.totalResolved++;
    arbitrator.activeCases--;
    arbitrator.assignedDisputes = arbitrator.assignedDisputes.filter(id => id !== disputeId);

    this.arbitrators.set(arbitratorId, arbitrator);

    await this.auditService.logEvent(
      'SYSTEM_ACTION',
      'Arbitrator rating updated',
      'system',
      {
        arbitratorId,
        disputeId,
        newRating,
        newAverageRating: arbitrator.rating,
      },
      'INFO',
      'DISPUTE',
    );

    return arbitrator;
  }
} 