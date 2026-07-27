import {
  IsInt,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCartItemDto {
  @ApiProperty({
    example: 'product-cuid',
    description:
      'Identifier of the product that should be added to the cart.',
  })
  @IsString()
  productId!: string;

  @ApiProperty({
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  quantity!: number;
}