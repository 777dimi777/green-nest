# Green Nest API

NestJS 11 API for Green Nest, backed by PostgreSQL and Prisma.

## Commands

```bash
npm install
npm run start:dev
npm run lint
npm test
npm run build
npm run start:prod
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate:deploy
npx prisma db seed
```

`postinstall` generates Prisma Client automatically. Production schema changes must use `npm run prisma:migrate:deploy`; never use `db push`, `migrate dev`, or `migrate reset` in production.

## Environment

Copy `.env.example` to `.env`. Required runtime variables are `NODE_ENV`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`, `PORT`, `CORS_ORIGIN`, and `SWAGGER_ENABLED`. JWT secrets must be different and at least 32 characters.

Production:

- set `NODE_ENV=production`
- set `SWAGGER_ENABLED=false`
- set `CORS_ORIGIN` to the exact Vercel HTTPS origin
- use the Render PostgreSQL internal connection URL
- run from the `apps/api` root so local `uploads` paths resolve correctly

## Media

Seed assets are committed under `uploads/seed-categories` and `uploads/seed-products`. Admin product uploads are written to `uploads/products`, accept JPEG/PNG/WebP up to 5 MB, and require ADMIN authorization. A persistent disk is required on ephemeral hosting if runtime uploads must survive redeploys.

## Endpoints

- API: `/api`
- Health: `/api/health`
- Swagger: `/api/docs` only when enabled
- Media: `/uploads/*`

See the repository root README for complete setup, seed accounts, validation, and deployment guidance.
