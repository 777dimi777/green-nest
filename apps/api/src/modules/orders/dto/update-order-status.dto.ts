import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    description: 'Novi status porudžbine.',
  })
  @IsEnum(OrderStatus, {
    message: 'Status porudžbine nije validan.',
  })
  status!: OrderStatus;
}
