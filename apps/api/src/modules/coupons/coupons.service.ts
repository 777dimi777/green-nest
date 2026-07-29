import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Coupon, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

type DatabaseClient = PrismaService | Prisma.TransactionClient;

export interface ValidatedCoupon {
  coupon: Coupon;
  discount: Prisma.Decimal;
  finalPrice: Prisma.Decimal;
}

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCouponDto) {
    const code = this.normalizeCode(dto.code);
    this.validateDiscountType(dto.percentage, dto.fixedAmount);
    this.validateDateRange(dto.startsAt, dto.expiresAt);

    if (
      await this.prisma.coupon.findUnique({
        where: { code },
        select: { id: true },
      })
    ) {
      throw new ConflictException('Kupon sa ovim kodom već postoji.');
    }

    try {
      return await this.prisma.coupon.create({
        data: {
          code,
          description: dto.description,
          percentage: dto.percentage,
          fixedAmount:
            dto.fixedAmount === undefined
              ? undefined
              : new Prisma.Decimal(dto.fixedAmount),
          minimumOrder:
            dto.minimumOrder === undefined
              ? undefined
              : new Prisma.Decimal(dto.minimumOrder),
          usageLimit: dto.usageLimit,
          active: dto.active,
          startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        },
      });
    } catch (error) {
      this.rethrowUniqueCodeError(error);
      throw error;
    }
  }

  findAll() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('Kupon nije pronađen.');
    }
    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto) {
    const current = await this.findOne(id);
    let percentage =
      dto.percentage === undefined ? current.percentage : dto.percentage;
    let fixedAmount =
      dto.fixedAmount === undefined ? current.fixedAmount : dto.fixedAmount;

    if (
      dto.percentage !== undefined &&
      dto.percentage !== null &&
      dto.fixedAmount === undefined
    ) {
      fixedAmount = null;
    }
    if (
      dto.fixedAmount !== undefined &&
      dto.fixedAmount !== null &&
      dto.percentage === undefined
    ) {
      percentage = null;
    }

    const startsAt =
      dto.startsAt === undefined ? current.startsAt : dto.startsAt;
    const expiresAt =
      dto.expiresAt === undefined ? current.expiresAt : dto.expiresAt;
    this.validateDiscountType(percentage, fixedAmount);
    this.validateDateRange(startsAt, expiresAt);

    try {
      return await this.prisma.coupon.update({
        where: { id },
        data: {
          ...(dto.code !== undefined && { code: this.normalizeCode(dto.code) }),
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
          ...(dto.percentage !== undefined && {
            percentage: dto.percentage,
            ...(dto.percentage !== null &&
              dto.fixedAmount === undefined && { fixedAmount: null }),
          }),
          ...(dto.fixedAmount !== undefined && {
            fixedAmount:
              dto.fixedAmount === null
                ? null
                : new Prisma.Decimal(dto.fixedAmount),
            ...(dto.fixedAmount !== null &&
              dto.percentage === undefined && { percentage: null }),
          }),
          ...(dto.minimumOrder !== undefined && {
            minimumOrder:
              dto.minimumOrder === null
                ? null
                : new Prisma.Decimal(dto.minimumOrder),
          }),
          ...(dto.usageLimit !== undefined && { usageLimit: dto.usageLimit }),
          ...(dto.active !== undefined && { active: dto.active }),
          ...(dto.startsAt !== undefined && {
            startsAt: dto.startsAt === null ? null : new Date(dto.startsAt),
          }),
          ...(dto.expiresAt !== undefined && {
            expiresAt: dto.expiresAt === null ? null : new Date(dto.expiresAt),
          }),
        },
      });
    } catch (error) {
      this.rethrowUniqueCodeError(error);
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.coupon.delete({ where: { id } });
  }

  async validateCoupon(
    userId: string,
    couponCode: string,
    subtotal: Prisma.Decimal,
    database: DatabaseClient = this.prisma,
  ): Promise<ValidatedCoupon> {
    const coupon = await database.coupon.findUnique({
      where: { code: this.normalizeCode(couponCode) },
      include: {
        usages: {
          where: { userId },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!coupon) throw new NotFoundException('Kupon nije pronađen.');

    const now = new Date();
    if (!coupon.active) {
      throw new BadRequestException('Kupon nije aktivan.');
    }
    if (coupon.startsAt && coupon.startsAt > now) {
      throw new BadRequestException('Kupon još uvek nije počeo da važi.');
    }
    if (coupon.expiresAt && coupon.expiresAt <= now) {
      throw new BadRequestException('Kupon je istekao.');
    }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Dostignut je limit korišćenja kupona.');
    }
    if (coupon.minimumOrder && subtotal.lessThan(coupon.minimumOrder)) {
      throw new BadRequestException(
        `Minimalna vrednost porudžbine za ovaj kupon je ${coupon.minimumOrder.toFixed(2)}.`,
      );
    }
    if (coupon.usages.length) {
      throw new BadRequestException('Već ste iskoristili ovaj kupon.');
    }

    const calculated =
      coupon.percentage !== null
        ? subtotal.mul(coupon.percentage).div(100)
        : (coupon.fixedAmount ?? new Prisma.Decimal(0));
    const discount = Prisma.Decimal.min(calculated, subtotal);
    const { usages: _usages, ...couponWithoutUsages } = coupon;
    void _usages;

    return {
      coupon: couponWithoutUsages,
      discount,
      finalPrice: subtotal.sub(discount),
    };
  }

  async markCouponAsUsed(
    userId: string,
    coupon: Coupon,
    database?: Prisma.TransactionClient,
  ): Promise<void> {
    if (!database) {
      await this.prisma.$transaction((transaction) =>
        this.markCouponAsUsed(userId, coupon, transaction),
      );
      return;
    }

    try {
      await database.couponUsage.create({
        data: { couponId: coupon.id, userId },
      });
      const updated = await database.coupon.updateMany({
        where: {
          id: coupon.id,
          active: true,
          ...(coupon.usageLimit === null
            ? { usedCount: coupon.usedCount }
            : {
                usedCount: {
                  equals: coupon.usedCount,
                  lt: coupon.usageLimit,
                },
              }),
        },
        data: { usedCount: { increment: 1 } },
      });
      if (updated.count !== 1) {
        throw new BadRequestException(
          'Kupon je u međuvremenu dostigao limit korišćenja.',
        );
      }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Već ste iskoristili ovaj kupon.');
      }
      throw error;
    }
  }

  private normalizeCode(code: string) {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      throw new BadRequestException('Kod kupona ne sme biti prazan.');
    }
    return normalized;
  }

  private validateDiscountType(
    percentage: number | null | undefined,
    fixedAmount: number | Prisma.Decimal | null | undefined,
  ) {
    const hasPercentage = percentage !== null && percentage !== undefined;
    const hasFixed = fixedAmount !== null && fixedAmount !== undefined;
    if (hasPercentage === hasFixed) {
      throw new BadRequestException(
        'Kupon mora imati tačno jedan tip popusta: percentage ili fixedAmount.',
      );
    }
  }

  private validateDateRange(
    startsAt: string | Date | null | undefined,
    expiresAt: string | Date | null | undefined,
  ) {
    if (
      startsAt &&
      expiresAt &&
      new Date(startsAt).getTime() >= new Date(expiresAt).getTime()
    ) {
      throw new BadRequestException(
        'Datum početka mora biti pre datuma isteka kupona.',
      );
    }
  }

  private rethrowUniqueCodeError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Kupon sa ovim kodom već postoji.');
    }
  }
}
