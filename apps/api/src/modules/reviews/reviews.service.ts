import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsQueryDto } from './dto/reviews-query.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ReviewsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where = {
      ...(query.productId && { productId: query.productId }),
      ...(query.userId && { userId: query.userId }),
      ...(query.rating !== undefined && { rating: query.rating }),
    };
    const [reviews, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
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
          product: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit);

    return {
      data: reviews,
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

  async findByProduct(productId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        published: true,
      },

      select: {
        id: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    const reviews = await this.prisma.review.findMany({
      where: {
        productId,
      },

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
    });

    const aggregate = await this.prisma.review.aggregate({
      where: {
        productId,
      },

      _avg: {
        rating: true,
      },

      _count: {
        rating: true,
      },
    });

    return {
      data: reviews,

      summary: {
        averageRating: aggregate._avg.rating ?? 0,

        totalReviews: aggregate._count.rating,
      },
    };
  }

  async create(
    userId: string,
    productId: string,
    createReviewDto: CreateReviewDto,
  ) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        published: true,
      },

      select: {
        id: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    const existingReview = await this.prisma.review.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this product.');
    }

    const review = await this.prisma.review.create({
      data: {
        ...createReviewDto,

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
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      message: 'Review created successfully.',
      data: review,
    };
  }

  async update(
    userId: string,
    reviewId: string,
    updateReviewDto: UpdateReviewDto,
  ) {
    const review = await this.prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own review.');
    }

    const updatedReview = await this.prisma.review.update({
      where: {
        id: reviewId,
      },

      data: updateReviewDto,

      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      message: 'Review updated successfully.',
      data: updatedReview,
    };
  }

  async remove(userId: string, reviewId: string, isAdmin = false) {
    const review = await this.prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    if (!isAdmin && review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own review.');
    }

    await this.prisma.review.delete({
      where: {
        id: reviewId,
      },
    });

    return {
      message: 'Review deleted successfully.',
    };
  }

  async findMyReview(userId: string, productId: string) {
    const review = await this.prisma.review.findFirst({
      where: {
        userId,
        productId,
      },
    });

    return {
      hasReviewed: Boolean(review),
      review,
    };
  }
}
