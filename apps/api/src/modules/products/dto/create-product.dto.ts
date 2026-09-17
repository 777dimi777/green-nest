import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateProductImageDto } from './create-product-image.dto';

export class CreateProductDto {
  @ApiProperty({
    example: 'Monstera Deliciosa',
    description: 'Naziv proizvoda',
    minLength: 2,
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @ApiProperty({
    example: 'Popularna sobna biljka sa velikim dekorativnim listovima.',
    description: 'Detaljan opis proizvoda',
    minLength: 10,
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  description!: string;

  @ApiProperty({
    example: 'MON-001',
    description: 'Jedinstvena interna oznaka proizvoda',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku!: string;

  @ApiProperty({
    example: 2499.99,
    description: 'Redovna cena proizvoda',
    minimum: 0.01,
  })
  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  price!: number;

  @ApiPropertyOptional({
    example: 1999.99,
    description: 'Snižena cena proizvoda',
    minimum: 0.01,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @IsPositive()
  discountPrice?: number;

  @ApiPropertyOptional({
    example: 25,
    description: 'Trenutna količina na stanju',
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiProperty({
    example: 'Prunus laurocerasus',
    description: 'Latinski naziv',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  latinName!: string;

  @ApiProperty({ example: 'Zimzeleni žbun', description: 'Tip biljke' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  plantType!: string;

  @ApiPropertyOptional({ example: '100–130 cm', description: 'Visina biljke' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  height?: string;

  @ApiPropertyOptional({ example: '8–12 cm', description: 'Obim stabla' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  trunkCircumference?: string;

  @ApiPropertyOptional({
    example: '180–200 cm',
    description: 'Visina kalema ili krošnje',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  graftHeight?: string;

  @ApiPropertyOptional({ example: 'Ø 22 cm', description: 'Prečnik saksije' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  potDiameter?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Da li se proizvod prikazuje među izdvojenim proizvodima',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Da li je proizvod javno vidljiv u prodavnici',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiProperty({
    example: 'cm123category',
    description: 'ID kategorije kojoj proizvod pripada',
  })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiPropertyOptional({
    type: [CreateProductImageDto],
    description: 'Početne slike proizvoda',
    maxItems: 10,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({
    each: true,
  })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];
}
