import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum AnalyticsPeriod {
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
  LAST_90_DAYS = 'LAST_90_DAYS',
  THIS_MONTH = 'THIS_MONTH',
  THIS_YEAR = 'THIS_YEAR',
  ALL_TIME = 'ALL_TIME',
}

export class AnalyticsRangeQueryDto {
  @ApiPropertyOptional({
    example: '2026-07-01',
    description: 'Početni datum. Ima prednost nad period filterom.',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-07-31',
    description: 'Krajnji datum, uključujući ceo navedeni dan.',
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({
    enum: AnalyticsPeriod,
    default: AnalyticsPeriod.LAST_30_DAYS,
  })
  @IsOptional()
  @IsEnum(AnalyticsPeriod)
  period?: AnalyticsPeriod;
}
