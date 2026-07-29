# Green Nest API

Green Nest API is the NestJS backend for an e-commerce application focused on
ornamental plants. It provides JWT authentication, role-based administration,
catalog management, shopping and checkout workflows, payments, notifications,
analytics, local product image uploads, and operational health checks.

## Technology

- NestJS 11 and TypeScript
- Prisma ORM and PostgreSQL
- JWT access and refresh tokens with Passport
- Swagger/OpenAPI
- class-validator and class-transformer
- Multer local image storage

## Modules

`auth`, `users`, `categories`, `products`, `wishlist`, `reviews`, `cart`,
`addresses`, `orders`, `coupons`, `payments`, `notifications`, `analytics`, and
`health`.

## Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL 16, locally or through Docker

## Installation

From `apps/api`:

```bash
npm install
copy .env.example .env
```

On macOS or Linux, replace the second command with `cp .env.example .env`.
Replace all example JWT secrets before using a shared or production environment.

## Environment configuration

| Variable                 | Purpose                                   | Example                                                                 |
| ------------------------ | ----------------------------------------- | ----------------------------------------------------------------------- |
| `DATABASE_URL`           | PostgreSQL connection URL                 | `postgresql://postgres:postgres@localhost:5433/greennest?schema=public` |
| `JWT_SECRET`             | Access-token signing secret               | long random value                                                       |
| `JWT_EXPIRES_IN`         | Access-token lifetime                     | `15m`                                                                   |
| `JWT_REFRESH_SECRET`     | Refresh-token signing secret              | different long random value                                             |
| `JWT_REFRESH_EXPIRES_IN` | Refresh-token lifetime                    | `7d`                                                                    |
| `PORT`                   | API port                                  | `3001`                                                                  |
| `CORS_ORIGIN`            | Allowed frontend origins, comma-separated | `http://localhost:3000`                                                 |

Configuration is validated during application startup. The API refuses to start
when a required value is missing or `PORT` is invalid.

## PostgreSQL with Docker

The repository root contains `docker-compose.yml`. From `apps/api`, start only
PostgreSQL with:

```bash
docker compose -f ../../docker-compose.yml up -d postgres
```

The provided development database is exposed on port `5433`. Production
credentials must be supplied separately and must not reuse the Docker examples.

## Prisma

```bash
npx prisma generate
npx prisma validate
npx prisma migrate dev
```

For an existing production database, apply committed migrations without creating
or resetting data:

```bash
npx prisma migrate deploy
```

No Prisma seed command is currently configured.

## Running the API

```bash
# Development with watch mode
npm run start:dev

# Compile
npm run build

# Run compiled production output
npm run start:prod

# Lint and tests
npm run lint
npm test
```

Default development URLs:

- API base: `http://localhost:3001/api`
- Swagger: `http://localhost:3001/api/docs`
- Health check: `http://localhost:3001/api/health`
- Uploaded image: `http://localhost:3001/uploads/products/<filename>`

## Authentication and authorization

Register or log in through `/api/auth`, then send the access token as:

```http
Authorization: Bearer <access-token>
```

New users receive the `CUSTOMER` role. Administrative endpoints require the
`ADMIN` role and are protected by JWT and role guards. Assign administrator
access only through a trusted administrative process.

## Endpoint groups

- `/api/auth` — registration, login, refresh, logout
- `/api/users` — profile and administrator user management
- `/api/categories`, `/api/products` — catalog and product images
- `/api/wishlist`, `/api/reviews`, `/api/cart`, `/api/addresses` — customer data
- `/api/orders`, `/api/coupons`, `/api/payments` — checkout and payment workflow
- `/api/notifications` — customer notifications
- `/api/analytics` — administrator reporting
- `/api/health` — public API and database readiness check

Swagger contains the exact methods, DTO schemas, parameters, authorization
requirements, and response descriptions.

## Product uploads

Product images are stored in `uploads/products`. Accepted types are JPEG, PNG,
and WebP, with a 5 MB maximum per file. The directory must be writable by the
application process. Uploaded files are runtime data and are intentionally
excluded from Git; only `.gitkeep` is tracked.

For multi-instance or ephemeral deployments, replace local storage with durable
shared object storage before scaling the API horizontally.

## Troubleshooting

- **Database connection fails:** confirm `DATABASE_URL`, Docker status, port
  `5433`, database name, and credentials.
- **Prisma client is missing or outdated:** run `npx prisma generate`.
- **Tables or columns are missing:** run `npx prisma migrate dev` locally or
  `npx prisma migrate deploy` in production.
- **Port is already occupied:** stop the other process or change `PORT`.
- **Uploads fail:** ensure `uploads/products` exists and the process has write
  permission; do not remove its `.gitkeep`.
- **Startup configuration error:** compare `.env` with `.env.example`.

Never commit `.env`, real secrets, database credentials, or uploaded product
images.
