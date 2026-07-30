import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { ProductsQueryDto } from './products-query.dto';

export class AdminProductsQueryDto extends ProductsQueryDto {
  @ApiPropertyOptional({
    description:
      'Filtriranje po statusu objave. Bez vrednosti vraća oba statusa.',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams): unknown => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  published?: boolean;
}
