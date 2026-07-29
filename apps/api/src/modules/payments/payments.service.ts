import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  NotificationType,
  PaymentMethod,
  PaymentStatus,
  PaymentTransactionStatus,
  Prisma,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsQueryDto } from './dto/payments-query.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { NotificationsService } from '../notifications/notifications.service';

const paymentOrderSelect = {
  id: true,
  orderNumber: true,
  totalPrice: true,
  status: true,
  paymentStatus: true,
} satisfies Prisma.OrderSelect;

const paymentUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createPayment(userId: string, orderId: string, dto: CreatePaymentDto) {
    if (
      dto.method === PaymentMethod.CASH_ON_DELIVERY &&
      dto.simulateFailure !== undefined
    ) {
      throw new BadRequestException(
        'simulateFailure je dozvoljen samo za CARD plaćanje.',
      );
    }

    try {
      return await this.runSerializable(async (transaction) => {
        const order = await transaction.order.findFirst({
          where: { id: orderId, userId },
          include: {
            payments: {
              where: {
                status: {
                  in: [
                    PaymentTransactionStatus.PENDING,
                    PaymentTransactionStatus.COMPLETED,
                  ],
                },
              },
              select: { id: true, method: true, status: true },
            },
          },
        });

        if (!order) {
          throw new NotFoundException('Porudžbina nije pronađena.');
        }
        if (order.status === OrderStatus.CANCELLED) {
          throw new BadRequestException(
            'Otkazana porudžbina ne može biti plaćena.',
          );
        }
        if (order.paymentStatus === PaymentStatus.PAID) {
          throw new ConflictException('Porudžbina je već plaćena.');
        }
        if (order.paymentStatus === PaymentStatus.REFUNDED) {
          throw new BadRequestException(
            'Refundirana porudžbina ne može biti ponovo plaćena.',
          );
        }
        if (
          order.payments.some(
            (payment) => payment.status === PaymentTransactionStatus.COMPLETED,
          )
        ) {
          throw new ConflictException(
            'Za porudžbinu već postoji uspešno plaćanje.',
          );
        }

        if (order.totalPrice.isZero()) {
          const payment = await transaction.payment.create({
            data: {
              orderId,
              userId,
              method: dto.method,
              status: PaymentTransactionStatus.COMPLETED,
              amount: order.totalPrice,
              provider: 'FREE_ORDER',
              providerTransactionId: `FREE-${randomUUID()}`,
              paidAt: new Date(),
            },
            include: { order: { select: paymentOrderSelect } },
          });

          await transaction.order.update({
            where: { id: orderId },
            data: { paymentStatus: PaymentStatus.PAID },
          });

          await this.notificationsService.createPaymentNotification(
            userId,
            orderId,
            payment.id,
            order.orderNumber,
            NotificationType.PAYMENT_COMPLETED,
            null,
            transaction,
          );

          return payment;
        }

        if (order.totalPrice.isNegative()) {
          throw new BadRequestException(
            'Iznos porudžbine ne može biti negativan.',
          );
        }

        if (dto.method === PaymentMethod.CASH_ON_DELIVERY) {
          if (
            order.payments.some(
              (payment) =>
                payment.method === PaymentMethod.CASH_ON_DELIVERY &&
                payment.status === PaymentTransactionStatus.PENDING,
            )
          ) {
            throw new ConflictException(
              'Plaćanje pouzećem već postoji za ovu porudžbinu.',
            );
          }

          return transaction.payment.create({
            data: {
              orderId,
              userId,
              method: PaymentMethod.CASH_ON_DELIVERY,
              status: PaymentTransactionStatus.PENDING,
              amount: order.totalPrice,
              provider: 'CASH_ON_DELIVERY',
            },
            include: { order: { select: paymentOrderSelect } },
          });
        }

        const failed = dto.simulateFailure === true;
        const payment = await transaction.payment.create({
          data: {
            orderId,
            userId,
            method: PaymentMethod.CARD,
            status: failed
              ? PaymentTransactionStatus.FAILED
              : PaymentTransactionStatus.COMPLETED,
            amount: order.totalPrice,
            provider: 'MOCK_CARD',
            providerTransactionId: `MOCK-CARD-${randomUUID()}`,
            failureReason: failed ? 'Simulated card payment failure.' : null,
            paidAt: failed ? null : new Date(),
          },
          include: { order: { select: paymentOrderSelect } },
        });

        if (!failed) {
          await transaction.payment.updateMany({
            where: {
              orderId,
              method: PaymentMethod.CASH_ON_DELIVERY,
              status: PaymentTransactionStatus.PENDING,
            },
            data: {
              status: PaymentTransactionStatus.FAILED,
              failureReason:
                'Plaćanje pouzećem je zatvoreno nakon uspešnog CARD plaćanja.',
            },
          });

          await transaction.order.update({
            where: { id: orderId },
            data: { paymentStatus: PaymentStatus.PAID },
          });
        }

        await this.notificationsService.createPaymentNotification(
          userId,
          orderId,
          payment.id,
          order.orderNumber,
          failed
            ? NotificationType.PAYMENT_FAILED
            : NotificationType.PAYMENT_COMPLETED,
          payment.failureReason,
          transaction,
        );

        return payment;
      });
    } catch (error) {
      this.rethrowPaymentConflict(error);
      throw error;
    }
  }

  findMyPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      include: { order: { select: paymentOrderSelect } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyPaymentById(userId: string, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, userId },
      include: { order: { select: paymentOrderSelect } },
    });

    if (!payment) {
      throw new NotFoundException('Plaćanje nije pronađeno.');
    }

    return payment;
  }

  async findAll(query: PaymentsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const where: Prisma.PaymentWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.method && { method: query.method }),
      ...(query.search && {
        OR: [
          {
            providerTransactionId: {
              contains: query.search,
              mode: 'insensitive' as const,
            },
          },
          {
            order: {
              orderNumber: {
                contains: query.search,
                mode: 'insensitive' as const,
              },
            },
          },
          {
            user: {
              email: {
                contains: query.search,
                mode: 'insensitive' as const,
              },
            },
          },
        ],
      }),
    };

    const [payments, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        include: {
          order: { select: paymentOrderSelect },
          user: { select: paymentUserSelect },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit);

    return {
      data: payments,
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

  async findOne(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: { select: paymentOrderSelect },
        user: { select: paymentUserSelect },
      },
    });

    if (!payment) {
      throw new NotFoundException('Plaćanje nije pronađeno.');
    }

    return payment;
  }

  async updateStatus(paymentId: string, dto: UpdatePaymentStatusDto) {
    try {
      return await this.runSerializable(async (transaction) => {
        const payment = await transaction.payment.findUnique({
          where: { id: paymentId },
          include: { order: true },
        });

        if (!payment) {
          throw new NotFoundException('Plaćanje nije pronađeno.');
        }
        if (payment.status === dto.status) {
          throw new BadRequestException(
            `Plaćanje već ima status ${dto.status}.`,
          );
        }

        const canCompleteCod =
          payment.method === PaymentMethod.CASH_ON_DELIVERY &&
          payment.status === PaymentTransactionStatus.PENDING &&
          dto.status === PaymentTransactionStatus.COMPLETED;
        const canRefund =
          payment.status === PaymentTransactionStatus.COMPLETED &&
          dto.status === PaymentTransactionStatus.REFUNDED;

        if (!canCompleteCod && !canRefund) {
          throw new BadRequestException(
            `Promena statusa iz ${payment.status} u ${dto.status} nije dozvoljena.`,
          );
        }
        if (canCompleteCod && payment.order.status === OrderStatus.CANCELLED) {
          throw new BadRequestException(
            'Plaćanje otkazane porudžbine ne može biti završeno.',
          );
        }

        if (canCompleteCod) {
          const completedPayment = await transaction.payment.findFirst({
            where: {
              orderId: payment.orderId,
              status: PaymentTransactionStatus.COMPLETED,
              NOT: { id: payment.id },
            },
            select: { id: true },
          });
          if (
            completedPayment ||
            payment.order.paymentStatus === PaymentStatus.PAID
          ) {
            throw new ConflictException('Porudžbina je već plaćena.');
          }
        }

        const updatedPayment = await transaction.payment.update({
          where: { id: paymentId },
          data: {
            status: dto.status,
            paidAt: canCompleteCod ? new Date() : payment.paidAt,
          },
          include: {
            order: { select: paymentOrderSelect },
            user: { select: paymentUserSelect },
          },
        });

        await transaction.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: canRefund
              ? PaymentStatus.REFUNDED
              : PaymentStatus.PAID,
          },
        });

        await this.notificationsService.createPaymentNotification(
          payment.userId,
          payment.orderId,
          payment.id,
          payment.order.orderNumber,
          canRefund
            ? NotificationType.PAYMENT_REFUNDED
            : NotificationType.PAYMENT_COMPLETED,
          null,
          transaction,
        );

        return updatedPayment;
      });
    } catch (error) {
      this.rethrowPaymentConflict(error);
      throw error;
    }
  }

  private async runSerializable<T>(
    operation: (transaction: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        return await this.prisma.$transaction(operation, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2034' &&
          attempt < 3
        ) {
          continue;
        }
        throw error;
      }
    }

    throw new ConflictException(
      'Plaćanje nije moglo biti obrađeno zbog konkurentnog zahteva.',
    );
  }

  private rethrowPaymentConflict(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'Aktivno ili uspešno plaćanje već postoji za ovu porudžbinu.',
      );
    }
  }
}
