import { Injectable, Logger } from '@nestjs/common';
import {
  Contract,
  ContractFilters,
  ContractEventLog,
} from './contract.types';

@Injectable()
export class ContractRepository {
  private readonly logger = new Logger(ContractRepository.name);
  private contracts: Map<string, Contract> = new Map();
  private eventLogs: Map<string, ContractEventLog> = new Map();

  async create(contract: Contract): Promise<Contract> {
    try {
      this.contracts.set(contract.id, contract);
      return contract;
    } catch (error) {
      this.logger.error(`Failed to create contract: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string): Promise<Contract | null> {
    return this.contracts.get(id) || null;
  }

  async findByAddress(address: string): Promise<Contract | null> {
    return (
      Array.from(this.contracts.values()).find(
        contract => contract.address === address,
      ) || null
    );
  }

  async find(
    filters: ContractFilters,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ contracts: Contract[]; total: number }> {
    try {
      let filteredContracts = Array.from(this.contracts.values());

      if (filters.type) {
        filteredContracts = filteredContracts.filter(
          contract => contract.type === filters.type,
        );
      }
      if (filters.network) {
        filteredContracts = filteredContracts.filter(
          contract => contract.network === filters.network,
        );
      }
      if (filters.status) {
        filteredContracts = filteredContracts.filter(
          contract => contract.status === filters.status,
        );
      }
      if (filters.deployer) {
        filteredContracts = filteredContracts.filter(
          contract => contract.deployer === filters.deployer,
        );
      }
      if (filters.version) {
        filteredContracts = filteredContracts.filter(
          contract => contract.version === filters.version,
        );
      }
      if (filters.tags && filters.tags.length > 0) {
        filteredContracts = filteredContracts.filter(contract =>
          filters.tags!.every(tag =>
            contract.metadata.tags?.includes(tag),
          ),
        );
      }

      // Sort by deployedAt in descending order
      filteredContracts.sort((a, b) => {
        const dateA = a.deployedAt?.getTime() || 0;
        const dateB = b.deployedAt?.getTime() || 0;
        return dateB - dateA;
      });

      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedContracts = filteredContracts.slice(start, end);

      return {
        contracts: paginatedContracts,
        total: filteredContracts.length,
      };
    } catch (error) {
      this.logger.error(`Failed to find contracts: ${error.message}`);
      throw error;
    }
  }

  async update(contract: Contract): Promise<Contract> {
    try {
      if (!this.contracts.has(contract.id)) {
        throw new Error('Contract not found');
      }
      this.contracts.set(contract.id, contract);
      return contract;
    } catch (error) {
      this.logger.error(`Failed to update contract: ${error.message}`);
      throw error;
    }
  }

  async addEventLog(eventLog: ContractEventLog): Promise<ContractEventLog> {
    try {
      this.eventLogs.set(eventLog.id, eventLog);
      return eventLog;
    } catch (error) {
      this.logger.error(`Failed to add event log: ${error.message}`);
      throw error;
    }
  }

  async getEventLogs(
    contractId: string,
    eventName?: string,
    fromBlock?: number,
    toBlock?: number,
  ): Promise<ContractEventLog[]> {
    let logs = Array.from(this.eventLogs.values()).filter(
      log => log.contractId === contractId,
    );

    if (eventName) {
      logs = logs.filter(log => log.eventName === eventName);
    }
    if (fromBlock) {
      logs = logs.filter(log => log.blockNumber >= fromBlock);
    }
    if (toBlock) {
      logs = logs.filter(log => log.blockNumber <= toBlock);
    }

    return logs.sort((a, b) => a.blockNumber - b.blockNumber);
  }

  async getLatestEventLog(
    contractId: string,
    eventName?: string,
  ): Promise<ContractEventLog | null> {
    const logs = await this.getEventLogs(contractId, eventName);
    return logs.length > 0 ? logs[logs.length - 1] : null;
  }

  async delete(id: string): Promise<void> {
    try {
      if (!this.contracts.has(id)) {
        throw new Error('Contract not found');
      }
      this.contracts.delete(id);
    } catch (error) {
      this.logger.error(`Failed to delete contract: ${error.message}`);
      throw error;
    }
  }
} 