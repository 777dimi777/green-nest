import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
  ) {}

  @Get('product/:productId')
  @ApiOperation({
    summary: 'Get product reviews',
    description:
      'Returns all reviews, the average rating and the total number of reviews for one published product.',
  })
  @ApiOkResponse({
    description:
      'Product reviews returned successfully.',
  })
  @ApiNotFoundResponse({
    description:
      'Product does not exist or is not published.',
  })
  findByProduct(
    @Param('productId')
    productId: string,
  ) {
    return this.reviewsService.findByProduct(
      productId,
    );
  }

  @Get('my-review/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Get current user review for a product',
    description:
      'Checks whether the authenticated user has already reviewed the selected product.',
  })
  @ApiOkResponse({
    description:
      'Current user review status returned successfully.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token is missing or invalid.',
  })
  findMyReview(
    @CurrentUser('id')
    userId: string,

    @Param('productId')
    productId: string,
  ) {
    return this.reviewsService.findMyReview(
      userId,
      productId,
    );
  }

  @Post('product/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a product review',
    description:
      'Allows an authenticated user to create one review for a published product.',
  })
  @ApiOkResponse({
    description:
      'Review created successfully.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token is missing or invalid.',
  })
  @ApiNotFoundResponse({
    description:
      'Product does not exist or is not published.',
  })
  @ApiConflictResponse({
    description:
      'The current user has already reviewed this product.',
  })
  create(
    @CurrentUser('id')
    userId: string,

    @Param('productId')
    productId: string,

    @Body()
    createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(
      userId,
      productId,
      createReviewDto,
    );
  }

  @Patch(':reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update own review',
    description:
      'Allows the authenticated user to update only their own review.',
  })
  @ApiOkResponse({
    description:
      'Review updated successfully.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description:
      'The review belongs to another user.',
  })
  @ApiNotFoundResponse({
    description:
      'Review does not exist.',
  })
  update(
    @CurrentUser('id')
    userId: string,

    @Param('reviewId')
    reviewId: string,

    @Body()
    updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(
      userId,
      reviewId,
      updateReviewDto,
    );
  }

  @Delete(':reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete own review',
    description:
      'Allows the authenticated user to delete only their own review.',
  })
  @ApiOkResponse({
    description:
      'Review deleted successfully.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description:
      'The review belongs to another user.',
  })
  @ApiNotFoundResponse({
    description:
      'Review does not exist.',
  })
  remove(
    @CurrentUser('id')
    userId: string,

    @Param('reviewId')
    reviewId: string,
  ) {
    return this.reviewsService.remove(
      userId,
      reviewId,
    );
  }
}