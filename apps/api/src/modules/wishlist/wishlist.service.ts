import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class WishlistService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll(userId: string) {
    const wishlistItems =
      await this.prisma.wishlist.findMany({
        where: {
          userId,
        },

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

              _count: {
                select: {
                  reviews: true,
                },
              },
            },
          },
        },
      });

    return {
      data: wishlistItems,
      total: wishlistItems.length,
    };
  }

  async add(
    userId: string,
    productId: string,
  ) {
    const product =
      await this.prisma.product.findFirst({
        where: {
          id: productId,
          published: true,
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Product not found.',
      );
    }

    const existingItem =
      await this.prisma.wishlist.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

    if (existingItem) {
      throw new ConflictException(
        'Product is already in your wishlist.',
      );
    }

    const wishlistItem =
      await this.prisma.wishlist.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },

          product: {
            connect: {
              id: productId,
            },
          },
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
      });

    return {
      message:
        'Product added to wishlist successfully.',
      data: wishlistItem,
    };
  }

  async remove(
    userId: string,
    productId: string,
  ) {
    const wishlistItem =
      await this.prisma.wishlist.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

    if (!wishlistItem) {
      throw new NotFoundException(
        'Product is not in your wishlist.',
      );
    }

    await this.prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return {
      message:
        'Product removed from wishlist successfully.',
    };
  }

  async check(
    userId: string,
    productId: string,
  ) {
    const wishlistItem =
      await this.prisma.wishlist.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        select: {
          id: true,
        },
      });

    return {
      isInWishlist: Boolean(wishlistItem),
    };
  }

  async clear(userId: string) {
    const result =
      await this.prisma.wishlist.deleteMany({
        where: {
          userId,
        },
      });

    return {
      message:
        'Wishlist cleared successfully.',
      removedItems: result.count,
    };
  }
}