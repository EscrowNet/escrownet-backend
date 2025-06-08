import { Injectable, Logger } from '@nestjs/common';
import {
  Transaction,
  TransactionFilters,
  TransactionSearchParams,
} from './transaction.types';

@Injectable()
export class TransactionRepository {
  private readonly logger = new Logger(TransactionRepository.name);
  private transactions: Map<string, Transaction> = new Map();

  async create(transaction: Transaction): Promise<Transaction> {
    try {
      this.transactions.set(transaction.id, transaction);
      return transaction;
    } catch (error) {
      this.logger.error(`Failed to create transaction: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.transactions.get(id) || null;
  }

  async findByTxHash(txHash: string): Promise<Transaction | null> {
    return (
      Array.from(this.transactions.values()).find(
        tx => tx.txHash === txHash,
      ) || null
    );
  }

  async find(
    filters: TransactionFilters,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ transactions: Transaction[]; total: number }> {
    try {
      let filteredTransactions = Array.from(this.transactions.values());

      if (filters.type) {
        filteredTransactions = filteredTransactions.filter(
          tx => tx.type === filters.type,
        );
      }
      if (filters.status) {
        filteredTransactions = filteredTransactions.filter(
          tx => tx.status === filters.status,
        );
      }
      if (filters.category) {
        filteredTransactions = filteredTransactions.filter(
          tx => tx.category === filters.category,
        );
      }
      if (filters.userId) {
        filteredTransactions = filteredTransactions.filter(
          tx => tx.userId === filters.userId,
        );
      }
      if (filters.escrowId) {
        filteredTransactions = filteredTransactions.filter(
          tx => tx.escrowId === filters.escrowId,
        );
      }
      if (filters.fromAddress) {
        filteredTransactions = filteredTransactions.filter(
          tx => tx.fromAddress === filters.fromAddress,
        );
      }
      if (filters.toAddress) {
        filteredTransactions = filteredTransactions.filter(
          tx => tx.toAddress === filters.toAddress,
        );
      }
      if (filters.startDate) {
        filteredTransactions = filteredTransactions.filter(
          tx => tx.timestamp >= filters.startDate!,
        );
      }
      if (filters.endDate) {
        filteredTransactions = filteredTransactions.filter(
          tx => tx.timestamp <= filters.endDate!,
        );
      }
      if (filters.minAmount) {
        filteredTransactions = filteredTransactions.filter(
          tx => tx.amount >= filters.minAmount!,
        );
      }
      if (filters.maxAmount) {
        filteredTransactions = filteredTransactions.filter(
          tx => tx.amount <= filters.maxAmount!,
        );
      }
      if (filters.currency) {
        filteredTransactions = filteredTransactions.filter(
          tx => tx.currency === filters.currency,
        );
      }

      // Sort by timestamp in descending order
      filteredTransactions.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
      );

      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedTransactions = filteredTransactions.slice(start, end);

      return {
        transactions: paginatedTransactions,
        total: filteredTransactions.length,
      };
    } catch (error) {
      this.logger.error(`Failed to find transactions: ${error.message}`);
      throw error;
    }
  }

  async search(
    params: TransactionSearchParams,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ transactions: Transaction[]; total: number }> {
    try {
      let filteredTransactions = Array.from(this.transactions.values());

      // Apply filters
      if (params.type) {
        filteredTransactions = filteredTransactions.filter(
          tx => tx.type === params.type,
        );
      }
      // ... (apply other filters as in find method)

      // Apply search term if provided
      if (params.searchTerm) {
        const searchTerm = params.searchTerm.toLowerCase();
        filteredTransactions = filteredTransactions.filter(
          tx =>
            tx.txHash?.toLowerCase().includes(searchTerm) ||
            tx.fromAddress.toLowerCase().includes(searchTerm) ||
            tx.toAddress.toLowerCase().includes(searchTerm) ||
            tx.userId.toLowerCase().includes(searchTerm) ||
            tx.escrowId?.toLowerCase().includes(searchTerm),
        );
      }

      // Apply sorting
      if (params.sortBy) {
        filteredTransactions.sort((a, b) => {
          let comparison = 0;
          switch (params.sortBy) {
            case 'timestamp':
              comparison =
                a.timestamp.getTime() - b.timestamp.getTime();
              break;
            case 'amount':
              comparison = parseFloat(a.amount) - parseFloat(b.amount);
              break;
            case 'status':
              comparison = a.status.localeCompare(b.status);
              break;
          }
          return params.sortOrder === 'desc' ? -comparison : comparison;
        });
      }

      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedTransactions = filteredTransactions.slice(start, end);

      return {
        transactions: paginatedTransactions,
        total: filteredTransactions.length,
      };
    } catch (error) {
      this.logger.error(`Failed to search transactions: ${error.message}`);
      throw error;
    }
  }

  async update(transaction: Transaction): Promise<Transaction> {
    try {
      if (!this.transactions.has(transaction.id)) {
        throw new Error('Transaction not found');
      }
      this.transactions.set(transaction.id, transaction);
      return transaction;
    } catch (error) {
      this.logger.error(`Failed to update transaction: ${error.message}`);
      throw error;
    }
  }

  async findByEscrowId(escrowId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      tx => tx.escrowId === escrowId,
    );
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      tx => tx.userId === userId,
    );
  }
} 