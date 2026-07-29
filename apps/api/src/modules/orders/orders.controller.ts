import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrdersQueryDto } from './dto/orders-query.dto';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(
      user.id,
      createOrderDto.addressId,
      createOrderDto.couponCode,
    );
  }

  @Get('my')
  @ApiOperation({
    summary: 'Pregled svih porudžbina prijavljenog korisnika',
  })
  findMyOrders(@CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.findMyOrders(user.id);
  }

  @Get('my/:id')
  @ApiOperation({
    summary: 'Pregled jedne porudžbine prijavljenog korisnika',
  })
  findMyOrderById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') orderId: string,
  ) {
    return this.ordersService.findMyOrderById(user.id, orderId);
  }
  @Patch('my/:id/cancel')
  @ApiOperation({
    summary: 'Otkazivanje porudžbine prijavljenog korisnika',
  })
  cancelMyOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') orderId: string,
  ) {
    return this.ordersService.cancelMyOrder(user.id, orderId);
  }
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Admin pregled svih porudžbina sa filterima i paginacijom',
  })
  findAll(@Query() query: OrdersQueryDto) {
    return this.ordersService.findAll(query);
  }

  @Get('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Admin pregled jedne porudžbine',
  })
  findOne(@Param('id') orderId: string) {
    return this.ordersService.findOne(orderId);
  }

  @Patch('admin/:id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Admin promena statusa porudžbine',
  })
  updateStatus(
    @Param('id') orderId: string,
    @Body()
    updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(
      orderId,
      updateOrderStatusDto.status,
    );
  }
  @Patch('admin/:id/payment-status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Admin promena statusa plaćanja porudžbine',
  })
  updatePaymentStatus(
    @Param('id') orderId: string,
    @Body() updatePaymentStatusDto: UpdatePaymentStatusDto,
  ) {
    return this.ordersService.updatePaymentStatus(
      orderId,
      updatePaymentStatusDto.paymentStatus,
    );
  }
  @Patch('admin/:id/cancel')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Admin otkazivanje porudžbine',
  })
  cancelOrder(@Param('id') orderId: string) {
    return this.ordersService.cancelOrder(orderId);
  }
}
