export type TransactionType = 'ON_CHAIN' | 'OFF_CHAIN';
export type TransactionStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REVERTED';
export type TransactionCategory = 'ESCROW' | 'REFUND' | 'WITHDRAWAL' | 'DEPOSIT' | 'FEE' | 'OTHER';

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  category: TransactionCategory;
  amount: string; // Using string for precise decimal handling
  currency: string;
  fromAddress: string;
  toAddress: string;
  txHash?: string; // For on-chain transactions
  blockNumber?: number; // For on-chain transactions
  timestamp: Date;
  confirmedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  metadata: Record<string, any>;
  userId: string;
  escrowId?: string;
  gasUsed?: string; // For on-chain transactions
  gasPrice?: string; // For on-chain transactions
  networkFee?: string; // For on-chain transactions
}

export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  category?: TransactionCategory;
  userId?: string;
  escrowId?: string;
  fromAddress?: string;
  toAddress?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: string;
  maxAmount?: string;
  currency?: string;
}

export interface TransactionPagination {
  page: number;
  limit: number;
}

export interface TransactionAnalytics {
  totalVolume: string;
  totalTransactions: number;
  successRate: number;
  averageGasUsed?: string;
  averageGasPrice?: string;
  totalNetworkFees?: string;
  byCategory: {
    [key in TransactionCategory]?: {
      count: number;
      volume: string;
    };
  };
  byStatus: {
    [key in TransactionStatus]?: number;
  };
  byTimeRange: {
    timestamp: Date;
    count: number;
    volume: string;
  }[];
}

export interface TransactionSearchParams extends TransactionFilters {
  searchTerm?: string;
  sortBy?: 'timestamp' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
} 