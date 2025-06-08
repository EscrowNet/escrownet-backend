import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import {
  Transaction,
  TransactionStatus,
  TransactionFilters,
  TransactionSearchParams,
} from './transaction.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/auth.types';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  async createTransaction(@Body() transaction: Partial<Transaction>): Promise<Transaction> {
    return this.transactionService.createTransaction(transaction);
  }

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all transactions with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated transactions' })
  async getTransactions(
    @Query() filters: TransactionFilters,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.transactionService.getTransactions(filters, page, limit);
  }

  @Get('search')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Search transactions with advanced filtering' })
  @ApiResponse({ status: 200, description: 'Returns search results' })
  async searchTransactions(
    @Query() params: TransactionSearchParams,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.transactionService.searchTransactions(params, page, limit);
  }

  @Get(':id')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a specific transaction by ID' })
  @ApiResponse({ status: 200, description: 'Returns the transaction' })
  async getTransaction(@Param('id') id: string): Promise<Transaction> {
    return this.transactionService.getTransaction(id);
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update transaction status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: TransactionStatus,
    @Body('metadata') metadata?: Record<string, any>,
  ): Promise<Transaction> {
    return this.transactionService.updateTransactionStatus(id, status, metadata);
  }

  @Get('analytics/summary')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get transaction analytics summary' })
  @ApiResponse({ status: 200, description: 'Returns analytics data' })
  async getAnalytics(
    @Query() filters: TransactionFilters,
    @Query('timeRange') timeRange: 'day' | 'week' | 'month' | 'year' = 'month',
  ) {
    return this.transactionService.getAnalytics(filters, timeRange);
  }

  @Get('analytics/volume')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get transaction volume analytics' })
  @ApiResponse({ status: 200, description: 'Returns volume analytics' })
  async getVolumeAnalytics(
    @Query() filters: TransactionFilters,
    @Query('timeRange') timeRange: 'day' | 'week' | 'month' | 'year' = 'month',
  ) {
    const analytics = await this.transactionService.getAnalytics(filters, timeRange);
    return {
      totalVolume: analytics.totalVolume,
      byTimeRange: analytics.byTimeRange,
      byCategory: analytics.byCategory,
    };
  }

  @Get('analytics/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get transaction status analytics' })
  @ApiResponse({ status: 200, description: 'Returns status analytics' })
  async getStatusAnalytics(
    @Query() filters: TransactionFilters,
    @Query('timeRange') timeRange: 'day' | 'week' | 'month' | 'year' = 'month',
  ) {
    const analytics = await this.transactionService.getAnalytics(filters, timeRange);
    return {
      successRate: analytics.successRate,
      byStatus: analytics.byStatus,
      totalTransactions: analytics.totalTransactions,
    };
  }

  @Get('analytics/gas')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get gas usage analytics for on-chain transactions' })
  @ApiResponse({ status: 200, description: 'Returns gas analytics' })
  async getGasAnalytics(
    @Query() filters: TransactionFilters,
    @Query('timeRange') timeRange: 'day' | 'week' | 'month' | 'year' = 'month',
  ) {
    const analytics = await this.transactionService.getAnalytics(filters, timeRange);
    return {
      averageGasUsed: analytics.averageGasUsed,
      averageGasPrice: analytics.averageGasPrice,
      totalNetworkFees: analytics.totalNetworkFees,
    };
  }
} 