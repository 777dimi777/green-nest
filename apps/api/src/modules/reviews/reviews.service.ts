import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findByProduct(productId: string) {
    const product =
      await this.prisma.product.findFirst({
        where: {
          id: productId,
          published: true,
        },

        select: {
          id: true,
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Product not found.',
      );
    }

    const reviews =
      await this.prisma.review.findMany({
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

    const aggregate =
      await this.prisma.review.aggregate({
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
        averageRating:
          aggregate._avg.rating ?? 0,

        totalReviews:
          aggregate._count.rating,
      },
    };
  }

  async create(
    userId: string,
    productId: string,
    createReviewDto: CreateReviewDto,
  ) {
    const product =
      await this.prisma.product.findFirst({
        where: {
          id: productId,
          published: true,
        },

        select: {
          id: true,
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Product not found.',
      );
    }

    const existingReview =
      await this.prisma.review.findFirst({
        where: {
          userId,
          productId,
        },
      });

    if (existingReview) {
      throw new ConflictException(
        'You have already reviewed this product.',
      );
    }

    const review =
      await this.prisma.review.create({
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
      message:
        'Review created successfully.',
      data: review,
    };
  }

  async update(
    userId: string,
    reviewId: string,
    updateReviewDto: UpdateReviewDto,
  ) {
    const review =
      await this.prisma.review.findUnique({
        where: {
          id: reviewId,
        },
      });

    if (!review) {
      throw new NotFoundException(
        'Review not found.',
      );
    }

    if (review.userId !== userId) {
      throw new ForbiddenException(
        'You can only update your own review.',
      );
    }

    const updatedReview =
      await this.prisma.review.update({
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
      message:
        'Review updated successfully.',
      data: updatedReview,
    };
  }

  async remove(
    userId: string,
    reviewId: string,
  ) {
    const review =
      await this.prisma.review.findUnique({
        where: {
          id: reviewId,
        },
      });

    if (!review) {
      throw new NotFoundException(
        'Review not found.',
      );
    }

    if (review.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own review.',
      );
    }

    await this.prisma.review.delete({
      where: {
        id: reviewId,
      },
    });

    return {
      message:
        'Review deleted successfully.',
    };
  }

  async findMyReview(
    userId: string,
    productId: string,
  ) {
    const review =
      await this.prisma.review.findFirst({
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