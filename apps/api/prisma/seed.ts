import { PrismaClient, UserRole, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const decimal = (value: number) => new Prisma.Decimal(value);

type ProductSeed = {
  row: number;
  name: string;
  latinName: string;
  plantType: string;
  height?: string;
  trunkCircumference?: string;
  graftHeight?: string;
  potDiameter?: string;
  stock: number;
  price: number;
  priceNote?: string;
  imageCount: number;
};

const products: ProductSeed[] = [
  {
    row: 6,
    name: 'Šarenolisna lovor višnja',
    latinName: "Prunus laurocerasus 'Marbled White'",
    plantType: 'Zimzeleni žbun',
    height: '100–130 cm',
    stock: 25,
    price: 1500,
    imageCount: 3,
  },
  {
    row: 7,
    name: 'Crvenolisni hrast',
    latinName: 'Quercus rubra L.',
    plantType: 'Listopadno drvo',
    height: '120 cm',
    stock: 10,
    price: 500,
    imageCount: 1,
  },
  {
    row: 8,
    name: 'Breza',
    latinName: 'Betula alba',
    plantType: 'Listopadno drvo',
    height: '200–350 cm',
    trunkCircumference: '8–12 cm',
    stock: 160,
    price: 1200,
    priceNote: 'Cena zavisi od dimenzije i kreće se od 1.200 do 1.500 RSD.',
    imageCount: 3,
  },
  {
    row: 9,
    name: 'Kuglasta katalpa',
    latinName: "Catalpa bignonioides 'Nana'",
    plantType: 'Listopadno drvo',
    height: '120–240 cm',
    graftHeight: '100–220 cm',
    stock: 250,
    price: 500,
    priceNote: 'Cena zavisi od dimenzije i kreće se od 500 do 1.200 RSD.',
    imageCount: 3,
  },
  {
    row: 10,
    name: 'Katalpa',
    latinName: 'Catalpa bignonioides',
    plantType: 'Listopadno drvo',
    stock: 10,
    price: 500,
    imageCount: 3,
  },
  {
    row: 11,
    name: 'Baštenski hibiskus',
    latinName: 'Hibiscus syriacus',
    plantType: 'Listopadni žbun',
    height: '120 cm',
    stock: 10,
    price: 600,
    imageCount: 1,
  },
  {
    row: 12,
    name: 'Klen',
    latinName: 'Acer campestre',
    plantType: 'Listopadno drvo',
    height: '200 cm',
    stock: 0,
    price: 0,
    priceNote: 'Cena i dostupnost su na upit.',
    imageCount: 2,
  },
  {
    row: 13,
    name: 'Javor mleč Crimson King',
    latinName: "Acer platanoides 'Crimson King'",
    plantType: 'Listopadno drvo',
    graftHeight: '200 cm',
    stock: 5,
    price: 1200,
    imageCount: 3,
  },
  {
    row: 14,
    name: 'Javor mleč Crimson Sentry',
    latinName: "Acer platanoides 'Crimson Sentry'",
    plantType: 'Listopadno drvo',
    height: '220 cm',
    stock: 5,
    price: 1200,
    imageCount: 3,
  },
  {
    row: 15,
    name: 'Javor negundo',
    latinName: "Acer negundo 'Variegatum'",
    plantType: 'Listopadno drvo',
    graftHeight: '200 cm',
    stock: 5,
    price: 1200,
    imageCount: 3,
  },
  {
    row: 16,
    name: 'Japanska trešnja crvenolisna',
    latinName: "Prunus serrulata 'Royal Burgundy'",
    plantType: 'Listopadno drvo',
    graftHeight: '220 cm',
    stock: 1,
    price: 1200,
    imageCount: 2,
  },
  {
    row: 17,
    name: 'Japanska trešnja padajuća',
    latinName: "Prunus serrulata 'Kiku-shidare-zakura'",
    plantType: 'Listopadno drvo',
    graftHeight: '220 cm',
    stock: 2,
    price: 2000,
    imageCount: 3,
  },
  {
    row: 18,
    name: 'Japanska trešnja',
    latinName: "Prunus serrulata 'Kanzan'",
    plantType: 'Listopadno drvo',
    graftHeight: '220 cm',
    stock: 1,
    price: 1200,
    imageCount: 2,
  },
  {
    row: 19,
    name: 'Padajući dud',
    latinName: "Morus alba 'Pendula'",
    plantType: 'Listopadno drvo',
    graftHeight: '180–200 cm',
    stock: 10,
    price: 1200,
    imageCount: 2,
  },
  {
    row: 20,
    name: 'Platan',
    latinName: 'Platanus × acerifolia',
    plantType: 'Listopadno drvo',
    graftHeight: '220 cm',
    stock: 50,
    price: 1000,
    imageCount: 2,
  },
  {
    row: 22,
    name: 'Fotinija žbun',
    latinName: "Photinia × fraseri 'Red Robin'",
    plantType: 'Zimzeleni žbun',
    height: '140 cm',
    stock: 15,
    price: 1000,
    imageCount: 3,
  },
  {
    row: 23,
    name: 'Fotinija na štapu',
    latinName: "Photinia × fraseri 'Red Robin'",
    plantType: 'Zimzeleno drvo',
    graftHeight: '150–200 cm',
    stock: 5,
    price: 1500,
    imageCount: 2,
  },
  {
    row: 24,
    name: 'Likvidambar',
    latinName: 'Liquidambar styraciflua',
    plantType: 'Listopadno drvo',
    graftHeight: '180–200 cm',
    stock: 100,
    price: 1000,
    imageCount: 2,
  },
  {
    row: 25,
    name: 'Crni bor',
    latinName: 'Pinus nigra',
    plantType: 'Četinar',
    height: '50–70 cm',
    potDiameter: 'Ø 19 cm',
    stock: 500,
    price: 700,
    imageCount: 2,
  },
  {
    row: 26,
    name: 'Kuglasti bor',
    latinName: "Pinus nigra 'Brepo'",
    plantType: 'Četinar',
    graftHeight: '30–50 cm',
    potDiameter: 'Ø 22 cm',
    stock: 70,
    price: 2400,
    imageCount: 2,
  },
  {
    row: 27,
    name: 'Padajući bor',
    latinName: "Pinus strobus 'Pendula'",
    plantType: 'Četinar',
    height: '50 cm',
    potDiameter: 'Ø 22 cm',
    stock: 3,
    price: 2400,
    imageCount: 2,
  },
  {
    row: 28,
    name: 'Stubasti beli bor',
    latinName: "Pinus sylvestris 'Fastigiata'",
    plantType: 'Četinar',
    height: '20–40 cm',
    potDiameter: 'Ø 22 cm',
    stock: 15,
    price: 2400,
    imageCount: 2,
  },
  {
    row: 29,
    name: 'Bor Winter Gold',
    latinName: "Pinus mugo 'Winter Gold'",
    plantType: 'Četinar',
    height: '20 cm',
    potDiameter: 'Ø 22 cm',
    stock: 3,
    price: 2400,
    imageCount: 2,
  },
  {
    row: 30,
    name: 'Japanski javor padajući',
    latinName: "Acer palmatum dissectum 'Atropurpureum'",
    plantType: 'Listopadno drvo',
    height: '40–50 cm',
    potDiameter: 'Ø 15 cm',
    stock: 5,
    price: 2000,
    imageCount: 2,
  },
  {
    row: 31,
    name: 'Japanski javor crveni',
    latinName: "Acer palmatum 'Atropurpureum'",
    plantType: 'Listopadno drvo',
    height: '20–50 cm',
    potDiameter: 'Ø 15 cm',
    stock: 5,
    price: 2000,
    imageCount: 2,
  },
  {
    row: 32,
    name: 'Žuti berberis',
    latinName: "Berberis thunbergii 'Maria'",
    plantType: 'Listopadni žbun',
    height: '25 cm',
    potDiameter: 'Ø 13 cm',
    stock: 100,
    price: 120,
    imageCount: 2,
  },
  {
    row: 33,
    name: 'Crveni berberis',
    latinName: 'Berberis thunbergii atropurpurea',
    plantType: 'Listopadni žbun',
    height: '30–40 cm',
    potDiameter: 'Ø 13 cm',
    stock: 50,
    price: 80,
    imageCount: 2,
  },
];

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'dj')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const categorySlug = (type: string) => slugify(type);

async function clearOldCatalog() {
  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.couponUsage.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.review.deleteMany(),
    prisma.wishlist.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.coupon.deleteMany(),
  ]);
}

async function main() {
  const production = process.env.NODE_ENV === 'production';
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD ?? (production ? null : 'Admin123!');
  if (!adminPassword)
    throw new Error('Production seed requires SEED_ADMIN_PASSWORD.');

  // Render's free plan has no Shell, so the seed runs during deploy. Keep
  // later deploys safe once the complete rasadnik catalog is already present.
  if (production) {
    const currentCatalog = await prisma.product.count({
      where: { latinName: { not: '' } },
    });
    if (currentCatalog >= products.length) {
      console.log(`Katalog već postoji (${currentCatalog} proizvoda); seed preskočen.`);
      return;
    }
  }

  await clearOldCatalog();
  const password = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: 'admin@greennest.test' },
    update: {
      firstName: 'Green',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      password,
      isVerified: true,
    },
    create: {
      email: 'admin@greennest.test',
      firstName: 'Green',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      password,
      isVerified: true,
    },
  });

  const categories = new Map<string, string>();
  for (const type of [
    ...new Set(products.map((product) => product.plantType)),
  ]) {
    const slug = categorySlug(type);
    const first = products.find((product) => product.plantType === type)!;
    const category = await prisma.category.create({
      data: {
        name: type,
        slug,
        description: `Ponuda iz rasadnika: ${type.toLocaleLowerCase('sr-RS')}.`,
        image: `/uploads/seed-products/red-${first.row}-1.webp`,
      },
    });
    categories.set(type, category.id);
  }

  for (const [index, product] of products.entries()) {
    const slug = slugify(product.name);
    const description = [
      `${product.name} (${product.latinName}) iz aktuelne ponude rasadnika.`,
      product.priceNote,
    ]
      .filter(Boolean)
      .join(' ');
    await prisma.product.create({
      data: {
        name: product.name,
        slug,
        description,
        sku: `RAS-${String(product.row).padStart(3, '0')}`,
        price: decimal(product.price),
        stock: product.stock,
        latinName: product.latinName,
        plantType: product.plantType,
        height: product.height,
        trunkCircumference: product.trunkCircumference,
        graftHeight: product.graftHeight,
        potDiameter: product.potDiameter,
        featured: index < 8,
        published: true,
        categoryId: categories.get(product.plantType)!,
        images: {
          create: Array.from(
            { length: product.imageCount },
            (_, imageIndex) => ({
              url: `/uploads/seed-products/red-${product.row}-${imageIndex + 1}.webp`,
              alt: `${product.name} — fotografija ${imageIndex + 1}`,
              isPrimary: imageIndex === 0,
            }),
          ),
        },
      },
    });
  }
  console.log(`Rasadnik katalog je pripremljen: ${products.length} proizvoda.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
