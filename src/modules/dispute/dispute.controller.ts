import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DisputeService } from './dispute.service';
import { Dispute, DisputeFilters, DisputeResolutionRequest } from './dispute.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/auth.types';

@ApiTags('disputes')
@Controller('disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Create a new dispute' })
  @ApiResponse({ status: 201, description: 'Dispute created successfully' })
  async createDispute(@Body() dispute: Partial<Dispute>): Promise<Dispute> {
    return this.disputeService.createDispute(dispute);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ARBITRATOR)
  @ApiOperation({ summary: 'Get all disputes with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated disputes' })
  async getDisputes(
    @Query() filters: DisputeFilters,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.disputeService.getDisputes(filters, page, limit);
  }

  @Get(':id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.ARBITRATOR)
  @ApiOperation({ summary: 'Get a specific dispute by ID' })
  @ApiResponse({ status: 200, description: 'Returns the dispute' })
  async getDispute(@Param('id') id: string): Promise<Dispute> {
    return this.disputeService.getDispute(id);
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN, UserRole.ARBITRATOR)
  @ApiOperation({ summary: 'Update dispute status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<Dispute> {
    return this.disputeService.updateDisputeStatus(id, status);
  }

  @Put(':id/assign')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign an arbitrator to a dispute' })
  @ApiResponse({ status: 200, description: 'Arbitrator assigned successfully' })
  async assignArbitrator(
    @Param('id') id: string,
    @Body('arbitratorId') arbitratorId: string,
  ): Promise<Dispute> {
    return this.disputeService.assignArbitrator(id, arbitratorId);
  }

  @Put(':id/resolve')
  @Roles(UserRole.ARBITRATOR)
  @ApiOperation({ summary: 'Resolve a dispute' })
  @ApiResponse({ status: 200, description: 'Dispute resolved successfully' })
  async resolveDispute(
    @Param('id') id: string,
    @Body() resolution: DisputeResolutionRequest,
  ): Promise<Dispute> {
    return this.disputeService.resolveDispute(id, resolution);
  }

  @Post(':id/evidence')
  @Roles(UserRole.USER, UserRole.ARBITRATOR)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Add evidence to a dispute' })
  @ApiResponse({ status: 201, description: 'Evidence added successfully' })
  async addEvidence(
    @Param('id') id: string,
    @Body() evidence: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.disputeService.addEvidence(id, evidence, file);
  }

  @Get(':id/timeline')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.ARBITRATOR)
  @ApiOperation({ summary: 'Get dispute timeline' })
  @ApiResponse({ status: 200, description: 'Returns the dispute timeline' })
  async getTimeline(@Param('id') id: string) {
    return this.disputeService.getDisputeTimeline(id);
  }
} 