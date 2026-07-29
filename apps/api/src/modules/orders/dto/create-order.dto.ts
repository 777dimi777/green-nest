import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  Equals,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

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

  @ApiPropertyOptional({
    example: 'WELCOME10',
    description: 'Opcioni kod kupona.',
    maxLength: 50,
  })
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  couponCode?: string;
}
