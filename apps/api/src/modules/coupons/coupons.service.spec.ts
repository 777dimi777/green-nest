import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CouponsService } from './coupons.service';

describe('CouponsService validation', () => {
  const prisma = {} as PrismaService;
  const service = new CouponsService(prisma);

  it('rejects an expiration date that is not after the start date', async () => {
    await expect(
      service.create({
        code: 'DATE10',
        percentage: 10,
        startsAt: '2026-08-10T00:00:00.000Z',
        expiresAt: '2026-08-09T00:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
