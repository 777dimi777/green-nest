import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateProductImageDto {
  @ApiProperty({
    example: 'https://example.com/products/monstera-1.jpg',
    description: 'URL slike proizvoda',
  })
  @IsUrl()
  url!: string;

  @ApiPropertyOptional({
    example: 'Monstera deliciosa u saksiji',
    description: 'Alternativni tekst slike',
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  alt?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Određuje da li je ovo glavna slika proizvoda',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
