export interface AnalyticsJobData {
  timestamp: Date;
  type: 'daily' | 'weekly';
}

export interface MetricsTimeframe {
  start: Date;
  end: Date;
}

export interface EscrowMetrics {
  totalEscrows: number;
  activeEscrows: number;
  completedEscrows: number;
  timeframe: MetricsTimeframe;
}

export interface TransactionMetrics {
  totalVolume: number;
  averageTransactionSize: number;
  timeframe: MetricsTimeframe;
}

export interface DisputeMetrics {
  totalDisputes: number;
  resolvedDisputes: number;
  disputeRate: number;
  timeframe: MetricsTimeframe;
}

export interface CustomReport {
  reportId: string;
  status: 'generating' | 'completed' | 'failed';
  params: {
    metrics: string[];
    timeframe: string;
    format: 'json' | 'csv';
  };
  data?: any;
  createdAt: Date;
  updatedAt: Date;
} 