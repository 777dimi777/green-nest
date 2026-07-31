import { BadRequestException } from '@nestjs/common';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentTransactionStatus,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentsService } from './payments.service';

describe('PaymentsService status transitions', () => {
  it('rejects a direct FAILED to COMPLETED transition', async () => {
    const transactionClient = {
      payment: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'payment-1',
          orderId: 'order-1',
          userId: 'user-1',
          method: PaymentMethod.CASH_ON_DELIVERY,
          status: PaymentTransactionStatus.FAILED,
          paidAt: null,
          order: {
            orderNumber: 'GN-1',
            status: OrderStatus.CONFIRMED,
            paymentStatus: PaymentStatus.FAILED,
          },
        }),
      },
    };
    const prisma = {
      $transaction: jest.fn(
        (operation: (client: typeof transactionClient) => unknown) =>
          Promise.resolve(operation(transactionClient)),
      ),
    } as unknown as PrismaService;
    const notifications = {} as NotificationsService;
    const service = new PaymentsService(prisma, notifications);

    await expect(
      service.updateStatus('payment-1', {
        status: PaymentTransactionStatus.COMPLETED,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
