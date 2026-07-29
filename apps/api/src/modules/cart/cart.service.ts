import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async findCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            product: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
                images: {
                  orderBy: [
                    {
                      isPrimary: 'desc',
                    },
                    {
                      createdAt: 'asc',
                    },
                  ],
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return {
        id: null,
        items: [],
        summary: {
          totalItems: 0,
          uniqueItems: 0,
          subtotal: 0,
        },
      };
    }

    return this.formatCart(cart);
  }

  async addItem(userId: string, addCartItemDto: AddCartItemDto) {
    const { productId, quantity } = addCartItemDto;

    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        published: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    if (product.stock <= 0) {
      throw new BadRequestException('Product is currently out of stock.');
    }

    const cart = await this.prisma.cart.upsert({
      where: {
        userId,
      },
      update: {},
      create: {
        userId,
      },
    });

    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    const newQuantity = (existingItem?.quantity ?? 0) + quantity;

    if (newQuantity > product.stock) {
      throw new BadRequestException(
        `Only ${product.stock} item(s) are available in stock.`,
      );
    }

    await this.prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      update: {
        quantity: newQuantity,
      },
      create: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });

    return {
      message: 'Product added to cart successfully.',
      data: await this.findCart(userId),
    };
  }

  async updateItem(
    userId: string,
    productId: string,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    const { quantity } = updateCartItemDto;

    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found.');
    }

    const item = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      include: {
        product: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Product is not in your cart.');
    }

    if (!item.product.published) {
      throw new BadRequestException('Product is no longer available.');
    }

    if (quantity > item.product.stock) {
      throw new BadRequestException(
        `Only ${item.product.stock} item(s) are available in stock.`,
      );
    }

    await this.prisma.cartItem.update({
      where: {
        id: item.id,
      },
      data: {
        quantity,
      },
    });

    return {
      message: 'Cart item updated successfully.',
      data: await this.findCart(userId),
    };
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found.');
    }

    const item = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Product is not in your cart.');
    }

    await this.prisma.cartItem.delete({
      where: {
        id: item.id,
      },
    });

    return {
      message: 'Product removed from cart successfully.',
      data: await this.findCart(userId),
    };
  }

  async clear(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (!cart) {
      return {
        message: 'Cart is already empty.',
        removedItems: 0,
      };
    }

    const result = await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return {
      message: 'Cart cleared successfully.',
      removedItems: result.count,
    };
  }

  private formatCart(cart: {
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    items: Array<{
      id: string;
      quantity: number;
      cartId: string;
      productId: string;
      createdAt: Date;
      updatedAt: Date;
      product: {
        id: string;
        name: string;
        slug: string;
        description: string;
        sku: string;
        price: {
          toString(): string;
        };

        discountPrice: {
          toString(): string;
        } | null;
        stock: number;
        published: boolean;
        category: {
          id: string;
          name: string;
          slug: string;
        };
        images: Array<{
          id: string;
          url: string;
          alt: string | null;
          isPrimary: boolean;
          productId: string;
          createdAt: Date;
        }>;
      };
    }>;
  }) {
    const items = cart.items.map((item) => {
      const unitPrice =
        item.product.discountPrice !== null
          ? Number(item.product.discountPrice)
          : Number(item.product.price);

      const lineTotal = unitPrice * item.quantity;

      return {
        ...item,
        unitPrice,
        lineTotal,
        available: item.product.published && item.product.stock > 0,
        exceedsStock: item.quantity > item.product.stock,
      };
    });

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

    return {
      id: cart.id,
      items,
      summary: {
        totalItems,
        uniqueItems: items.length,
        subtotal: Number(subtotal.toFixed(2)),
      },
    };
  }
}
