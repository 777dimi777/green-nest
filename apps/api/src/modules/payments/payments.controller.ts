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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsQueryDto } from './dto/payments-query.dto';
import { UpdatePaymentTransactionStatusDto } from './dto/update-payment-transaction-status.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('orders/:orderId')
  @ApiOperation({ summary: 'Pokretanje plaćanja za svoju porudžbinu' })
  @ApiCreatedResponse({ description: 'Payment pokušaj je kreiran.' })
  @ApiBadRequestResponse({ description: 'Plaćanje nije dozvoljeno.' })
  @ApiNotFoundResponse({ description: 'Porudžbina nije pronađena.' })
  @ApiConflictResponse({ description: 'Porudžbina je već plaćena.' })
  createPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId') orderId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPayment(user.id, orderId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Pregled svojih plaćanja' })
  @ApiOkResponse({ description: 'Plaćanja sortirana od najnovijeg.' })
  findMyPayments(@CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.findMyPayments(user.id);
  }

  @Get('my/:id')
  @ApiOperation({ summary: 'Pregled jednog svog plaćanja' })
  @ApiOkResponse({ description: 'Detalji plaćanja.' })
  @ApiNotFoundResponse({ description: 'Plaćanje nije pronađeno.' })
  findMyPaymentById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') paymentId: string,
  ) {
    return this.paymentsService.findMyPaymentById(user.id, paymentId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin pregled plaćanja sa filterima' })
  @ApiOkResponse({ description: 'Paginirana lista plaćanja.' })
  findAll(@Query() query: PaymentsQueryDto) {
    return this.paymentsService.findAll(query);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin pregled jednog plaćanja' })
  @ApiOkResponse({ description: 'Detalji plaćanja.' })
  @ApiNotFoundResponse({ description: 'Plaćanje nije pronađeno.' })
  findOne(@Param('id') paymentId: string) {
    return this.paymentsService.findOne(paymentId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin promena statusa plaćanja' })
  @ApiOkResponse({ description: 'Status je uspešno promenjen.' })
  @ApiBadRequestResponse({ description: 'Promena statusa nije dozvoljena.' })
  @ApiNotFoundResponse({ description: 'Plaćanje nije pronađeno.' })
  updateStatus(
    @Param('id') paymentId: string,
    @Body() dto: UpdatePaymentTransactionStatusDto,
  ) {
    return this.paymentsService.updateStatus(paymentId, dto);
  }
}
