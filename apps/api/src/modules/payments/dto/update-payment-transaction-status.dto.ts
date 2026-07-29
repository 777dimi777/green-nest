import { ApiProperty } from '@nestjs/swagger';
import { PaymentTransactionStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdatePaymentTransactionStatusDto {
  @ApiProperty({
    enum: PaymentTransactionStatus,
    example: PaymentTransactionStatus.COMPLETED,
  })
  @IsEnum(PaymentTransactionStatus)
  status!: PaymentTransactionStatus;
}
