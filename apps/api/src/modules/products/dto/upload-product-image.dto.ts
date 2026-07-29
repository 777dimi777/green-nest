import { Transform, type TransformFnParams } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UploadProductImageDto {
  @ApiPropertyOptional({
    description: 'Sets the uploaded image as the primary product image.',
    type: Boolean,
    example: true,
  })
  @Transform((params: TransformFnParams): unknown => {
    const value = params.value as unknown;

    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
