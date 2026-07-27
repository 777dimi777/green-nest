import { ApiProperty } from '@nestjs/swagger';
import { Equals } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    example: true,
    description:
      'Potvrda da korisnik želi da kreira porudžbinu od sadržaja svoje korpe.',
  })
  @Equals(true, {
    message: 'Porudžbina mora biti potvrđena.',
  })
  confirm!: boolean;
}