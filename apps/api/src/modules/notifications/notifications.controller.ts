import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { NotificationsQueryDto } from './dto/notifications-query.dto';
import { NotificationsService } from './notifications.service';
import { AdminNotificationsQueryDto } from './dto/admin-notifications-query.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin pregled svih notifikacija' })
  @ApiOkResponse({
    description: 'Paginirana lista notifikacija sa primaocima.',
  })
  findAllAdmin(@Query() query: AdminNotificationsQueryDto) {
    return this.notificationsService.findAllAdmin(query);
  }

  @Get('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin pregled jedne notifikacije' })
  @ApiOkResponse({ description: 'Detalji notifikacije i primaoca.' })
  @ApiNotFoundResponse({ description: 'Notifikacija nije pronađena.' })
  findAdminById(@Param('id') notificationId: string) {
    return this.notificationsService.findAdminById(notificationId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Pregled svojih notifikacija' })
  @ApiOkResponse({ description: 'Paginirana lista notifikacija.' })
  findMyNotifications(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: NotificationsQueryDto,
  ) {
    return this.notificationsService.findMyNotifications(user.id, query);
  }

  @Get('my/unread-count')
  @ApiOperation({ summary: 'Broj nepročitanih notifikacija' })
  @ApiOkResponse({ description: 'Broj nepročitanih notifikacija.' })
  getUnreadCount(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Patch('my/read-all')
  @ApiOperation({ summary: 'Označavanje svih notifikacija kao pročitanih' })
  @ApiOkResponse({ description: 'Broj promenjenih notifikacija.' })
  markAllAsRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete('my/read')
  @ApiOperation({ summary: 'Brisanje svih pročitanih notifikacija' })
  @ApiOkResponse({ description: 'Broj obrisanih notifikacija.' })
  removeAllRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.removeAllRead(user.id);
  }

  @Patch('my/:id/read')
  @ApiOperation({ summary: 'Označavanje notifikacije kao pročitane' })
  @ApiOkResponse({ description: 'Notifikacija je označena kao pročitana.' })
  @ApiNotFoundResponse({ description: 'Notifikacija nije pronađena.' })
  markAsRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.markAsRead(user.id, notificationId);
  }

  @Delete('my/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Brisanje svoje notifikacije' })
  @ApiNoContentResponse({ description: 'Notifikacija je obrisana.' })
  @ApiNotFoundResponse({ description: 'Notifikacija nije pronađena.' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') notificationId: string,
  ): Promise<void> {
    await this.notificationsService.remove(user.id, notificationId);
  }
}
