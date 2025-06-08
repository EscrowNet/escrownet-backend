import { Injectable, Logger } from '@nestjs/common';
import { Dispute, DisputeFilters } from './dispute.types';

@Injectable()
export class DisputeRepository {
  private readonly logger = new Logger(DisputeRepository.name);
  private disputes: Map<string, Dispute> = new Map();

  async create(dispute: Dispute): Promise<Dispute> {
    try {
      this.disputes.set(dispute.id, dispute);
      return dispute;
    } catch (error) {
      this.logger.error(`Failed to create dispute: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string): Promise<Dispute | null> {
    return this.disputes.get(id) || null;
  }

  async find(
    filters: DisputeFilters,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ disputes: Dispute[]; total: number }> {
    try {
      let filteredDisputes = Array.from(this.disputes.values());

      if (filters.status) {
        filteredDisputes = filteredDisputes.filter(
          dispute => dispute.status === filters.status,
        );
      }
      if (filters.createdBy) {
        filteredDisputes = filteredDisputes.filter(
          dispute => dispute.createdBy === filters.createdBy,
        );
      }
      if (filters.assignedTo) {
        filteredDisputes = filteredDisputes.filter(
          dispute => dispute.assignedTo === filters.assignedTo,
        );
      }
      if (filters.startDate) {
        filteredDisputes = filteredDisputes.filter(
          dispute => dispute.createdAt >= filters.startDate!,
        );
      }
      if (filters.endDate) {
        filteredDisputes = filteredDisputes.filter(
          dispute => dispute.createdAt <= filters.endDate!,
        );
      }
      if (filters.resolution) {
        filteredDisputes = filteredDisputes.filter(
          dispute => dispute.resolution === filters.resolution,
        );
      }

      // Sort by updatedAt in descending order
      filteredDisputes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedDisputes = filteredDisputes.slice(start, end);

      return {
        disputes: paginatedDisputes,
        total: filteredDisputes.length,
      };
    } catch (error) {
      this.logger.error(`Failed to find disputes: ${error.message}`);
      throw error;
    }
  }

  async update(dispute: Dispute): Promise<Dispute> {
    try {
      if (!this.disputes.has(dispute.id)) {
        throw new Error('Dispute not found');
      }
      this.disputes.set(dispute.id, dispute);
      return dispute;
    } catch (error) {
      this.logger.error(`Failed to update dispute: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      if (!this.disputes.has(id)) {
        throw new Error('Dispute not found');
      }
      this.disputes.delete(id);
    } catch (error) {
      this.logger.error(`Failed to delete dispute: ${error.message}`);
      throw error;
    }
  }

  async findByEscrowId(escrowId: string): Promise<Dispute[]> {
    return Array.from(this.disputes.values()).filter(
      dispute => dispute.escrowId === escrowId,
    );
  }
} 