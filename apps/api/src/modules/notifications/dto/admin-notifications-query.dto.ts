import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { NotificationsQueryDto } from './notifications-query.dto';

export class AdminNotificationsQueryDto extends NotificationsQueryDto {
  @ApiPropertyOptional({ description: 'ID primaoca notifikacije.' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Pretraga po naslovu, poruci ili email-u.',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
