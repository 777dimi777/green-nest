import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { unlink } from 'fs/promises';
import { basename, resolve, sep } from 'path';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsQueryDto } from './dto/products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  PRODUCT_UPLOAD_DIRECTORY,
  PRODUCT_UPLOAD_URL_PREFIX,
} from './product-upload.config';
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
        images: {
          select: {
            url: true,
          },
        },
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

    await Promise.all(
      product.images.map((image) => this.deleteLocalImageFile(image.url)),
    );

    return {
      message: 'Product deleted successfully.',
    };
  }

  async updatePublished(id: string, published: boolean) {
    await this.ensureProductExists(id);
    return this.prisma.product.update({
      where: { id },
      data: { published },
      include: { category: true, images: true },
    });
  }

  async updateStock(id: string, stock: number) {
    await this.ensureProductExists(id);
    return this.prisma.product.update({
      where: { id },
      data: { stock },
      include: { category: true, images: true },
    });
  }

  async uploadImage(
    productId: string,
    file: Express.Multer.File | undefined,
    requestedPrimary?: boolean,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required.');
    }

    const imageUrl = `${PRODUCT_UPLOAD_URL_PREFIX}${file.filename}`;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: productId },
          select: {
            id: true,
            _count: {
              select: { images: true },
            },
          },
        });

        if (!product) {
          throw new NotFoundException('Product not found.');
        }

        const isPrimary =
          product._count.images === 0 || requestedPrimary === true;

        if (isPrimary) {
          await tx.productImage.updateMany({
            where: { productId },
            data: { isPrimary: false },
          });
        }

        return tx.productImage.create({
          data: {
            productId,
            url: imageUrl,
            isPrimary,
          },
        });
      });
    } catch (error) {
      await this.deleteLocalImageFile(imageUrl);
      throw error;
    }
  }

  async removeImage(productId: string, imageId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const image = await tx.productImage.findFirst({
        where: {
          id: imageId,
          productId,
        },
      });

      if (!image) {
        throw new NotFoundException(
          'Image not found for the selected product.',
        );
      }

      await tx.productImage.delete({
        where: { id: imageId },
      });

      if (image.isPrimary) {
        const replacement = await tx.productImage.findFirst({
          where: { productId },
          orderBy: { createdAt: 'asc' },
          select: { id: true },
        });

        if (replacement) {
          await tx.productImage.update({
            where: { id: replacement.id },
            data: { isPrimary: true },
          });
        }
      }

      const images = await tx.productImage.findMany({
        where: { productId },
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      });

      return {
        deletedImageUrl: image.url,
        images,
      };
    });

    await this.deleteLocalImageFile(result.deletedImageUrl);

    return {
      message: 'Product image deleted successfully.',
      images: result.images,
    };
  }

  async setPrimaryImage(productId: string, imageId: string) {
    return this.prisma.$transaction(async (tx) => {
      const image = await tx.productImage.findFirst({
        where: {
          id: imageId,
          productId,
        },
        select: { id: true },
      });

      if (!image) {
        throw new NotFoundException(
          'Image not found for the selected product.',
        );
      }

      await tx.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });

      await tx.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      });

      return tx.productImage.findMany({
        where: { productId },
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      });
    });
  }

  private async ensureProductExists(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found.');
    }
  }

  private async deleteLocalImageFile(imageUrl: string) {
    const filePath = this.getLocalImageFilePath(imageUrl);

    if (!filePath) {
      return;
    }

    try {
      await unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        // File cleanup is best-effort after the database operation succeeds.
      }
    }
  }

  private getLocalImageFilePath(imageUrl: string) {
    if (!imageUrl.startsWith(PRODUCT_UPLOAD_URL_PREFIX)) {
      return null;
    }

    const fileName = imageUrl.slice(PRODUCT_UPLOAD_URL_PREFIX.length);

    if (!fileName || basename(fileName) !== fileName) {
      return null;
    }

    const uploadDirectory = resolve(PRODUCT_UPLOAD_DIRECTORY);
    const filePath = resolve(uploadDirectory, fileName);

    if (!filePath.startsWith(`${uploadDirectory}${sep}`)) {
      return null;
    }

    return filePath;
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

  private async generateUniqueSlug(name: string, excludedProductId?: string) {
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
