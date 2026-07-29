import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.CARD,
    description: 'Način plaćanja.',
  })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiPropertyOptional({
    example: false,
    default: false,
    description: 'Simulira neuspešno CARD plaćanje.',
  })
  @IsOptional()
  @IsBoolean()
  simulateFailure?: boolean;
}
