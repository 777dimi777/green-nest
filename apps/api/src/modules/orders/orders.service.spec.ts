import { BadRequestException } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CouponsService } from '../coupons/coupons.service';
import { NotificationsService } from '../notifications/notifications.service';
import { OrdersService } from './orders.service';

describe('OrdersService status transitions', () => {
  it('rejects moving a delivered order back to pending', async () => {
    const transactionClient = {
      order: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'order-1',
          orderNumber: 'GN-1',
          userId: 'user-1',
          status: OrderStatus.DELIVERED,
          paymentStatus: PaymentStatus.PAID,
        }),
      },
    };
    const prisma = {
      $transaction: jest.fn(
        (operation: (client: typeof transactionClient) => unknown) =>
          Promise.resolve(operation(transactionClient)),
      ),
    } as unknown as PrismaService;
    const service = new OrdersService(
      prisma,
      {} as CouponsService,
      {} as NotificationsService,
    );

    await expect(
      service.updateStatus('order-1', OrderStatus.PENDING),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
