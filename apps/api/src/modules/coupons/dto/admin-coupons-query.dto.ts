import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class AdminCouponsQueryDto {
  @ApiPropertyOptional({ description: 'Pretraga po kodu kupona.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: TransformFnParams): unknown => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ enum: ['PERCENTAGE', 'FIXED'] })
  @IsOptional()
  @IsIn(['PERCENTAGE', 'FIXED'])
  type?: 'PERCENTAGE' | 'FIXED';

  @ApiPropertyOptional({ description: 'Da li je datum isteka prošao.' })
  @IsOptional()
  @Transform(({ value }: TransformFnParams): unknown => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  expired?: boolean;

  @ApiPropertyOptional({
    enum: ['createdAt', 'code', 'expiresAt', 'usedCount'],
  })
  @IsOptional()
  @IsIn(['createdAt', 'code', 'expiresAt', 'usedCount'])
  sortBy?: 'createdAt' | 'code' | 'expiresAt' | 'usedCount';

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;
}
