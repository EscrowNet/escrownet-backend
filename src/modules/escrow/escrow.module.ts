import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { EscrowController } from './escrow.controller';
import { EscrowService } from './escrow.service';
import { Escrow } from './entities/escrow.entity';
import { EscrowProcessor } from './processors/escrow.processor';
import { StarknetService } from './services/starknet.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Escrow]),
    BullModule.registerQueue({
      name: 'escrow',
    }),
  ],
  controllers: [EscrowController],
  providers: [EscrowService, EscrowProcessor, StarknetService],
  exports: [EscrowService],
})
export class EscrowModule {}
