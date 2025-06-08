import { Module } from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { DisputeController } from './dispute.controller';
import { DisputeRepository } from './dispute.repository';
import { EvidenceService } from './evidence.service';
import { ArbitratorService } from './arbitrator.service';
import { ConfigModule } from '@nestjs/config';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [ConfigModule, AuditModule],
  controllers: [DisputeController],
  providers: [
    DisputeService,
    DisputeRepository,
    EvidenceService,
    ArbitratorService,
  ],
  exports: [DisputeService],
})
export class DisputeModule {} 