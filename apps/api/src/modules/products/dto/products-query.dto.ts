import {
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  Transform,
  Type,
} from 'class-transformer';
export class ProductsQueryDto {
  @ApiPropertyOptional({
    example: 'monstera',
    description:
      'Pretraga po nazivu, opisu ili SKU oznaci',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'cm123category',
    description: 'Filtriranje po ID-u kategorije',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Najniža cena',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Najviša cena',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  maxPrice?: number;

  @ApiPropertyOptional({
    example: true,
    description:
      'Prikaz samo izdvojenih proizvoda',
  })
  @IsOptional()
  @Transform(({ value }) => {
  if (value === 'true' || value === true) {
    return true;
  }

  if (value === 'false' || value === false) {
    return false;
  }

  return value;
})
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({
    example: true,
    description:
      'Prikaz samo proizvoda koji su na stanju',
  })
  @IsOptional()
 @Transform(({ value }) => {
  if (value === 'true' || value === true) {
    return true;
  }

  if (value === 'false' || value === false) {
    return false;
  }

  return value;
})
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({
    example: 'createdAt',
    enum: [
      'createdAt',
      'name',
      'price',
      'stock',
    ],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn([
    'createdAt',
    'name',
    'price',
    'stock',
  ])
  sortBy?: 'createdAt' | 'name' | 'price' | 'stock';

  @ApiPropertyOptional({
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    example: 1,
    description: 'Broj stranice',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 12,
    description: 'Broj proizvoda po stranici',
    default: 12,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}