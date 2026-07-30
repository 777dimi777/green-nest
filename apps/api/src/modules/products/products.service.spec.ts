import { ProductsService } from './products.service';
import { PrismaService } from '../../database/prisma.service';

describe('ProductsService admin visibility', () => {
  const findMany = jest.fn();
  const count = jest.fn();
  const transaction = jest.fn(async (operations: Array<Promise<unknown>>) =>
    Promise.all(operations),
  );
  const prisma = {
    product: { findMany, count },
    $transaction: transaction,
  } as unknown as PrismaService;
  const service = new ProductsService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
  });

  it('keeps the public product list restricted to published products', async () => {
    await service.findAll({});
    const calls = findMany.mock.calls as unknown as Array<
      [{ where: Record<string, unknown> }]
    >;
    expect(calls[0][0].where.published).toBe(true);
  });

  it('returns both published states in the admin list when no filter is sent', async () => {
    await service.findAllAdmin({});
    const calls = findMany.mock.calls as unknown as Array<
      [{ where: Record<string, unknown> }]
    >;
    const options = calls[0][0];
    expect(options.where).not.toHaveProperty('published');
  });

  it('allows the admin list to select unpublished products', async () => {
    await service.findAllAdmin({ published: false });
    const calls = findMany.mock.calls as unknown as Array<
      [{ where: Record<string, unknown> }]
    >;
    expect(calls[0][0].where.published).toBe(false);
  });
});
