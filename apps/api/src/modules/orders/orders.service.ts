import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentTransactionStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { OrdersQueryDto } from './dto/orders-query.dto';
import { CouponsService } from '../coupons/coupons.service';

type FormattableOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  user?: unknown;
  shippingFirstName: string;
  shippingLastName: string;
  shippingPhone: string;
  shippingCountry: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingStreet: string;
  shippingStreetNumber: string;
  shippingApartment: string | null;
  subtotal: Prisma.Decimal;
  shippingPrice: Prisma.Decimal;
  discount: Prisma.Decimal;
  totalPrice: Prisma.Decimal;
  items: unknown;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly couponsService: CouponsService,
  ) {}

  async createOrder(userId: string, addressId: string, couponCode?: string) {
    return this.prisma.$transaction(async (transaction) => {
      const address = await transaction.address.findFirst({
        where: {
          id: addressId,
          userId,
        },
      });

      if (!address) {
        throw new NotFoundException('Izabrana adresa nije pronađena.');
      }
      const cart = await transaction.cart.findUnique({
        where: {
          userId,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Korpa je prazna.');
      }

      let subtotal = new Prisma.Decimal(0);

      for (const item of cart.items) {
        if (!item.product.published) {
          throw new BadRequestException(
            `Proizvod "${item.product.name}" trenutno nije dostupan.`,
          );
        }

        if (item.product.stock < item.quantity) {
          throw new BadRequestException(
            `Nema dovoljno proizvoda "${item.product.name}" na stanju.`,
          );
        }

        const unitPrice = item.product.discountPrice ?? item.product.price;

        const itemTotal = unitPrice.mul(item.quantity);

        subtotal = subtotal.add(itemTotal);
      }

      const shippingPrice = new Prisma.Decimal(0);
      let discount = new Prisma.Decimal(0);
      let couponId: string | undefined;
      let validatedCoupon:
        Awaited<ReturnType<CouponsService['validateCoupon']>> | undefined;

      if (couponCode) {
        validatedCoupon = await this.couponsService.validateCoupon(
          userId,
          couponCode,
          subtotal,
          transaction,
        );
        discount = validatedCoupon.discount;
        couponId = validatedCoupon.coupon.id;
      }

      const totalPrice = subtotal.add(shippingPrice).sub(discount);

      const orderNumber = await this.generateOrderNumber(transaction);

      const order = await transaction.order.create({
        data: {
          orderNumber,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,

          subtotal,
          shippingPrice,
          discount,
          totalPrice,
          couponId,

          userId,
          shippingFirstName: address.firstName,
          shippingLastName: address.lastName,
          shippingPhone: address.phone,
          shippingCountry: address.country,
          shippingCity: address.city,
          shippingPostalCode: address.postalCode,
          shippingStreet: address.street,
          shippingStreetNumber: address.streetNumber,
          shippingApartment: address.apartment,
          items: {
            create: cart.items.map((item) => ({
              quantity: item.quantity,

              price: item.product.discountPrice ?? item.product.price,

              productId: item.productId,
            })),
          },
        },

        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                  category: true,
                },
              },
            },
          },
        },
      });

      for (const item of cart.items) {
        await transaction.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      await transaction.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      if (validatedCoupon) {
        await this.couponsService.markCouponAsUsed(
          userId,
          validatedCoupon.coupon,
          transaction,
        );
      }

      return this.formatOrder(order);
    });
  }

  async findMyOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order) => this.formatOrder(order));
  }

  async findMyOrderById(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Porudžbina nije pronađena.');
    }

    return this.formatOrder(order);
  }
  async cancelMyOrder(userId: string, orderId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const order = await transaction.order.findFirst({
        where: {
          id: orderId,
          userId,
        },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new NotFoundException('Porudžbina nije pronađena.');
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException(
          'Možete otkazati samo porudžbinu koja je na čekanju.',
        );
      }

      for (const item of order.items) {
        await transaction.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      await transaction.payment.updateMany({
        where: {
          orderId,
          method: PaymentMethod.CASH_ON_DELIVERY,
          status: PaymentTransactionStatus.PENDING,
        },
        data: {
          status: PaymentTransactionStatus.FAILED,
          failureReason: 'Porudžbina je otkazana.',
        },
      });

      const cancelledOrder = await transaction.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: OrderStatus.CANCELLED,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                  category: true,
                },
              },
            },
          },
        },
      });

      return this.formatOrder(cancelledOrder);
    });
  }
  async findAll(query: OrdersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      ...(query.status
        ? {
            status: query.status,
          }
        : {}),

      ...(query.paymentStatus
        ? {
            paymentStatus: query.paymentStatus,
          }
        : {}),

      ...(query.search
        ? {
            OR: [
              {
                orderNumber: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                user: {
                  email: {
                    contains: query.search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                user: {
                  firstName: {
                    contains: query.search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                user: {
                  lastName: {
                    contains: query.search,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                include: {
                  images: true,
                  category: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),

      this.prisma.order.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: orders.map((order) => this.formatOrder(order)),
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
  p;

  async findOne(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                images: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Porudžbina nije pronađena.');
    }

    return this.formatOrder(order);
  }
  async updateStatus(orderId: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      throw new NotFoundException('Porudžbina nije pronađena.');
    }

    if (order.status === status) {
      throw new BadRequestException(`Porudžbina već ima status ${status}.`);
    }
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED],

      [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED],

      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],

      [OrderStatus.DELIVERED]: [],

      [OrderStatus.CANCELLED]: [],
    };

    const allowedStatuses = allowedTransitions[order.status];

    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException(
        `Promena statusa iz ${order.status} u ${status} nije dozvoljena.`,
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                images: true,
                category: true,
              },
            },
          },
        },
      },
    });

    return this.formatOrder(updatedOrder);
  }
  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      throw new NotFoundException('Porudžbina nije pronađena.');
    }

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        paymentStatus,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                images: true,
                category: true,
              },
            },
          },
        },
      },
    });

    return this.formatOrder(updatedOrder);
  }
  async cancelOrder(orderId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const order = await transaction.order.findUnique({
        where: {
          id: orderId,
        },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new NotFoundException('Porudžbina nije pronađena.');
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException('Porudžbina je već otkazana.');
      }

      if (
        order.status === OrderStatus.SHIPPED ||
        order.status === OrderStatus.DELIVERED
      ) {
        throw new BadRequestException(
          'Poslata ili isporučena porudžbina ne može biti otkazana.',
        );
      }

      for (const item of order.items) {
        await transaction.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      const paymentStatus =
        order.paymentStatus === PaymentStatus.PAID
          ? PaymentStatus.REFUNDED
          : order.paymentStatus;

      if (paymentStatus === PaymentStatus.REFUNDED) {
        await transaction.payment.updateMany({
          where: {
            orderId,
            status: PaymentTransactionStatus.COMPLETED,
          },
          data: {
            status: PaymentTransactionStatus.REFUNDED,
          },
        });
      } else {
        await transaction.payment.updateMany({
          where: {
            orderId,
            method: PaymentMethod.CASH_ON_DELIVERY,
            status: PaymentTransactionStatus.PENDING,
          },
          data: {
            status: PaymentTransactionStatus.FAILED,
            failureReason: 'Porudžbina je otkazana.',
          },
        });
      }

      const cancelledOrder = await transaction.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: OrderStatus.CANCELLED,
          paymentStatus,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                include: {
                  images: true,
                  category: true,
                },
              },
            },
          },
        },
      });

      return this.formatOrder(cancelledOrder);
    });
  }
  private async generateOrderNumber(transaction: Prisma.TransactionClient) {
    let orderNumber: string;
    let exists: boolean;

    do {
      const timestamp = Date.now().toString().slice(-8);

      const randomPart = Math.floor(1000 + Math.random() * 9000);

      orderNumber = `GN-${timestamp}-${randomPart}`;

      const existingOrder = await transaction.order.findUnique({
        where: {
          orderNumber,
        },
        select: {
          id: true,
        },
      });

      exists = existingOrder !== null;
    } while (exists);

    return orderNumber;
  }

  private formatOrder(order: FormattableOrder) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,

      user: order.user ?? undefined,

      shippingAddress: {
        firstName: order.shippingFirstName,
        lastName: order.shippingLastName,
        phone: order.shippingPhone,
        country: order.shippingCountry,
        city: order.shippingCity,
        postalCode: order.shippingPostalCode,
        street: order.shippingStreet,
        streetNumber: order.shippingStreetNumber,
        apartment: order.shippingApartment,
      },

      subtotal: Number(order.subtotal),
      shippingPrice: Number(order.shippingPrice),
      discount: Number(order.discount),
      totalPrice: Number(order.totalPrice),

      items: order.items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
