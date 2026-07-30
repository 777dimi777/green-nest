# Green Nest

Green Nest is a full-stack e-commerce portfolio application for browsing and purchasing ornamental plants. It combines a responsive Serbian storefront with authenticated customer workflows and a guarded administration area.

## Screenshots

Screenshots can be added after deploying the application. The repository does not currently include production screenshots.

## Features

- Responsive storefront, catalog search, filters, sorting and pagination
- Product details, plant-care attributes, stock information and reviews
- JWT authentication with access-token refresh
- Wishlist, persistent cart and address management
- Checkout with coupons, cash on delivery and mock card payments
- Order history, order details and permitted cancellation flows
- Customer and administrator notifications
- Admin product, image, category, coupon, order, payment and user management
- Admin analytics dashboard

## Technology

- **Web:** Next.js 16, React 19, TypeScript, Tailwind CSS, TanStack Query, Axios, React Hook Form, Zod and Recharts
- **API:** NestJS 11, Prisma 6, PostgreSQL, Passport JWT, class-validator, Helmet and throttling
- **Development:** Docker Compose, Jest, ESLint and Swagger/OpenAPI

## Architecture

```text
apps/web  -> Next.js storefront and administration UI
apps/api  -> NestJS REST API and Prisma data layer
PostgreSQL -> application database
```

The API is organized into authentication, users, products, categories, wishlist, reviews, cart, addresses, coupons, orders, payments, notifications, analytics and health modules.

## Prerequisites

- Node.js 20 or newer
- npm
- Docker Desktop, or a compatible PostgreSQL 16 installation

## Local setup

1. Start PostgreSQL:

   ```bash
   docker compose up -d postgres
   ```

2. Create environment files:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env.local
   ```

3. Install dependencies:

   ```bash
   cd apps/api && npm install
   cd ../web && npm install
   ```

4. Apply migrations and generate Prisma Client:

   ```bash
   cd apps/api
   npx prisma migrate dev
   npx prisma generate
   ```

5. Run the API:

   ```bash
   cd apps/api
   npm run start:dev
   ```

6. Run the web app in another terminal:

   ```bash
   cd apps/web
   npm run dev
   ```

The storefront is available at `http://localhost:3000`. API documentation is available at `http://localhost:3001/api/docs` only when `SWAGGER_ENABLED=true`.

## Environment

The web app requires `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_APP_URL`. The API requires `DATABASE_URL`, separate access and refresh JWT secrets and expiry values, `PORT`, and `CORS_ORIGIN`. See both `.env.example` files for the complete development templates. Never commit real secrets.

## Validation and tests

```bash
cd apps/web
npm run lint
npm run build

cd ../api
npm run lint
npm run build
npm test
npm run test:e2e
npx prisma validate
```

## Development seed data

Run the deterministic development seed after applying migrations:

```bash
cd apps/api
npx prisma db seed
```

The command is idempotent and updates only stable Green Nest demo records. It does not truncate or reset the database.

### Local test accounts

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@greennest.test` | `Admin123!` |
| Customer | `milos@greennest.test` | `User123!` |
| Second customer | `ana@greennest.test` | `User123!` |
| Customer without orders | `novi@greennest.test` | `User123!` |

These credentials are for local development and demos only. Production must use different credentials, and the seed must never run automatically in production unless that is explicitly intended.

### Test coupons

- `WELCOME10` — active 10% discount with a 1,500 RSD minimum.
- `SAVE500` — active fixed 500 RSD discount with a 3,000 RSD minimum.
- `EXPIRED20` — expired percentage coupon.
- `INACTIVE15` — inactive coupon.
- `LIMIT1` — usage limit already reached.
- `MINIMUM` — active coupon with a deliberately high 50,000 RSD minimum.

The seed also creates published and unpublished products, discounted and featured products, out-of-stock and low-stock cases, all supported order/payment statuses, reviews, wishlists, carts and read/unread notifications. Product image records are intentionally not seeded because the repository does not contain stable local product image assets.

## Production deployment

- Build the web app with production `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_APP_URL` values.
- Configure strong, distinct JWT secrets and an exact production CORS origin.
- Disable Swagger unless it is intentionally exposed.
- Run `npx prisma migrate deploy` during API deployment; do not use `prisma db push` in production.
- Run the API with `npm run start:prod` after `npm run build`.
- Run the web app with `npm run start` after `npm run build`.
- Use HTTPS for both public services and protect environment values in the hosting platform.

### Upload storage limitation

Product images are currently stored on the API server's local disk and served from `/uploads`. Ephemeral platforms can remove those files during a restart or redeploy. Production should use a persistent volume or move uploads to an object-storage service such as Amazon S3 or Cloudinary.

## Security notes

The API applies DTO validation, property whitelisting, role guards, Helmet, CORS restrictions and request throttling. The browser currently stores JWTs in local storage; this is a documented portfolio tradeoff and requires strong Content Security Policy and careful XSS prevention in deployment. No user-controlled HTML is rendered directly.

## Future improvements

- External object storage and image transformations
- HttpOnly cookie-based authentication
- Transactional email and a real payment provider
- Automated browser end-to-end tests and deployment pipeline
- Production monitoring and structured logging

## Author

Built as a full-stack portfolio project. Add the repository owner's name and contact links before publishing the portfolio.