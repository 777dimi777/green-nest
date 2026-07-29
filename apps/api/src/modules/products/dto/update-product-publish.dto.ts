import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateProductPublishDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  published!: boolean;
}
