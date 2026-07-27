import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { WishlistService } from './wishlist.service';

@ApiTags('Wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(
    private readonly wishlistService: WishlistService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get current user wishlist',
    description:
      'Returns all products saved in the currently authenticated user wishlist.',
  })
  @ApiOkResponse({
    description:
      'Wishlist returned successfully.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token is missing or invalid.',
  })
  findAll(
    @CurrentUser('id')
    userId: string,
  ) {
    return this.wishlistService.findAll(userId);
  }

  @Get('check/:productId')
  @ApiOperation({
    summary: 'Check whether a product is in wishlist',
    description:
      'Checks whether the current user has already saved the selected product.',
  })
  @ApiOkResponse({
    description:
      'Wishlist status returned successfully.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token is missing or invalid.',
  })
  check(
    @CurrentUser('id')
    userId: string,

    @Param('productId')
    productId: string,
  ) {
    return this.wishlistService.check(
      userId,
      productId,
    );
  }

  @Post(':productId')
  @ApiOperation({
    summary: 'Add product to wishlist',
    description:
      'Adds a published product to the current user wishlist.',
  })
  @ApiOkResponse({
    description:
      'Product added to wishlist successfully.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token is missing or invalid.',
  })
  @ApiNotFoundResponse({
    description:
      'Selected product does not exist or is not published.',
  })
  @ApiConflictResponse({
    description:
      'Product is already in the wishlist.',
  })
  add(
    @CurrentUser('id')
    userId: string,

    @Param('productId')
    productId: string,
  ) {
    return this.wishlistService.add(
      userId,
      productId,
    );
  }

  @Delete('clear')
  @ApiOperation({
    summary: 'Clear wishlist',
    description:
      'Removes every product from the current user wishlist.',
  })
  @ApiOkResponse({
    description:
      'Wishlist cleared successfully.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token is missing or invalid.',
  })
  clear(
    @CurrentUser('id')
    userId: string,
  ) {
    return this.wishlistService.clear(userId);
  }

  @Delete(':productId')
  @ApiOperation({
    summary: 'Remove product from wishlist',
    description:
      'Removes one selected product from the current user wishlist.',
  })
  @ApiOkResponse({
    description:
      'Product removed from wishlist successfully.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token is missing or invalid.',
  })
  @ApiNotFoundResponse({
    description:
      'Product is not in the current user wishlist.',
  })
  remove(
    @CurrentUser('id')
    userId: string,

    @Param('productId')
    productId: string,
  ) {
    return this.wishlistService.remove(
      userId,
      productId,
    );
  }
}