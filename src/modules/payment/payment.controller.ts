import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ExecutePaymentDto } from './dto/execute-payment.dto';
import { Payment } from './entities/payment.entity';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('execute')
  @HttpCode(HttpStatus.CREATED)
  async executePayment(@Body() executePaymentDto: ExecutePaymentDto): Promise<Payment> {
    return this.paymentService.executePayment(executePaymentDto);
  }

  @Get('history')
  async getPaymentHistory(): Promise<Payment[]> {
    return this.paymentService.getPaymentHistory();
  }

  @Get(':id')
  async getPaymentById(@Param('id') id: string): Promise<Payment> {
    return this.paymentService.getPaymentById(id);
  }

  @Post(':id/refund')
  async processRefund(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ): Promise<Payment> {
    return this.paymentService.processRefund(id, reason);
  }
} 