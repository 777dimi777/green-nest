import {
  PrismaClient,
  UserRole,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  PaymentTransactionStatus,
  NotificationType,
  Prisma,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();
const d = (days: number) => new Date(Date.now() + days * 86400000);
const decimal = (value: number) => new Prisma.Decimal(value);
async function main() {
  const [adminHash, userHash] = await Promise.all([
    bcrypt.hash('Admin123!', 10),
    bcrypt.hash('User123!', 10),
  ]);
  const users = await Promise.all(
    [
      ['admin@greennest.test', 'Green', 'Admin', UserRole.ADMIN, adminHash],
      [
        'milos@greennest.test',
        'Miloš',
        'Dimitrijević',
        UserRole.CUSTOMER,
        userHash,
      ],
      ['ana@greennest.test', 'Ana', 'Petrović', UserRole.CUSTOMER, userHash],
      ['novi@greennest.test', 'Novi', 'Korisnik', UserRole.CUSTOMER, userHash],
    ].map(async ([email, firstName, lastName, role, password]) =>
      prisma.user.upsert({
        where: { email: email },
        update: {
          firstName: firstName,
          lastName: lastName,
          role: role as UserRole,
          password: password,
          isVerified: true,
        },
        create: {
          email: email,
          firstName: firstName,
          lastName: lastName,
          role: role as UserRole,
          password: password,
          isVerified: true,
        },
      }),
    ),
  );
  const [admin, milos, ana] = users;
  const categoryData = [
    [
      'sobne-biljke',
      'Sobne biljke',
      'Dekorativne biljke prilagođene životu u zatvorenom prostoru.',
    ],
    [
      'sukulenti',
      'Sukulenti',
      'Otporne biljke koje skladište vodu i traže malo nege.',
    ],
    ['kaktusi', 'Kaktusi', 'Kaktusi različitih oblika za sunčane položaje.'],
    [
      'saksije',
      'Saksije',
      'Funkcionalne i ukrasne saksije za svaki enterijer.',
    ],
    [
      'zemlja-i-prihrana',
      'Zemlja i prihrana',
      'Supstrati i hraniva za zdrav rast biljaka.',
    ],
    [
      'bastenski-dodaci',
      'Baštenski dodaci',
      'Praktičan alat i oprema za negu i presađivanje.',
    ],
  ] as const;
  const categories = new Map<string, string>();
  for (const [slug, name, description] of categoryData) {
    const c = await prisma.category.upsert({
      where: { slug },
      update: { name, description },
      create: { slug, name, description },
    });
    categories.set(slug, c.id);
  }
  const productData = [
    [
      'monstera-deliciosa',
      'Monstera Deliciosa',
      'GN-PLANT-001',
      3490,
      null,
      28,
      true,
      true,
      'sobne-biljke',
    ],
    [
      'ficus-lyrata',
      'Ficus Lyrata',
      'GN-PLANT-002',
      5990,
      5290,
      8,
      true,
      true,
      'sobne-biljke',
    ],
    [
      'zamioculcas',
      'Zamioculcas',
      'GN-PLANT-003',
      2890,
      null,
      32,
      true,
      false,
      'sobne-biljke',
    ],
    [
      'sansevieria-laurentii',
      'Sansevieria Laurentii',
      'GN-PLANT-004',
      2590,
      2190,
      2,
      true,
      true,
      'sobne-biljke',
    ],
    [
      'pothos-golden',
      'Pothos Golden',
      'GN-PLANT-005',
      1790,
      null,
      24,
      true,
      false,
      'sobne-biljke',
    ],
    [
      'calathea-orbifolia',
      'Calathea Orbifolia',
      'GN-PLANT-006',
      3990,
      3490,
      0,
      true,
      false,
      'sobne-biljke',
    ],
    [
      'aloe-vera',
      'Aloe Vera',
      'GN-SUCC-001',
      990,
      null,
      40,
      true,
      false,
      'sukulenti',
    ],
    [
      'echeveria-elegans',
      'Echeveria Elegans',
      'GN-SUCC-002',
      690,
      590,
      3,
      true,
      false,
      'sukulenti',
    ],
    [
      'haworthia-zebra',
      'Haworthia Zebra',
      'GN-SUCC-003',
      790,
      null,
      18,
      true,
      false,
      'sukulenti',
    ],
    [
      'kaktus-golden-barrel',
      'Kaktus Golden Barrel',
      'GN-CACT-001',
      1490,
      1290,
      12,
      true,
      false,
      'kaktusi',
    ],
    [
      'kaktus-bunny-ears',
      'Kaktus Bunny Ears',
      'GN-CACT-002',
      1190,
      null,
      0,
      true,
      false,
      'kaktusi',
    ],
    [
      'keramicka-saksija-nordic',
      'Keramička saksija Nordic',
      'GN-POT-001',
      1890,
      null,
      30,
      true,
      true,
      'saksije',
    ],
    [
      'viseca-saksija-terra',
      'Viseća saksija Terra',
      'GN-POT-002',
      2290,
      1990,
      14,
      true,
      false,
      'saksije',
    ],
    [
      'organska-zemlja-za-sobne-biljke-10l',
      'Organska zemlja za sobne biljke 10L',
      'GN-SOIL-001',
      850,
      null,
      50,
      true,
      false,
      'zemlja-i-prihrana',
    ],
    [
      'prihrana-za-zelene-biljke',
      'Prihrana za zelene biljke',
      'GN-SOIL-002',
      490,
      null,
      35,
      true,
      false,
      'zemlja-i-prihrana',
    ],
    [
      'set-za-presadjivanje-biljaka',
      'Kompletan set za presađivanje biljaka sa ručnim alatom',
      'GN-ACC-001',
      2490,
      null,
      16,
      false,
      false,
      'bastenski-dodaci',
    ],
    [
      'premium-ukrasna-saksija-stone',
      'Premium ukrasna saksija Stone',
      'GN-POT-003',
      8990,
      null,
      6,
      false,
      false,
      'saksije',
    ],
    [
      'test-neobjavljen-proizvod',
      'Test neobjavljen proizvod',
      'GN-TEST-001',
      100,
      null,
      10,
      false,
      false,
      'bastenski-dodaci',
    ],
  ] as const;
  const products = new Map<string, { id: string; price: Prisma.Decimal }>();
  for (const [
    slug,
    name,
    sku,
    price,
    discountPrice,
    stock,
    published,
    featured,
    category,
  ] of productData) {
    const data = {
      name,
      slug,
      sku,
      description: `${name} je pažljivo odabran Green Nest proizvod sa jasnim uputstvom za upotrebu i negu.`,
      price: decimal(price),
      discountPrice: discountPrice === null ? null : decimal(discountPrice),
      stock,
      published,
      featured,
      categoryId: categories.get(category)!,
      ...(category.includes('biljke') ||
      category === 'sukulenti' ||
      category === 'kaktusi'
        ? {
            light: 'Svetlo mesto bez jakog podnevnog sunca',
            watering: 'Zaliti kada se gornji sloj zemlje osuši',
            difficulty: 'Lako do srednje',
            petFriendly: false,
            airPurifying: true,
          }
        : {}),
    };
    const existing = await prisma.product.findFirst({
      where: { OR: [{ sku }, { slug }] },
    });
    const p = existing
      ? await prisma.product.update({ where: { id: existing.id }, data })
      : await prisma.product.create({ data });
    products.set(slug, { id: p.id, price: p.discountPrice ?? p.price });
  }
  const addressData = [
    [
      milos.id,
      'Miloš',
      'Dimitrijević',
      '+381641112233',
      'Srbija',
      'Niš',
      '18000',
      'Ulica Nikole Pašića',
      '10',
      true,
    ],
    [
      milos.id,
      'Miloš',
      'Dimitrijević',
      '+381641112233',
      'Srbija',
      'Bor',
      '19210',
      'Moše Pijade',
      '20',
      false,
    ],
    [
      ana.id,
      'Ana',
      'Petrović',
      '+381642223344',
      'Srbija',
      'Beograd',
      '11000',
      'Kralja Petra',
      '25',
      true,
    ],
  ] as const;
  for (const [
    userId,
    firstName,
    lastName,
    phone,
    country,
    city,
    postalCode,
    street,
    streetNumber,
    isDefault,
  ] of addressData) {
    const existing = await prisma.address.findFirst({
      where: { userId, street, streetNumber },
    });
    const data = {
      firstName,
      lastName,
      phone,
      country,
      city,
      postalCode,
      street,
      streetNumber,
      isDefault,
    };
    if (existing)
      await prisma.address.update({ where: { id: existing.id }, data });
    else await prisma.address.create({ data: { ...data, userId } });
  }
  const coupons = [
    {
      code: 'WELCOME10',
      description: '10% popusta za dobrodošlicu',
      percentage: 10,
      minimumOrder: decimal(1500),
      active: true,
      startsAt: d(-1),
      expiresAt: d(30),
    },
    {
      code: 'SAVE500',
      description: '500 RSD popusta',
      fixedAmount: decimal(500),
      minimumOrder: decimal(3000),
      active: true,
      startsAt: d(-1),
      expiresAt: d(30),
    },
    {
      code: 'EXPIRED20',
      description: 'Istekao kupon',
      percentage: 20,
      active: true,
      startsAt: d(-30),
      expiresAt: d(-3),
    },
    {
      code: 'INACTIVE15',
      description: 'Neaktivan kupon',
      percentage: 15,
      active: false,
      startsAt: d(-1),
      expiresAt: d(30),
    },
    {
      code: 'LIMIT1',
      description: 'Kupon sa jednim korišćenjem',
      percentage: 5,
      usageLimit: 1,
      usedCount: 1,
      active: true,
      startsAt: d(-1),
      expiresAt: d(30),
    },
    {
      code: 'MINIMUM',
      description: 'Visok minimalni iznos',
      percentage: 12,
      minimumOrder: decimal(50000),
      active: true,
      startsAt: d(-1),
      expiresAt: d(30),
    },
  ];
  const couponMap = new Map<string, string>();
  for (const data of coupons) {
    const c = await prisma.coupon.upsert({
      where: { code: data.code },
      update: data,
      create: data,
    });
    couponMap.set(c.code, c.id);
  }
  const address = {
    shippingFirstName: 'Miloš',
    shippingLastName: 'Dimitrijević',
    shippingPhone: '+381641112233',
    shippingCountry: 'Srbija',
    shippingCity: 'Niš',
    shippingPostalCode: '18000',
    shippingStreet: 'Ulica Nikole Pašića',
    shippingStreetNumber: '10',
    shippingApartment: null,
  };
  const specs = [
    [
      'GN-SEED-001',
      milos.id,
      OrderStatus.PENDING,
      PaymentStatus.PENDING,
      -5,
      null,
      [['monstera-deliciosa', 1]],
    ],
    [
      'GN-SEED-002',
      milos.id,
      OrderStatus.CONFIRMED,
      PaymentStatus.PAID,
      -15,
      null,
      [
        ['sansevieria-laurentii', 1],
        ['organska-zemlja-za-sobne-biljke-10l', 2],
      ],
    ],
    [
      'GN-SEED-003',
      milos.id,
      OrderStatus.SHIPPED,
      PaymentStatus.PAID,
      -35,
      null,
      [['ficus-lyrata', 1]],
    ],
    [
      'GN-SEED-004',
      milos.id,
      OrderStatus.DELIVERED,
      PaymentStatus.PAID,
      -65,
      'WELCOME10',
      [
        ['zamioculcas', 1],
        ['keramicka-saksija-nordic', 1],
      ],
    ],
    [
      'GN-SEED-005',
      milos.id,
      OrderStatus.CANCELLED,
      PaymentStatus.REFUNDED,
      -90,
      null,
      [['pothos-golden', 1]],
    ],
    [
      'GN-SEED-006',
      milos.id,
      OrderStatus.DELIVERED,
      PaymentStatus.PAID,
      -120,
      'SAVE500',
      [
        ['aloe-vera', 2],
        ['prihrana-za-zelene-biljke', 1],
      ],
    ],
    [
      'GN-SEED-007',
      ana.id,
      OrderStatus.DELIVERED,
      PaymentStatus.PAID,
      -25,
      null,
      [
        ['echeveria-elegans', 1],
        ['viseca-saksija-terra', 1],
      ],
    ],
    [
      'GN-SEED-008',
      ana.id,
      OrderStatus.PENDING,
      PaymentStatus.FAILED,
      -2,
      null,
      [['kaktus-golden-barrel', 1]],
    ],
  ] as const;
  const orderMap = new Map<string, string>();
  for (const [
    number,
    userId,
    status,
    paymentStatus,
    days,
    couponCode,
    items,
  ] of specs) {
    const itemData = items.map(([slug, quantity]) => ({
      productId: products.get(String(slug))!.id,
      quantity: Number(quantity),
      price: products.get(String(slug))!.price,
    }));
    const subtotal = itemData.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
    const shipping = subtotal >= 5000 ? 0 : 390;
    const discount =
      couponCode === 'WELCOME10'
        ? subtotal * 0.1
        : couponCode === 'SAVE500'
          ? 500
          : 0;
    const data = {
      status,
      paymentStatus,
      subtotal: decimal(subtotal),
      shippingPrice: decimal(shipping),
      discount: decimal(discount),
      totalPrice: decimal(subtotal + shipping - discount),
      userId,
      couponId: couponCode ? couponMap.get(couponCode) : null,
      createdAt: d(days),
      ...address,
    };
    const existing = await prisma.order.findUnique({
      where: { orderNumber: number },
    });
    let order: { id: string };
    if (existing) {
      order = await prisma.order.update({
        where: { id: existing.id },
        data: { ...data, items: { deleteMany: {}, create: itemData } },
      });
    } else {
      order = await prisma.order.create({
        data: { orderNumber: number, ...data, items: { create: itemData } },
      });
    }
    orderMap.set(String(number), order.id);
  }
  const payments = [
    [
      'GN-PAY-001',
      'GN-SEED-001',
      milos.id,
      PaymentMethod.CASH_ON_DELIVERY,
      PaymentTransactionStatus.PENDING,
      null,
      null,
    ],
    [
      'GN-PAY-002',
      'GN-SEED-002',
      milos.id,
      PaymentMethod.CARD,
      PaymentTransactionStatus.COMPLETED,
      null,
      d(-15),
    ],
    [
      'GN-PAY-003',
      'GN-SEED-003',
      milos.id,
      PaymentMethod.CARD,
      PaymentTransactionStatus.COMPLETED,
      null,
      d(-35),
    ],
    [
      'GN-PAY-004',
      'GN-SEED-004',
      milos.id,
      PaymentMethod.CARD,
      PaymentTransactionStatus.COMPLETED,
      null,
      d(-65),
    ],
    [
      'GN-PAY-005',
      'GN-SEED-005',
      milos.id,
      PaymentMethod.CARD,
      PaymentTransactionStatus.REFUNDED,
      null,
      d(-89),
    ],
    [
      'GN-PAY-006',
      'GN-SEED-006',
      milos.id,
      PaymentMethod.CASH_ON_DELIVERY,
      PaymentTransactionStatus.COMPLETED,
      null,
      d(-120),
    ],
    [
      'GN-PAY-007',
      'GN-SEED-007',
      ana.id,
      PaymentMethod.CARD,
      PaymentTransactionStatus.COMPLETED,
      null,
      d(-25),
    ],
    [
      'GN-PAY-008',
      'GN-SEED-008',
      ana.id,
      PaymentMethod.CARD,
      PaymentTransactionStatus.FAILED,
      'Simulirano odbijanje kartice',
      null,
    ],
  ] as const;
  const paymentMap = new Map<string, string>();
  for (const [
    ref,
    orderNumber,
    userId,
    method,
    status,
    failureReason,
    paidAt,
  ] of payments) {
    const order = await prisma.order.findUniqueOrThrow({
      where: { orderNumber },
    });
    const p = await prisma.payment.upsert({
      where: { providerTransactionId: ref },
      update: {
        orderId: order.id,
        userId,
        method,
        status,
        amount: order.totalPrice,
        provider: 'GREEN_NEST_MOCK',
        failureReason,
        paidAt,
      },
      create: {
        providerTransactionId: ref,
        orderId: order.id,
        userId,
        method,
        status,
        amount: order.totalPrice,
        provider: 'GREEN_NEST_MOCK',
        failureReason,
        paidAt,
      },
    });
    paymentMap.set(ref, p.id);
  }
  const reviewData = [
    [
      milos,
      'monstera-deliciosa',
      5,
      'Odlična biljka',
      'Stigla je zdrava i lepo upakovana.',
    ],
    [milos, 'zamioculcas', 4, 'Laka za negu', 'Odličan izbor za kancelariju.'],
    [
      milos,
      'pothos-golden',
      3,
      'Dobar proizvod',
      'Biljka je dobra, saksija je mogla biti veća.',
    ],
    [milos, 'aloe-vera', 5, 'Preporuka', 'Veoma zdrava i lepa biljka.'],
    [ana, 'echeveria-elegans', 5, 'Prelepa', 'Izgleda još lepše uživo.'],
    [
      ana,
      'viseca-saksija-terra',
      4,
      'Kvalitetna saksija',
      'Čvrsta i lepo obrađena.',
    ],
    [
      ana,
      'kaktus-golden-barrel',
      2,
      'Manji nego očekivano',
      'Kvalitetan, ali dimenzije treba pažljivo pročitati.',
    ],
    [
      ana,
      'ficus-lyrata',
      4,
      'Dekorativan',
      'Lep veliki list i dobro pakovanje.',
    ],
    [
      milos,
      'keramicka-saksija-nordic',
      1,
      'Oštećenje u transportu',
      'Podrška je brzo rešila reklamaciju.',
    ],
    [
      ana,
      'prihrana-za-zelene-biljke',
      5,
      'Praktična',
      'Jednostavna za doziranje i biljke lepo reaguju.',
    ],
  ] as const;
  for (const [user, slug, rating, title, comment] of reviewData)
    await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId: products.get(String(slug))!.id,
        },
      },
      update: { rating, title, comment },
      create: {
        userId: user.id,
        productId: products.get(String(slug))!.id,
        rating,
        title,
        comment,
      },
    });
  for (const [user, slugs] of [
    [
      milos,
      ['ficus-lyrata', 'calathea-orbifolia', 'premium-ukrasna-saksija-stone'],
    ],
    [ana, ['monstera-deliciosa', 'haworthia-zebra']],
  ] as const)
    for (const slug of slugs)
      await prisma.wishlist.upsert({
        where: {
          userId_productId: {
            userId: user.id,
            productId: products.get(String(slug))!.id,
          },
        },
        update: {},
        create: { userId: user.id, productId: products.get(String(slug))!.id },
      });
  for (const [user, items] of [
    [
      milos,
      [
        ['monstera-deliciosa', 1],
        ['zamioculcas', 2],
      ],
    ],
    [ana, [['aloe-vera', 1]]],
  ] as const) {
    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cartItem.createMany({
      data: items.map(([slug, quantity]) => ({
        cartId: cart.id,
        productId: products.get(String(slug))!.id,
        quantity: Number(quantity),
      })),
    });
  }
  const notices = [
    [
      milos,
      NotificationType.ORDER_CREATED,
      'Seed: Porudžbina kreirana',
      'Porudžbina GN-SEED-001 je primljena.',
      false,
      'GN-SEED-001',
      null,
    ],
    [
      milos,
      NotificationType.ORDER_CONFIRMED,
      'Seed: Porudžbina potvrđena',
      'Porudžbina GN-SEED-002 je potvrđena.',
      true,
      'GN-SEED-002',
      null,
    ],
    [
      milos,
      NotificationType.ORDER_SHIPPED,
      'Seed: Paket poslat',
      'Porudžbina GN-SEED-003 je poslata.',
      false,
      'GN-SEED-003',
      null,
    ],
    [
      milos,
      NotificationType.ORDER_DELIVERED,
      'Seed: Paket dostavljen',
      'Porudžbina GN-SEED-004 je dostavljena.',
      true,
      'GN-SEED-004',
      null,
    ],
    [
      milos,
      NotificationType.PAYMENT_COMPLETED,
      'Seed: Plaćanje uspešno',
      'Plaćanje za GN-SEED-004 je uspešno.',
      false,
      'GN-SEED-004',
      'GN-PAY-004',
    ],
    [
      milos,
      NotificationType.PAYMENT_REFUNDED,
      'Seed: Novac refundiran',
      'Plaćanje za GN-SEED-005 je refundirano.',
      true,
      'GN-SEED-005',
      'GN-PAY-005',
    ],
    [
      ana,
      NotificationType.ORDER_CREATED,
      'Seed: Ana porudžbina',
      'Porudžbina GN-SEED-008 je primljena.',
      false,
      'GN-SEED-008',
      null,
    ],
    [
      ana,
      NotificationType.PAYMENT_FAILED,
      'Seed: Plaćanje odbijeno',
      'Kartično plaćanje nije uspelo.',
      false,
      'GN-SEED-008',
      'GN-PAY-008',
    ],
    [
      ana,
      NotificationType.ORDER_DELIVERED,
      'Seed: Ana dostava',
      'Porudžbina GN-SEED-007 je dostavljena.',
      true,
      'GN-SEED-007',
      null,
    ],
    [
      ana,
      NotificationType.GENERAL,
      'Seed: Savet za negu',
      'Proverite vlažnost zemlje pre zalivanja.',
      false,
      null,
      null,
    ],
    [
      admin,
      NotificationType.GENERAL,
      'Seed: Admin pregled',
      'Razvojni seed je uspešno pripremljen.',
      false,
      null,
      null,
    ],
    [
      admin,
      NotificationType.PAYMENT_FAILED,
      'Seed: Neuspešno plaćanje',
      'GN-SEED-008 zahteva proveru.',
      true,
      'GN-SEED-008',
      'GN-PAY-008',
    ],
  ] as const;
  await prisma.notification.deleteMany({
    where: {
      title: { startsWith: 'Seed:' },
      userId: { in: [admin.id, milos.id, ana.id] },
    },
  });
  for (const [
    user,
    type,
    title,
    message,
    read,
    orderNumber,
    paymentRef,
  ] of notices)
    await prisma.notification.create({
      data: {
        userId: user.id,
        type,
        title,
        message,
        read,
        readAt: read ? new Date() : null,
        orderId: orderNumber ? orderMap.get(orderNumber) : null,
        paymentId: paymentRef ? paymentMap.get(paymentRef) : null,
      },
    });
  console.log('Green Nest development seed completed.');
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
