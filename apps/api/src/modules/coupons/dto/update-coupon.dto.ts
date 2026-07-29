import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateCouponDto {
  @ApiPropertyOptional({ example: 'SUMMER20', maxLength: 50 })
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code?: string;

  @ApiPropertyOptional({ example: 'Letnja akcija', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @ApiPropertyOptional({
    example: 20,
    minimum: 1,
    maximum: 100,
    nullable: true,
    description: 'Postavljanje vrednosti automatski uklanja fixedAmount.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  percentage?: number | null;

  @ApiPropertyOptional({
    example: 1500,
    minimum: 0.01,
    nullable: true,
    description: 'Postavljanje vrednosti automatski uklanja percentage.',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  fixedAmount?: number | null;

  @ApiPropertyOptional({ example: 5000, minimum: 0, nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minimumOrder?: number | null;

  @ApiPropertyOptional({ example: 100, minimum: 1, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({
    example: '2026-08-01T00:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  startsAt?: string | null;

  @ApiPropertyOptional({
    example: '2026-08-31T23:59:59.999Z',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;
}
