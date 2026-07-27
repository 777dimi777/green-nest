import { Type } from 'class-transformer';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
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
    example:
      'Popularna sobna biljka sa velikim dekorativnim listovima.',
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
    description:
      'Jedinstvena interna oznaka proizvoda',
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
  @IsPositive()
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

  @ApiPropertyOptional({
    example: '60–80 cm',
    description: 'Visina biljke',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  height?: string;

  @ApiPropertyOptional({
    example: '17 cm',
    description: 'Veličina saksije',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  potSize?: string;

  @ApiPropertyOptional({
    example: 'Indirektna svetlost',
    description: 'Preporučeni uslovi osvetljenja',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  light?: string;

  @ApiPropertyOptional({
    example: 'Jednom nedeljno',
    description: 'Preporuka za zalivanje',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  watering?: string;

  @ApiPropertyOptional({
    example: '18–27 °C',
    description: 'Preporučena temperatura',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  temperature?: string;

  @ApiPropertyOptional({
    example: 'Srednja do visoka',
    description: 'Preporučena vlažnost vazduha',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  humidity?: string;

  @ApiPropertyOptional({
    example: 'Lako',
    description: 'Nivo zahtevnosti održavanja',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  difficulty?: string;

  @ApiPropertyOptional({
    example: 'Brz',
    description: 'Brzina rasta biljke',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  growthRate?: string;

  @ApiPropertyOptional({
    example: 'Centralna Amerika',
    description: 'Poreklo biljke',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  origin?: string;

  @ApiPropertyOptional({
    example: 'Otrovna ako se proguta',
    description: 'Informacije o toksičnosti',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  toxicity?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Da li biljka prečišćava vazduh',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  airPurifying?: boolean;

  @ApiPropertyOptional({
    example: false,
    description:
      'Da li je biljka bezbedna za kućne ljubimce',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  petFriendly?: boolean;

  @ApiPropertyOptional({
    example: true,
    description:
      'Da li se proizvod prikazuje među izdvojenim proizvodima',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({
    example: true,
    description:
      'Da li je proizvod javno vidljiv u prodavnici',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiProperty({
    example: 'cm123category',
    description:
      'ID kategorije kojoj proizvod pripada',
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