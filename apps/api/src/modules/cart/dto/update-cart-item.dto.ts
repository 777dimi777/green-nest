import {
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({
    example: 3,
    minimum: 1,
    description:
      'New total quantity of the selected product.',
  })
  @IsInt()
  @Min(1)
  quantity!: number;
}