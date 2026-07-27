import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsQueryDto } from './dto/products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    await this.ensureCategoryExists(createProductDto.categoryId);

    await this.ensureSkuUnique(createProductDto.sku);

    this.validateDiscountPrice(
      createProductDto.price,
      createProductDto.discountPrice,
    );

    const slug = await this.generateUniqueSlug(createProductDto.name);

    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        slug,
        description: createProductDto.description,
        sku: createProductDto.sku,
        price: createProductDto.price,
        discountPrice: createProductDto.discountPrice,
        stock: createProductDto.stock ?? 0,

        height: createProductDto.height,
        potSize: createProductDto.potSize,
        light: createProductDto.light,
        watering: createProductDto.watering,
        temperature: createProductDto.temperature,
        humidity: createProductDto.humidity,
        difficulty: createProductDto.difficulty,
        growthRate: createProductDto.growthRate,
        origin: createProductDto.origin,
        toxicity: createProductDto.toxicity,

        airPurifying: createProductDto.airPurifying ?? false,

        petFriendly: createProductDto.petFriendly ?? true,

        featured: createProductDto.featured ?? false,

        published: createProductDto.published ?? true,

        category: {
          connect: {
            id: createProductDto.categoryId,
          },
        },

        images: createProductDto.images?.length
          ? {
              create: createProductDto.images,
            }
          : undefined,
      },

      include: {
        category: true,
        images: true,
      },
    });
  }
  async findAll(query: ProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where = {
      published: true,

      ...(query.search
        ? {
            OR: [
              {
                name: {
                  contains: query.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                description: {
                  contains: query.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                sku: {
                  contains: query.search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),

      ...(query.categoryId
        ? {
            categoryId: query.categoryId,
          }
        : {}),

      ...(query.featured !== undefined
        ? {
            featured: query.featured,
          }
        : {}),

      ...(query.inStock
        ? {
            stock: {
              gt: 0,
            },
          }
        : {}),

      ...(query.minPrice !== undefined || query.maxPrice !== undefined
        ? {
            price: {
              ...(query.minPrice !== undefined
                ? {
                    gte: query.minPrice,
                  }
                : {}),

              ...(query.maxPrice !== undefined
                ? {
                    lte: query.maxPrice,
                  }
                : {}),
            },
          }
        : {}),
    };

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,

        orderBy: {
          [sortBy]: sortOrder,
        },

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
      }),

      this.prisma.product.count({
        where,
      }),
    ]);

    return {
      data: products,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasPreviousPage: page > 1,
        hasNextPage: page * limit < total,
      },
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        published: true,
      },

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

        reviews: {
          orderBy: {
            createdAt: 'desc',
          },

          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return product;
  }
  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
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
            wishlist: true,
            orderItems: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const existingProduct = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found.');
    }

    if (updateProductDto.categoryId) {
      await this.ensureCategoryExists(updateProductDto.categoryId);
    }

    if (updateProductDto.sku && updateProductDto.sku !== existingProduct.sku) {
      await this.ensureSkuUnique(updateProductDto.sku);
    }

    const finalPrice =
      updateProductDto.price !== undefined
        ? updateProductDto.price
        : Number(existingProduct.price);

    const finalDiscountPrice =
      updateProductDto.discountPrice !== undefined
        ? updateProductDto.discountPrice
        : existingProduct.discountPrice !== null
          ? Number(existingProduct.discountPrice)
          : undefined;

    this.validateDiscountPrice(finalPrice, finalDiscountPrice);

    let slug = existingProduct.slug;

    if (
      updateProductDto.name &&
      updateProductDto.name !== existingProduct.name
    ) {
      slug = await this.generateUniqueSlug(updateProductDto.name, id);
    }

    const { categoryId, images, ...productData } = updateProductDto;

    return this.prisma.$transaction(async (tx) => {
      if (images !== undefined) {
        await tx.productImage.deleteMany({
          where: {
            productId: id,
          },
        });
      }

      return tx.product.update({
        where: {
          id,
        },
        data: {
          ...productData,
          slug,

          ...(categoryId
            ? {
                category: {
                  connect: {
                    id: categoryId,
                  },
                },
              }
            : {}),

          ...(images !== undefined
            ? {
                images: {
                  create: images,
                },
              }
            : {}),
        },
        include: {
          category: true,
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
      });
    });
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    if (product._count.orderItems > 0) {
      throw new ConflictException(
        'Product cannot be deleted because it exists in an order.',
      );
    }

    await this.prisma.product.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Product deleted successfully.',
    };
  }
  private async ensureCategoryExists(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found.');
    }
  }

  private async ensureSkuUnique(sku: string) {
    const existing = await this.prisma.product.findUnique({
      where: {
        sku,
      },
    });

    if (existing) {
      throw new ConflictException('SKU already exists.');
    }
  }

  private validateDiscountPrice(price: number, discountPrice?: number) {
    if (discountPrice && discountPrice >= price) {
      throw new BadRequestException(
        'Discount price must be lower than regular price.',
      );
    }
  }

 private async generateUniqueSlug(
  name: string,
  excludedProductId?: string,
) {
  const baseSlug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'dj')
    .replace(/Đ/g, 'dj')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let slug = baseSlug;
  let counter = 1;

  while (
    await this.prisma.product.findFirst({
      where: {
        slug,

        ...(excludedProductId
          ? {
              id: {
                not: excludedProductId,
              },
            }
          : {}),
      },
    })
  ) {
    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
}
}
