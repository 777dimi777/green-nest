import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { Equals } from 'class-validator';
export class CreatePaymentDto {
  @ApiProperty({
    enum: [PaymentMethod.CASH_ON_DELIVERY],
    example: PaymentMethod.CASH_ON_DELIVERY,
    description: 'Green Nest prihvata isključivo plaćanje pouzećem.',
  })
  @Equals(PaymentMethod.CASH_ON_DELIVERY)
  method!: PaymentMethod;
}
