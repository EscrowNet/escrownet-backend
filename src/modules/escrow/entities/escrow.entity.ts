import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum EscrowStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  RELEASED = 'released',
  DISPUTED = 'disputed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum EscrowType {
  SIMPLE = 'simple',
  MILESTONE = 'milestone',
  TIME_LOCKED = 'time_locked',
}

@Entity('escrows')
export class Escrow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  buyerAddress: string;

  @Column()
  sellerAddress: string;

  @Column('decimal', { precision: 18, scale: 6 })
  amount: number;

  @Column()
  currency: string;

  @Column({
    type: 'enum',
    enum: EscrowStatus,
    default: EscrowStatus.PENDING,
  })
  status: EscrowStatus;

  @Column({
    type: 'enum',
    enum: EscrowType,
    default: EscrowType.SIMPLE,
  })
  type: EscrowType;

  @Column({ nullable: true })
  contractAddress?: string;

  @Column({ nullable: true })
  transactionHash?: string;

  @Column({ type: 'jsonb', nullable: true })
  releaseConditions?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  disputeDetails?: {
    reason: string;
    raisedBy: string;
    timestamp: Date;
    evidence?: string[];
  };

  @Column({ nullable: true })
  arbitratorAddress?: string;

  @Column({ type: 'timestamp', nullable: true })
  releaseDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiryDate?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 