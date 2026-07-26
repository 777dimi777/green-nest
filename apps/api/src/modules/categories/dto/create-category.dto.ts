import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Sobne biljke',
    description: 'Naziv kategorije',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    example: 'Biljke namenjene uzgoju u zatvorenom prostoru.',
    description: 'Opis kategorije',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/categories/indoor-plants.jpg',
    description: 'URL slike kategorije',
  })
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiPropertyOptional({
    example: 'category-parent-id',
    description: 'ID roditeljske kategorije',
  })
  @IsOptional()
  @IsString()
  parentId?: string;
}