import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EscrowService } from '../escrow.service';
import { StarknetService } from '../services/starknet.service';
import { Escrow, EscrowStatus } from '../entities/escrow.entity';

@Processor('escrow')
export class EscrowProcessor {
  private readonly logger = new Logger(EscrowProcessor.name);

  constructor(
    private readonly escrowService: EscrowService,
    private readonly starknetService: StarknetService,
  ) {}

  @Process('create')
  async handleEscrowCreation(job: Job<{ escrowId: string }>) {
    try {
      const { escrowId } = job.data;
      const escrow = await this.escrowService.getEscrowById(escrowId);

      if (!escrow) {
        throw new Error(`Escrow ${escrowId} not found`);
      }

      const transactionHash = await this.starknetService.createEscrow(escrow);
      
      await this.escrowService.updateEscrow(escrowId, {
        transactionHash,
        status: EscrowStatus.ACTIVE,
      });

      this.logger.log(`Escrow ${escrowId} created successfully`);
    } catch (error) {
      this.logger.error(`Failed to process escrow creation: ${error.message}`);
      throw error;
    }
  }

  @Process('release')
  async handleEscrowRelease(job: Job<{ escrowId: string; callerAddress: string }>) {
    try {
      const { escrowId, callerAddress } = job.data;
      const escrow = await this.escrowService.getEscrowById(escrowId);

      if (!escrow) {
        throw new Error(`Escrow ${escrowId} not found`);
      }

      const transactionHash = await this.starknetService.releaseEscrow(
        escrowId,
        callerAddress,
      );

      await this.escrowService.updateEscrow(escrowId, {
        transactionHash,
        status: EscrowStatus.RELEASED,
      });

      this.logger.log(`Escrow ${escrowId} released successfully`);
    } catch (error) {
      this.logger.error(`Failed to process escrow release: ${error.message}`);
      throw error;
    }
  }

  @Process('dispute')
  async handleEscrowDispute(job: Job<{ escrowId: string; callerAddress: string; reason: string }>) {
    try {
      const { escrowId, callerAddress, reason } = job.data;
      const escrow = await this.escrowService.getEscrowById(escrowId);

      if (!escrow) {
        throw new Error(`Escrow ${escrowId} not found`);
      }

      const transactionHash = await this.starknetService.disputeEscrow(
        escrowId,
        callerAddress,
      );

      await this.escrowService.updateEscrow(escrowId, {
        transactionHash,
        status: EscrowStatus.DISPUTED,
        disputeDetails: {
          reason,
          raisedBy: callerAddress,
          timestamp: new Date(),
        },
      });

      this.logger.log(`Escrow ${escrowId} disputed successfully`);
    } catch (error) {
      this.logger.error(`Failed to process escrow dispute: ${error.message}`);
      throw error;
    }
  }

  @Process('verify-transaction')
  async handleTransactionVerification(job: Job<{ escrowId: string; transactionHash: string }>) {
    try {
      const { escrowId, transactionHash } = job.data;
      const isVerified = await this.starknetService.verifyTransaction(transactionHash);

      if (isVerified) {
        this.logger.log(`Transaction ${transactionHash} verified successfully`);
      } else {
        this.logger.warn(`Transaction ${transactionHash} verification failed`);
      }

      return isVerified;
    } catch (error) {
      this.logger.error(`Failed to verify transaction: ${error.message}`);
      throw error;
    }
  }
} 