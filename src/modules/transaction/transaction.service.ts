import { Injectable, Logger } from '@nestjs/common';
import { TransactionRepository } from './transaction.repository';
import { AuditService } from '../audit/audit.service';
import {
  Transaction,
  TransactionStatus,
  TransactionFilters,
  TransactionSearchParams,
  TransactionAnalytics,
} from './transaction.types';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly auditService: AuditService,
  ) {}

  async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    try {
      const newTransaction: Transaction = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date(),
        status: 'PENDING',
        metadata: {},
        ...transaction,
      } as Transaction;

      await this.transactionRepository.create(newTransaction);

      await this.auditService.logEvent(
        'SYSTEM_ACTION',
        'Transaction created',
        newTransaction.userId,
        {
          transactionId: newTransaction.id,
          type: newTransaction.type,
          category: newTransaction.category,
          amount: newTransaction.amount,
          currency: newTransaction.currency,
        },
        'INFO',
        'TRANSACTION',
      );

      return newTransaction;
    } catch (error) {
      this.logger.error(`Failed to create transaction: ${error.message}`);
      throw error;
    }
  }

  async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
    metadata?: Record<string, any>,
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    transaction.status = status;
    transaction.updatedAt = new Date();

    if (status === 'CONFIRMED') {
      transaction.confirmedAt = new Date();
    } else if (status === 'FAILED' || status === 'REVERTED') {
      transaction.failedAt = new Date();
      if (metadata?.failureReason) {
        transaction.failureReason = metadata.failureReason;
      }
    }

    if (metadata) {
      transaction.metadata = { ...transaction.metadata, ...metadata };
    }

    await this.transactionRepository.update(transaction);

    await this.auditService.logEvent(
      'SYSTEM_ACTION',
      'Transaction status updated',
      transaction.userId,
      {
        transactionId,
        oldStatus: transaction.status,
        newStatus: status,
        metadata,
      },
      'INFO',
      'TRANSACTION',
    );

    return transaction;
  }

  async getTransaction(transactionId: string): Promise<Transaction | null> {
    return this.transactionRepository.findById(transactionId);
  }

  async getTransactions(
    filters: TransactionFilters,
    page: number = 1,
    limit: number = 50,
  ) {
    return this.transactionRepository.find(filters, page, limit);
  }

  async searchTransactions(
    params: TransactionSearchParams,
    page: number = 1,
    limit: number = 50,
  ) {
    return this.transactionRepository.search(params, page, limit);
  }

  async getAnalytics(
    filters: TransactionFilters,
    timeRange: 'day' | 'week' | 'month' | 'year' = 'month',
  ): Promise<TransactionAnalytics> {
    const { transactions } = await this.transactionRepository.find(filters);

    const analytics: TransactionAnalytics = {
      totalVolume: '0',
      totalTransactions: 0,
      successRate: 0,
      byCategory: {},
      byStatus: {},
      byTimeRange: [],
    };

    let totalConfirmed = 0;
    let totalGasUsed = 0;
    let totalGasPrice = 0;
    let totalNetworkFees = 0;
    let gasTransactions = 0;

    transactions.forEach(tx => {
      // Calculate total volume
      if (tx.status === 'CONFIRMED') {
        analytics.totalVolume = (
          parseFloat(analytics.totalVolume) + parseFloat(tx.amount)
        ).toString();
        totalConfirmed++;
      }

      // Calculate gas metrics for on-chain transactions
      if (tx.type === 'ON_CHAIN' && tx.gasUsed && tx.gasPrice) {
        totalGasUsed += parseFloat(tx.gasUsed);
        totalGasPrice += parseFloat(tx.gasPrice);
        if (tx.networkFee) {
          totalNetworkFees += parseFloat(tx.networkFee);
        }
        gasTransactions++;
      }

      // Aggregate by category
      if (!analytics.byCategory[tx.category]) {
        analytics.byCategory[tx.category] = {
          count: 0,
          volume: '0',
        };
      }
      analytics.byCategory[tx.category]!.count++;
      if (tx.status === 'CONFIRMED') {
        analytics.byCategory[tx.category]!.volume = (
          parseFloat(analytics.byCategory[tx.category]!.volume) +
          parseFloat(tx.amount)
        ).toString();
      }

      // Aggregate by status
      analytics.byStatus[tx.status] = (analytics.byStatus[tx.status] || 0) + 1;
    });

    // Calculate success rate
    analytics.totalTransactions = transactions.length;
    analytics.successRate =
      analytics.totalTransactions > 0
        ? (totalConfirmed / analytics.totalTransactions) * 100
        : 0;

    // Calculate gas metrics
    if (gasTransactions > 0) {
      analytics.averageGasUsed = (totalGasUsed / gasTransactions).toString();
      analytics.averageGasPrice = (totalGasPrice / gasTransactions).toString();
      analytics.totalNetworkFees = totalNetworkFees.toString();
    }

    // Calculate time-based analytics
    const now = new Date();
    const timeRanges = this.generateTimeRanges(now, timeRange);
    analytics.byTimeRange = timeRanges.map(range => {
      const rangeTransactions = transactions.filter(
        tx => tx.timestamp >= range.start && tx.timestamp <= range.end,
      );
      const confirmedTransactions = rangeTransactions.filter(
        tx => tx.status === 'CONFIRMED',
      );
      const volume = confirmedTransactions
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
        .toString();

      return {
        timestamp: range.end,
        count: rangeTransactions.length,
        volume,
      };
    });

    return analytics;
  }

  private generateTimeRanges(
    endDate: Date,
    range: 'day' | 'week' | 'month' | 'year',
  ): { start: Date; end: Date }[] {
    const ranges: { start: Date; end: Date }[] = [];
    const now = new Date(endDate);

    switch (range) {
      case 'day':
        for (let i = 0; i < 24; i++) {
          const end = new Date(now);
          end.setHours(now.getHours() - i);
          const start = new Date(end);
          start.setHours(end.getHours() - 1);
          ranges.push({ start, end });
        }
        break;
      case 'week':
        for (let i = 0; i < 7; i++) {
          const end = new Date(now);
          end.setDate(now.getDate() - i);
          const start = new Date(end);
          start.setDate(end.getDate() - 1);
          ranges.push({ start, end });
        }
        break;
      case 'month':
        for (let i = 0; i < 30; i++) {
          const end = new Date(now);
          end.setDate(now.getDate() - i);
          const start = new Date(end);
          start.setDate(end.getDate() - 1);
          ranges.push({ start, end });
        }
        break;
      case 'year':
        for (let i = 0; i < 12; i++) {
          const end = new Date(now);
          end.setMonth(now.getMonth() - i);
          const start = new Date(end);
          start.setMonth(end.getMonth() - 1);
          ranges.push({ start, end });
        }
        break;
    }

    return ranges;
  }
} 