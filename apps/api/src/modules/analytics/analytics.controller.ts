import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AnalyticsService } from './analytics.service';
import { AnalyticsRangeQueryDto } from './dto/analytics-range-query.dto';
import { LowStockQueryDto } from './dto/low-stock-query.dto';
import { RecentActivityQueryDto } from './dto/recent-activity-query.dto';
import { TopProductsQueryDto } from './dto/top-products-query.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Glavni admin dashboard pregled',
    description:
      'Prihod i order metrike su za izabrani period; users predstavlja nove korisnike, a products ukupan broj objavljenih proizvoda.',
  })
  @ApiOkResponse({ description: 'Dashboard metrike.' })
  @ApiBadRequestResponse({ description: 'Neispravan datumski opseg.' })
  getOverview(@Query() query: AnalyticsRangeQueryDto) {
    return this.analyticsService.getOverview(query);
  }

  @Get('revenue-series')
  @ApiOperation({ summary: 'Prihod i broj plaćenih porudžbina kroz vreme' })
  @ApiOkResponse({ description: 'Dnevna ili mesečna vremenska serija.' })
  @ApiBadRequestResponse({ description: 'Neispravan datumski opseg.' })
  getRevenueSeries(@Query() query: AnalyticsRangeQueryDto) {
    return this.analyticsService.getRevenueSeries(query);
  }

  @Get('orders-by-status')
  @ApiOperation({ summary: 'Porudžbine grupisane po statusu' })
  @ApiOkResponse({ description: 'Brojevi i procenti svih order statusa.' })
  @ApiBadRequestResponse({ description: 'Neispravan datumski opseg.' })
  getOrdersByStatus(@Query() query: AnalyticsRangeQueryDto) {
    return this.analyticsService.getOrdersByStatus(query);
  }

  @Get('top-products')
  @ApiOperation({
    summary: 'Najprodavaniji proizvodi',
    description:
      'Koristi snapshot cenu OrderItem-a iz plaćenih, neotkazanih porudžbina.',
  })
  @ApiOkResponse({ description: 'Proizvodi sortirani po prodatoj količini.' })
  @ApiBadRequestResponse({ description: 'Neispravan opseg ili limit.' })
  getTopProducts(@Query() query: TopProductsQueryDto) {
    return this.analyticsService.getTopProducts(query);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Objavljeni proizvodi sa malim zalihama' })
  @ApiOkResponse({ description: 'Proizvodi čiji je stock ispod praga.' })
  @ApiBadRequestResponse({ description: 'Neispravan threshold ili limit.' })
  getLowStock(@Query() query: LowStockQueryDto) {
    return this.analyticsService.getLowStock(query);
  }

  @Get('users-series')
  @ApiOperation({ summary: 'Novi korisnici kroz vreme' })
  @ApiOkResponse({ description: 'Dnevna ili mesečna serija registracija.' })
  @ApiBadRequestResponse({ description: 'Neispravan datumski opseg.' })
  getUsersSeries(@Query() query: AnalyticsRangeQueryDto) {
    return this.analyticsService.getUsersSeries(query);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Payment pokušaji, ishodi i uspešnost' })
  @ApiOkResponse({ description: 'Payment metrike po statusu i metodi.' })
  @ApiBadRequestResponse({ description: 'Neispravan datumski opseg.' })
  getPaymentAnalytics(@Query() query: AnalyticsRangeQueryDto) {
    return this.analyticsService.getPaymentAnalytics(query);
  }

  @Get('coupons')
  @ApiOperation({
    summary: 'Korišćenje kupona',
    description:
      'Popust koristi istorijski Order.discount snapshot, ne trenutne vrednosti kupona.',
  })
  @ApiOkResponse({ description: 'Coupon usage i discount metrike.' })
  @ApiBadRequestResponse({ description: 'Neispravan datumski opseg.' })
  getCouponAnalytics(@Query() query: AnalyticsRangeQueryDto) {
    return this.analyticsService.getCouponAnalytics(query);
  }

  @Get('recent-activity')
  @ApiOperation({
    summary: 'Poslednje porudžbine, payment pokušaji i registracije',
  })
  @ApiOkResponse({ description: 'Objedinjena recent activity lista.' })
  @ApiBadRequestResponse({ description: 'Neispravan limit.' })
  getRecentActivity(@Query() query: RecentActivityQueryDto) {
    return this.analyticsService.getRecentActivity(query);
  }
}
