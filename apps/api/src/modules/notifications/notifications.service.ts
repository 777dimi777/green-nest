import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsQueryDto } from './dto/notifications-query.dto';
import { AdminNotificationsQueryDto } from './dto/admin-notifications-query.dto';

export type NotificationDatabase = PrismaService | Prisma.TransactionClient;

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Prisma.NotificationUncheckedCreateInput,
    database: NotificationDatabase = this.prisma,
  ) {
    return database.notification.create({ data });
  }

  createOrderNotification(
    userId: string,
    orderId: string,
    orderNumber: string,
    type: NotificationType,
    database: NotificationDatabase = this.prisma,
  ) {
    const content = this.getOrderContent(type, orderNumber);
    return this.create(
      {
        userId,
        orderId,
        type,
        title: content.title,
        message: content.message,
      },
      database,
    );
  }

  createPaymentNotification(
    userId: string,
    orderId: string,
    paymentId: string,
    orderNumber: string,
    type: NotificationType,
    failureReason?: string | null,
    database: NotificationDatabase = this.prisma,
  ) {
    const content = this.getPaymentContent(type, orderNumber, failureReason);
    return this.create(
      {
        userId,
        orderId,
        paymentId,
        type,
        title: content.title,
        message: content.message,
      },
      database,
    );
  }

  async findMyNotifications(userId: string, query: NotificationsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(query.read !== undefined && { read: query.read }),
      ...(query.type && { type: query.type }),
    };

    const [notifications, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit);

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };
  }

  async findAllAdmin(query: AdminNotificationsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.NotificationWhereInput = {
      ...(query.userId && { userId: query.userId }),
      ...(query.read !== undefined && { read: query.read }),
      ...(query.type && { type: query.type }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { message: { contains: query.search, mode: 'insensitive' } },
          {
            user: {
              email: { contains: query.search, mode: 'insensitive' },
            },
          },
        ],
      }),
    };
    const [notifications, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          read: true,
          readAt: true,
          orderId: true,
          paymentId: true,
          createdAt: true,
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };
  }

  async findAdminById(notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        read: true,
        readAt: true,
        orderId: true,
        paymentId: true,
        createdAt: true,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
    if (!notification) {
      throw new NotFoundException('Notifikacija nije pronađena.');
    }
    return notification;
  }

  async getUnreadCount(userId: string) {
    const unreadCount = await this.prisma.notification.count({
      where: { userId, read: false },
    });
    return { unreadCount };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.findOwnedNotification(
      userId,
      notificationId,
    );

    if (notification.read) return notification;

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
    return { updatedCount: result.count };
  }

  async remove(userId: string, notificationId: string) {
    await this.findOwnedNotification(userId, notificationId);
    await this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  async removeAllRead(userId: string) {
    const result = await this.prisma.notification.deleteMany({
      where: { userId, read: true },
    });
    return { deletedCount: result.count };
  }

  private async findOwnedNotification(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) {
      throw new NotFoundException('Notifikacija nije pronađena.');
    }
    return notification;
  }

  private getOrderContent(type: NotificationType, orderNumber: string) {
    const content: Partial<
      Record<NotificationType, { title: string; message: string }>
    > = {
      [NotificationType.ORDER_CREATED]: {
        title: 'Porudžbina je kreirana',
        message: `Porudžbina ${orderNumber} je uspešno kreirana.`,
      },
      [NotificationType.ORDER_CONFIRMED]: {
        title: 'Porudžbina je potvrđena',
        message: `Porudžbina ${orderNumber} je potvrđena.`,
      },
      [NotificationType.ORDER_SHIPPED]: {
        title: 'Porudžbina je poslata',
        message: `Porudžbina ${orderNumber} je poslata.`,
      },
      [NotificationType.ORDER_DELIVERED]: {
        title: 'Porudžbina je isporučena',
        message: `Porudžbina ${orderNumber} je isporučena.`,
      },
      [NotificationType.ORDER_CANCELLED]: {
        title: 'Porudžbina je otkazana',
        message: `Porudžbina ${orderNumber} je otkazana.`,
      },
    };
    return (
      content[type] ?? {
        title: 'Promena porudžbine',
        message: `Status porudžbine ${orderNumber} je promenjen.`,
      }
    );
  }

  private getPaymentContent(
    type: NotificationType,
    orderNumber: string,
    failureReason?: string | null,
  ) {
    if (type === NotificationType.PAYMENT_COMPLETED) {
      return {
        title: 'Plaćanje je uspešno',
        message: `Plaćanje porudžbine ${orderNumber} je uspešno završeno.`,
      };
    }
    if (type === NotificationType.PAYMENT_FAILED) {
      return {
        title: 'Plaćanje nije uspelo',
        message: `Plaćanje porudžbine ${orderNumber} nije uspelo.${failureReason ? ` Razlog: ${failureReason}` : ''}`,
      };
    }
    return {
      title: 'Plaćanje je refundirano',
      message: `Plaćanje porudžbine ${orderNumber} je refundirano.`,
    };
  }
}
