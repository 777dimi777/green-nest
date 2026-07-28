import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(userId: string, addressId: string) {
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
      const discount = new Prisma.Decimal(0);

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

  async findAll() {
    const orders = await this.prisma.order.findMany({
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
    });

    return orders.map((order) => this.formatOrder(order));
  }

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
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
  ) {
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

  private formatOrder(order: any) {
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
