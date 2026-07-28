import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsString, MinLength } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    example: true,
    description: 'Potvrda kreiranja porudžbine.',
  })
  @Equals(true, {
    message: 'Porudžbina mora biti potvrđena.',
  })
  confirm!: boolean;

  @ApiProperty({
    example: 'cm123example',
    description: 'ID adrese za dostavu.',
  })
  @IsString()
  @MinLength(1)
  addressId!: string;
}