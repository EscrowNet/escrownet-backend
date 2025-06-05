import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { ExecutePaymentDto } from './dto/execute-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async executePayment(executePaymentDto: ExecutePaymentDto): Promise<Payment> {
    const fee = this.calculateFee(executePaymentDto.amount);
    
    const payment = this.paymentRepository.create({
      ...executePaymentDto,
      fee,
      status: PaymentStatus.PENDING,
    });

    // Here you would typically integrate with your smart contract
    // await this.smartContractService.executePayment(payment);

    payment.status = PaymentStatus.COMPLETED;
    return this.paymentRepository.save(payment);
  }

  async getPaymentHistory(): Promise<Payment[]> {
    return this.paymentRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getPaymentById(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async processRefund(id: string, reason: string): Promise<Payment> {
    const payment = await this.getPaymentById(id);
    
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new Error('Only completed payments can be refunded');
    }

    // Here you would typically integrate with your smart contract
    // await this.smartContractService.processRefund(payment);

    payment.status = PaymentStatus.REFUNDED;
    payment.refundReason = reason;
    return this.paymentRepository.save(payment);
  }

  private calculateFee(amount: number): number {
    // Implement your fee calculation logic here
    // This is a simple example - you might want to fetch from config or DB
    return amount * 0.01; // 1% fee
  }
} 