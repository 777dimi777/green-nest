import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from './notifications.service';

describe('NotificationsService admin list', () => {
  const findMany = jest.fn().mockResolvedValue([]);
  const count = jest.fn().mockResolvedValue(21);
  const prisma = {
    notification: { findMany, count },
    $transaction: jest.fn(async (operations: Array<Promise<unknown>>) =>
      Promise.all(operations),
    ),
  } as unknown as PrismaService;
  const service = new NotificationsService(prisma);

  beforeEach(() => jest.clearAllMocks());

  it('returns pagination metadata and selects only safe recipient fields', async () => {
    const result = await service.findAllAdmin({ page: 2, limit: 10 });
    expect(result.pagination).toEqual({
      page: 2,
      limit: 10,
      total: 21,
      totalPages: 3,
      hasPreviousPage: true,
      hasNextPage: true,
    });
    const calls = findMany.mock.calls as unknown as Array<
      [
        {
          skip: number;
          take: number;
          select: {
            user: {
              select: Record<string, boolean>;
            };
          };
        },
      ]
    >;
    expect(calls[0][0].skip).toBe(10);
    expect(calls[0][0].take).toBe(10);
    expect(calls[0][0].select.user.select).toEqual({
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    });
  });
});
