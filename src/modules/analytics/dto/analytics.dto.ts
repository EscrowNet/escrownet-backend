export class TimeframeQueryDto {
  timeframe: string;
}

export class CustomReportDto {
  metrics: string[];
  timeframe: string;
  format: 'json' | 'csv';
}

export class EscrowActivityMetricsDto {
  totalEscrows: number;
  activeEscrows: number;
  completedEscrows: number;
  timeframe: string;
}

export class TransactionVolumeMetricsDto {
  totalVolume: number;
  averageTransactionSize: number;
  timeframe: string;
}

export class DisputeMetricsDto {
  totalDisputes: number;
  resolvedDisputes: number;
  disputeRate: number;
  timeframe: string;
} 