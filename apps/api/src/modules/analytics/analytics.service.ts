import { BadRequestException, Injectable } from '@nestjs/common';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentTransactionStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  AnalyticsPeriod,
  AnalyticsRangeQueryDto,
} from './dto/analytics-range-query.dto';
import { LowStockQueryDto } from './dto/low-stock-query.dto';
import { RecentActivityQueryDto } from './dto/recent-activity-query.dto';
import { TopProductsQueryDto } from './dto/top-products-query.dto';

type ResolvedRange = {
  from: Date | null;
  to: Date | null;
  periodLabel: string;
};

type SeriesGranularity = 'DAY' | 'MONTH';

type RecentActivity = {
  type:
    | 'ORDER_CREATED'
    | 'ORDER_STATUS_CHANGED'
    | 'PAYMENT_COMPLETED'
    | 'PAYMENT_FAILED'
    | 'PAYMENT_PENDING'
    | 'PAYMENT_REFUNDED'
    | 'USER_REGISTERED';
  timestamp: string;
  title: string;
  description: string;
  entityId: string;
  metadata: Record<string, string | number>;
};

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(query: AnalyticsRangeQueryDto) {
    const range = this.resolveRange(query);
    const dateWhere = this.createdAtWhere(range);
    const paidOrderWhere: Prisma.OrderWhereInput = {
      ...dateWhere,
      paymentStatus: PaymentStatus.PAID,
      status: { not: OrderStatus.CANCELLED },
    };

    const [
      revenueAggregate,
      paidOrders,
      orders,
      users,
      products,
      completedPayments,
      failedPayments,
      couponsUsed,
    ] = await this.prisma.$transaction([
      this.prisma.order.aggregate({
        where: paidOrderWhere,
        _sum: { totalPrice: true },
      }),
      this.prisma.order.count({ where: paidOrderWhere }),
      this.prisma.order.count({ where: dateWhere }),
      this.prisma.user.count({ where: dateWhere }),
      this.prisma.product.count({ where: { published: true } }),
      this.prisma.payment.count({
        where: {
          ...dateWhere,
          status: PaymentTransactionStatus.COMPLETED,
        },
      }),
      this.prisma.payment.count({
        where: { ...dateWhere, status: PaymentTransactionStatus.FAILED },
      }),
      this.prisma.couponUsage.count({
        where: this.usedAtWhere(range),
      }),
    ]);
    const orderGroups = await this.prisma.order.groupBy({
      by: ['status'],
      where: dateWhere,
      _count: { _all: true },
    });
    const orderPaymentGroups = await this.prisma.order.groupBy({
      by: ['paymentStatus'],
      where: dateWhere,
      _count: { _all: true },
    });

    const revenue = revenueAggregate._sum.totalPrice ?? new Prisma.Decimal(0);
    const orderStatusCounts = new Map(
      orderGroups.map((group) => [group.status, group._count._all]),
    );
    const paymentStatusCounts = new Map(
      orderPaymentGroups.map((group) => [
        group.paymentStatus,
        group._count._all,
      ]),
    );

    return {
      range: this.formatRange(range),
      totals: {
        revenue: this.decimalToOutput(revenue),
        orders,
        users,
        products,
        completedPayments,
        failedPayments,
        couponsUsed,
      },
      averages: {
        orderValue: this.decimalToOutput(
          paidOrders > 0 ? revenue.div(paidOrders) : new Prisma.Decimal(0),
        ),
      },
      orderStatuses: {
        pending: orderStatusCounts.get(OrderStatus.PENDING) ?? 0,
        confirmed: orderStatusCounts.get(OrderStatus.CONFIRMED) ?? 0,
        shipped: orderStatusCounts.get(OrderStatus.SHIPPED) ?? 0,
        delivered: orderStatusCounts.get(OrderStatus.DELIVERED) ?? 0,
        cancelled: orderStatusCounts.get(OrderStatus.CANCELLED) ?? 0,
      },
      paymentStatuses: {
        pending: paymentStatusCounts.get(PaymentStatus.PENDING) ?? 0,
        paid: paymentStatusCounts.get(PaymentStatus.PAID) ?? 0,
        refunded: paymentStatusCounts.get(PaymentStatus.REFUNDED) ?? 0,
      },
    };
  }

  async getRevenueSeries(query: AnalyticsRangeQueryDto) {
    const range = this.resolveRange(query);
    const orders = await this.prisma.order.findMany({
      where: {
        ...this.createdAtWhere(range),
        paymentStatus: PaymentStatus.PAID,
        status: { not: OrderStatus.CANCELLED },
      },
      select: { createdAt: true, totalPrice: true },
      orderBy: { createdAt: 'asc' },
    });
    const seriesRange = this.ensureFiniteRange(
      range,
      orders.map((order) => order.createdAt),
    );
    const granularity = this.getGranularity(seriesRange);
    const buckets = new Map<
      string,
      { revenue: Prisma.Decimal; orders: number }
    >();

    for (const order of orders) {
      const key = this.dateKey(order.createdAt, granularity);
      const current = buckets.get(key) ?? {
        revenue: new Prisma.Decimal(0),
        orders: 0,
      };
      current.revenue = current.revenue.add(order.totalPrice);
      current.orders += 1;
      buckets.set(key, current);
    }

    return {
      range: this.formatRange(range),
      granularity,
      data: this.generateKeys(seriesRange, granularity).map((date) => {
        const bucket = buckets.get(date);
        return {
          date,
          revenue: this.decimalToOutput(
            bucket?.revenue ?? new Prisma.Decimal(0),
          ),
          orders: bucket?.orders ?? 0,
        };
      }),
    };
  }

  async getOrdersByStatus(query: AnalyticsRangeQueryDto) {
    const range = this.resolveRange(query);
    const groups = await this.prisma.order.groupBy({
      by: ['status'],
      where: this.createdAtWhere(range),
      _count: { _all: true },
    });
    const counts = new Map(
      groups.map((group) => [group.status, group._count._all]),
    );
    const total = groups.reduce((sum, group) => sum + group._count._all, 0);

    return {
      range: this.formatRange(range),
      total,
      statuses: Object.values(OrderStatus).map((status) => {
        const count = counts.get(status) ?? 0;
        return {
          status,
          count,
          percentage:
            total === 0 ? 0 : Math.round((count / total) * 10000) / 100,
        };
      }),
    };
  }

  async getTopProducts(query: TopProductsQueryDto) {
    const range = this.resolveRange(query);
    const items = await this.prisma.orderItem.findMany({
      where: {
        order: {
          ...this.createdAtWhere(range),
          paymentStatus: PaymentStatus.PAID,
          status: { not: OrderStatus.CANCELLED },
        },
      },
      select: {
        productId: true,
        quantity: true,
        price: true,
        product: {
          select: {
            name: true,
            slug: true,
            stock: true,
            images: {
              where: { isPrimary: true },
              select: { url: true },
              take: 1,
            },
          },
        },
      },
    });
    const grouped = new Map<
      string,
      {
        productId: string;
        name: string;
        slug: string;
        imageUrl: string | null;
        unitsSold: number;
        revenue: Prisma.Decimal;
        currentStock: number;
      }
    >();

    for (const item of items) {
      const current = grouped.get(item.productId) ?? {
        productId: item.productId,
        name: item.product.name,
        slug: item.product.slug,
        imageUrl: item.product.images[0]?.url ?? null,
        unitsSold: 0,
        revenue: new Prisma.Decimal(0),
        currentStock: item.product.stock,
      };
      current.unitsSold += item.quantity;
      current.revenue = current.revenue.add(item.price.mul(item.quantity));
      grouped.set(item.productId, current);
    }

    const data = [...grouped.values()]
      .sort(
        (left, right) =>
          right.unitsSold - left.unitsSold ||
          right.revenue.comparedTo(left.revenue),
      )
      .slice(0, query.limit ?? 10)
      .map((product) => ({
        ...product,
        revenue: this.decimalToOutput(product.revenue),
      }));

    return { range: this.formatRange(range), data };
  }

  async getLowStock(query: LowStockQueryDto) {
    const threshold = query.threshold ?? 10;
    const limit = query.limit ?? 20;
    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({
        where: { published: true, stock: { lte: threshold } },
      }),
      this.prisma.product.findMany({
        where: { published: true, stock: { lte: threshold } },
        select: {
          id: true,
          name: true,
          slug: true,
          stock: true,
          published: true,
          category: { select: { id: true, name: true } },
        },
        orderBy: [{ stock: 'asc' }, { name: 'asc' }],
        take: limit,
      }),
    ]);

    return {
      threshold,
      total,
      data: products.map(({ published, ...product }) => ({
        ...product,
        active: published,
      })),
    };
  }

  async getUsersSeries(query: AnalyticsRangeQueryDto) {
    const range = this.resolveRange(query);
    const users = await this.prisma.user.findMany({
      where: this.createdAtWhere(range),
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    const seriesRange = this.ensureFiniteRange(
      range,
      users.map((user) => user.createdAt),
    );
    const granularity = this.getGranularity(seriesRange);
    const counts = new Map<string, number>();

    for (const user of users) {
      const key = this.dateKey(user.createdAt, granularity);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return {
      range: this.formatRange(range),
      granularity,
      data: this.generateKeys(seriesRange, granularity).map((date) => ({
        date,
        users: counts.get(date) ?? 0,
      })),
    };
  }

  async getPaymentAnalytics(query: AnalyticsRangeQueryDto) {
    const range = this.resolveRange(query);
    const groups = await this.prisma.payment.groupBy({
      by: ['method', 'status'],
      where: this.createdAtWhere(range),
      _count: { _all: true },
    });
    const statusCount = (status: PaymentTransactionStatus) =>
      groups
        .filter((group) => group.status === status)
        .reduce((sum, group) => sum + group._count._all, 0);
    const completed = statusCount(PaymentTransactionStatus.COMPLETED);
    const failed = statusCount(PaymentTransactionStatus.FAILED);
    const denominator = completed + failed;

    return {
      range: this.formatRange(range),
      totals: {
        attempts: groups.reduce((sum, group) => sum + group._count._all, 0),
        completed,
        failed,
        pending: statusCount(PaymentTransactionStatus.PENDING),
        refunded: statusCount(PaymentTransactionStatus.REFUNDED),
      },
      methods: Object.values(PaymentMethod).map((method) => {
        const methodGroups = groups.filter((group) => group.method === method);
        const countFor = (status: PaymentTransactionStatus) =>
          methodGroups
            .filter((group) => group.status === status)
            .reduce((sum, group) => sum + group._count._all, 0);
        return {
          method,
          count: methodGroups.reduce(
            (sum, group) => sum + group._count._all,
            0,
          ),
          completed: countFor(PaymentTransactionStatus.COMPLETED),
          failed: countFor(PaymentTransactionStatus.FAILED),
        };
      }),
      successRate:
        denominator === 0
          ? 0
          : Math.round((completed / denominator) * 10000) / 100,
    };
  }

  async getCouponAnalytics(query: AnalyticsRangeQueryDto) {
    const range = this.resolveRange(query);
    const usageGroups = await this.prisma.couponUsage.groupBy({
      by: ['couponId'],
      where: this.usedAtWhere(range),
      _count: { _all: true },
    });
    const orders = await this.prisma.order.findMany({
      where: {
        ...this.createdAtWhere(range),
        couponId: { not: null },
      },
      select: { couponId: true, discount: true },
    });
    const couponIds = [
      ...new Set([
        ...usageGroups.map((group) => group.couponId),
        ...orders.flatMap((order) => (order.couponId ? [order.couponId] : [])),
      ]),
    ];
    const coupons = await this.prisma.coupon.findMany({
      where: { id: { in: couponIds } },
      select: { id: true, code: true },
    });
    const couponById = new Map(coupons.map((coupon) => [coupon.id, coupon]));
    const discounts = new Map<string, Prisma.Decimal>();
    let totalDiscount = new Prisma.Decimal(0);

    for (const order of orders) {
      if (!order.couponId) continue;
      totalDiscount = totalDiscount.add(order.discount);
      discounts.set(
        order.couponId,
        (discounts.get(order.couponId) ?? new Prisma.Decimal(0)).add(
          order.discount,
        ),
      );
    }

    const topCoupons = usageGroups
      .sort((left, right) => right._count._all - left._count._all)
      .slice(0, 10)
      .map((group) => ({
        couponId: group.couponId,
        code: couponById.get(group.couponId)?.code ?? 'DELETED',
        usages: group._count._all,
        totalDiscount: this.decimalToOutput(
          discounts.get(group.couponId) ?? new Prisma.Decimal(0),
        ),
      }));

    return {
      range: this.formatRange(range),
      totals: {
        usages: usageGroups.reduce((sum, group) => sum + group._count._all, 0),
        uniqueCoupons: usageGroups.length,
        discountedOrders: orders.length,
        totalDiscount: this.decimalToOutput(totalDiscount),
      },
      topCoupons,
    };
  }

  async getRecentActivity(query: RecentActivityQueryDto) {
    const limit = query.limit ?? 20;
    const [orders, payments, users] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalPrice: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      this.prisma.payment.findMany({
        select: {
          id: true,
          method: true,
          status: true,
          amount: true,
          createdAt: true,
          order: { select: { orderNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      this.prisma.user.findMany({
        select: { id: true, email: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    ]);

    const orderActivities: RecentActivity[] = orders.map((order) => ({
      type: 'ORDER_CREATED',
      timestamp: order.createdAt.toISOString(),
      title: 'Nova porudžbina',
      description: `Kreirana je porudžbina ${order.orderNumber}.`,
      entityId: order.id,
      metadata: {
        orderNumber: order.orderNumber,
        status: order.status,
        amount: this.decimalToOutput(order.totalPrice),
      },
    }));
    const paymentActivities: RecentActivity[] = payments.map((payment) => ({
      type: this.paymentActivityType(payment.status),
      timestamp: payment.createdAt.toISOString(),
      title: 'Payment aktivnost',
      description: `Payment za porudžbinu ${payment.order.orderNumber}: ${payment.status}.`,
      entityId: payment.id,
      metadata: {
        orderNumber: payment.order.orderNumber,
        method: payment.method,
        status: payment.status,
        amount: this.decimalToOutput(payment.amount),
      },
    }));
    const userActivities: RecentActivity[] = users.map((user) => ({
      type: 'USER_REGISTERED',
      timestamp: user.createdAt.toISOString(),
      title: 'Novi korisnik',
      description: `Registrovan je korisnik ${user.email}.`,
      entityId: user.id,
      metadata: { email: user.email },
    }));

    return {
      data: [...orderActivities, ...paymentActivities, ...userActivities]
        .sort(
          (left, right) =>
            new Date(right.timestamp).getTime() -
            new Date(left.timestamp).getTime(),
        )
        .slice(0, limit),
    };
  }

  private resolveRange(query: AnalyticsRangeQueryDto): ResolvedRange {
    if (query.from || query.to) {
      const from = query.from ? this.startOfDay(new Date(query.from)) : null;
      const to = query.to ? this.endOfDay(new Date(query.to)) : null;
      if (from && to && from > to) {
        throw new BadRequestException(
          'Početni datum ne sme biti posle krajnjeg datuma.',
        );
      }
      return { from, to, periodLabel: 'CUSTOM' };
    }

    const period = query.period ?? AnalyticsPeriod.LAST_30_DAYS;
    const now = new Date();
    const to = this.endOfDay(now);
    if (period === AnalyticsPeriod.ALL_TIME) {
      return { from: null, to: null, periodLabel: period };
    }
    if (period === AnalyticsPeriod.THIS_MONTH) {
      return {
        from: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
        to,
        periodLabel: period,
      };
    }
    if (period === AnalyticsPeriod.THIS_YEAR) {
      return {
        from: new Date(Date.UTC(now.getUTCFullYear(), 0, 1)),
        to,
        periodLabel: period,
      };
    }
    const days =
      period === AnalyticsPeriod.LAST_7_DAYS
        ? 7
        : period === AnalyticsPeriod.LAST_90_DAYS
          ? 90
          : 30;
    const from = this.startOfDay(now);
    from.setUTCDate(from.getUTCDate() - (days - 1));
    return { from, to, periodLabel: period };
  }

  private createdAtWhere(range: ResolvedRange): {
    createdAt?: Prisma.DateTimeFilter;
  } {
    if (!range.from && !range.to) return {};
    return {
      createdAt: {
        ...(range.from && { gte: range.from }),
        ...(range.to && { lte: range.to }),
      },
    };
  }

  private usedAtWhere(range: ResolvedRange): Prisma.CouponUsageWhereInput {
    if (!range.from && !range.to) return {};
    return {
      usedAt: {
        ...(range.from && { gte: range.from }),
        ...(range.to && { lte: range.to }),
      },
    };
  }

  private formatRange(range: ResolvedRange) {
    return {
      from: range.from?.toISOString() ?? null,
      to: range.to?.toISOString() ?? null,
      period: range.periodLabel,
    };
  }

  private ensureFiniteRange(
    range: ResolvedRange,
    dates: Date[],
  ): ResolvedRange {
    return {
      ...range,
      from:
        range.from ??
        (dates[0]
          ? this.startOfDay(dates[0])
          : this.startOfDay(range.to ?? new Date())),
      to: range.to ?? this.endOfDay(new Date()),
    };
  }

  private getGranularity(range: ResolvedRange): SeriesGranularity {
    const from = range.from ?? new Date();
    const to = range.to ?? from;
    const days = Math.ceil(
      (to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000),
    );
    return days <= 90 ? 'DAY' : 'MONTH';
  }

  private generateKeys(
    range: ResolvedRange,
    granularity: SeriesGranularity,
  ): string[] {
    const from = range.from ?? this.startOfDay(new Date());
    const to = range.to ?? this.endOfDay(new Date());
    const cursor = new Date(from);
    const keys: string[] = [];

    if (granularity === 'MONTH') {
      cursor.setUTCDate(1);
      while (cursor <= to) {
        keys.push(this.dateKey(cursor, granularity));
        cursor.setUTCMonth(cursor.getUTCMonth() + 1);
      }
      return keys;
    }

    while (cursor <= to) {
      keys.push(this.dateKey(cursor, granularity));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return keys;
  }

  private dateKey(date: Date, granularity: SeriesGranularity): string {
    const iso = date.toISOString();
    return granularity === 'DAY' ? iso.slice(0, 10) : iso.slice(0, 7);
  }

  private startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setUTCHours(0, 0, 0, 0);
    return result;
  }

  private endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setUTCHours(23, 59, 59, 999);
    return result;
  }

  private decimalToOutput(value: Prisma.Decimal): number {
    return Number(value.toFixed(2));
  }

  private paymentActivityType(
    status: PaymentTransactionStatus,
  ): RecentActivity['type'] {
    if (status === PaymentTransactionStatus.COMPLETED) {
      return 'PAYMENT_COMPLETED';
    }
    if (status === PaymentTransactionStatus.FAILED) {
      return 'PAYMENT_FAILED';
    }
    if (status === PaymentTransactionStatus.REFUNDED) {
      return 'PAYMENT_REFUNDED';
    }
    return 'PAYMENT_PENDING';
  }
}
