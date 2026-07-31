# Green Nest

Green Nest is a production-oriented full-stack e-commerce portfolio application for ornamental plants. It combines a responsive Serbian storefront, authenticated customer workflows, cash-on-delivery checkout, local media assets, and a role-protected administration area.

## Highlights

- Responsive storefront with catalog search, filters, sorting, pagination, categories, product galleries, and plant-care details
- JWT authentication with access and refresh tokens
- Persistent cart, wishlist, address book, coupons, order history, reviews, and notifications
- Cash-on-delivery checkout with stock validation and order snapshots
- Admin management for products, images, categories, coupons, orders, payments, users, and notifications
- Admin analytics for revenue, users, orders, stock, coupons, and payment outcomes
- Six seeded categories, 18 seeded products, local category/product imagery, and deterministic demo data
- Health endpoint, request validation, throttled authentication, Helmet, CORS allow-listing, and Swagger feature flag

## Stack

| Layer | Technology |
| --- | --- |
| Web | Next.js 16, React 19, TypeScript, Tailwind CSS, TanStack Query, Axios, React Hook Form, Zod, Recharts |
| API | NestJS 11, Prisma 6, PostgreSQL, Passport JWT, class-validator, Helmet, Multer |
| Development | Docker Compose, Jest, ESLint, Prettier, Swagger/OpenAPI |

## Repository structure

```text
apps/web                 Next.js storefront and administration UI
apps/api                 NestJS REST API and Prisma schema
apps/api/prisma          migrations and deterministic development seed
apps/api/uploads         committed seed assets and runtime product uploads
docker-compose.yml       local PostgreSQL 16
```

## Local setup

Prerequisites: Node.js 20+, npm, and Docker Desktop or PostgreSQL 16.

1. Start PostgreSQL from the repository root:

   ```bash
   docker compose up -d postgres
   ```

2. Create local environment files:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env.local
   ```

3. Install dependencies:

   ```bash
   cd apps/api && npm install
   cd ../web && npm install
   ```

4. Prepare the local database:

   ```bash
   cd apps/api
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Start both applications in separate terminals:

   ```bash
   cd apps/api && npm run start:dev
   cd apps/web && npm run dev
   ```

Local URLs:

- Storefront: `http://localhost:3000`
- API: `http://localhost:3001/api`
- Health: `http://localhost:3001/api/health`
- Swagger: `http://localhost:3001/api/docs` when `SWAGGER_ENABLED=true`

## Environment

### API — `apps/api/.env`

| Variable | Required | Purpose |
| --- | --- | --- |
| `NODE_ENV` | yes | use `production` on Render |
| `DATABASE_URL` | yes | PostgreSQL connection URL |
| `JWT_SECRET` | yes | access-token signing secret, minimum 32 characters |
| `JWT_EXPIRES_IN` | yes | access-token lifetime, for example `15m` |
| `JWT_REFRESH_SECRET` | yes | different refresh-token secret, minimum 32 characters |
| `JWT_REFRESH_EXPIRES_IN` | yes | refresh-token lifetime, for example `7d` |
| `PORT` | yes | API listening port; hosting platforms may inject it |
| `CORS_ORIGIN` | yes | comma-separated exact frontend origins |
| `SWAGGER_ENABLED` | yes | use `false` in production unless docs should be public |
| `SEED_ADMIN_PASSWORD` | production seed only | non-public admin password |
| `SEED_USER_PASSWORD` | production seed only | non-public demo-user password |

### Web — `apps/web/.env.local`

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | yes | public HTTPS API URL including `/api` |
| `NEXT_PUBLIC_APP_URL` | yes | public HTTPS frontend URL |

Production builds fail fast when required public URLs are missing. Never commit real secrets or production database credentials.

## Demo seed

`npx prisma db seed` is idempotent and synchronizes only stable Green Nest demo records. It does not truncate the database.

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@greennest.test` | `Admin123!` |
| Customer | `milos@greennest.test` | `User123!` |
| Customer | `ana@greennest.test` | `User123!` |
| Customer without orders | `novi@greennest.test` | `User123!` |

Demo coupons: `WELCOME10`, `SAVE500`, `EXPIRED20`, `INACTIVE15`, `LIMIT1`, and `MINIMUM`.

These credentials are local-development defaults only. With `NODE_ENV=production`, the seed refuses to run unless `SEED_ADMIN_PASSWORD` and `SEED_USER_PASSWORD` are provided. Do not run the seed against a real customer database without explicitly accepting that demo accounts and records will be created.

## Images and uploads

- Seed category images: `apps/api/uploads/seed-categories`
- Seed product images: `apps/api/uploads/seed-products`
- Runtime admin uploads: `apps/api/uploads/products`
- Public URL prefix: `/uploads`

The API accepts one JPEG, PNG, or WebP product image at a time, up to 5 MB. Upload endpoints require both JWT authentication and the `ADMIN` role.

The current local-disk architecture is intentionally retained for this portfolio. On Render or Railway, new runtime uploads require a persistent disk mounted so that `apps/api/uploads` remains durable. Without persistent storage, committed seed images work after each deploy, but newly uploaded files can disappear after restart or redeploy.

## Validation

Run the final checks from each workspace:

```bash
cd apps/api
npm run lint
npm run build
npm test
npx prisma validate
npx prisma generate

cd ../web
npm run lint
npm run build

cd ../..
git diff --check
```

## Production deployment

For production, use committed migrations only:

```bash
cd apps/api
npx prisma migrate deploy
```

Do not use `prisma db push`, `prisma migrate dev`, or `prisma migrate reset` in production.

Recommended Render + Vercel topology:

- Render PostgreSQL
- Render Web Service for `apps/api`
- Optional Render persistent disk for runtime uploads
- Vercel project rooted at `apps/web`

Set `SWAGGER_ENABLED=false`, use strong and distinct JWT secrets, set exact HTTPS CORS origins, and run the optional seed only for a portfolio/demo environment.

## Security notes

The API uses DTO whitelisting, rejection of unknown properties, JWT and role guards, auth throttling, Helmet, exact CORS origins, randomized upload filenames, file size/type checks, and startup environment validation. JWTs are stored in browser local storage; this is an accepted portfolio trade-off, but HttpOnly secure cookies and stronger CSP are recommended for a future real-commerce release.

## Portfolio status

The application is intended as a polished portfolio project. Cash on delivery is the only customer-facing payment method; no card details are collected or processed.
