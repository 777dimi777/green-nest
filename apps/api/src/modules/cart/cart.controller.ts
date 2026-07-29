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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({
    summary: 'Pregled korpe prijavljenog korisnika',
  })
  findCart(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.findCart(user.id);
  }

  @Post('items')
  @ApiOperation({
    summary: 'Dodavanje proizvoda u korpu',
  })
  addItem(
    @CurrentUser() user: AuthenticatedUser,
    @Body() addCartItemDto: AddCartItemDto,
  ) {
    return this.cartService.addItem(user.id, addCartItemDto);
  }

  @Patch('items/:productId')
  @ApiOperation({
    summary: 'Promena količine proizvoda u korpi',
  })
  updateItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.id, productId, updateCartItemDto);
  }

  @Delete('items/:productId')
  @ApiOperation({
    summary: 'Uklanjanje proizvoda iz korpe',
  })
  removeItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(user.id, productId);
  }

  @Delete()
  @ApiOperation({
    summary: 'Pražnjenje cele korpe',
  })
  clear(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.clear(user.id);
  }
}
