import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contract, Provider, constants } from 'starknet';
import { Escrow } from '../entities/escrow.entity';

@Injectable()
export class StarknetService {
  private readonly logger = new Logger(StarknetService.name);
  private provider: Provider;
  private escrowContract: Contract;

  constructor(private configService: ConfigService) {
    this.initializeStarknet();
  }

  private async initializeStarknet() {
    try {
      const network = this.configService.get<string>('STARKNET_NETWORK') || 'goerli';
      const rpcUrl = this.configService.get<string>('STARKNET_RPC_URL');
      const contractAddress = this.configService.get<string>('ESCROW_CONTRACT_ADDRESS');
      const contractAbi = this.configService.get<string>('ESCROW_CONTRACT_ABI');

      this.provider = new Provider({ sequencer: { network } });
      this.escrowContract = new Contract(
        JSON.parse(contractAbi),
        contractAddress,
        this.provider,
      );

      this.logger.log('Starknet service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Starknet service', error);
      throw error;
    }
  }

  async createEscrow(escrow: Escrow): Promise<string> {
    try {
      const { buyerAddress, sellerAddress, amount } = escrow;
      
      const result = await this.escrowContract.create_escrow(
        buyerAddress,
        sellerAddress,
        amount,
      );

      return result.transaction_hash;
    } catch (error) {
      this.logger.error('Failed to create escrow on Starknet', error);
      throw error;
    }
  }

  async releaseEscrow(escrowId: string, callerAddress: string): Promise<string> {
    try {
      const result = await this.escrowContract.release_escrow(
        escrowId,
        callerAddress,
      );

      return result.transaction_hash;
    } catch (error) {
      this.logger.error('Failed to release escrow on Starknet', error);
      throw error;
    }
  }

  async disputeEscrow(escrowId: string, callerAddress: string): Promise<string> {
    try {
      const result = await this.escrowContract.dispute_escrow(
        escrowId,
        callerAddress,
      );

      return result.transaction_hash;
    } catch (error) {
      this.logger.error('Failed to dispute escrow on Starknet', error);
      throw error;
    }
  }

  async getEscrowStatus(escrowId: string): Promise<number> {
    try {
      const result = await this.escrowContract.get_escrow_status(escrowId);
      return result;
    } catch (error) {
      this.logger.error('Failed to get escrow status from Starknet', error);
      throw error;
    }
  }

  async verifyTransaction(transactionHash: string): Promise<boolean> {
    try {
      const receipt = await this.provider.getTransactionReceipt(transactionHash);
      return receipt.status === constants.TransactionStatus.ACCEPTED;
    } catch (error) {
      this.logger.error('Failed to verify transaction on Starknet', error);
      return false;
    }
  }
} 