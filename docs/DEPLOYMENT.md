# Green Nest deployment

Production stack:

- Neon Free PostgreSQL
- Render Free Web Service for `apps/api`
- Vercel Hobby project for `apps/web`

## Neon

Create a PostgreSQL project and copy the pooled connection string. Use it as
`DATABASE_URL` in Render and when running production migrations or seed locally.
Never commit the connection string.

## Render API

Create a Blueprint from this repository and use `render.yaml`. Set:

- `DATABASE_URL` to the Neon pooled connection string
- `CORS_ORIGIN` to the exact Vercel production origin, without a trailing slash

Render supplies `PORT`. The build deploys Prisma migrations and compiles NestJS.
The health check is `/api/health`.

## Vercel frontend

Import the same GitHub repository and set Root Directory to `apps/web`. Set:

- `NEXT_PUBLIC_API_URL=https://<render-service>.onrender.com/api`
- `NEXT_PUBLIC_APP_URL=https://<vercel-project>.vercel.app`

Redeploy after changing either public environment variable because Next.js embeds
them during the production build.

## Production seed

The seed requires `NODE_ENV=production`, `DATABASE_URL`,
`SEED_ADMIN_PASSWORD`, and `SEED_USER_PASSWORD`. Run it once from a trusted local
machine with:

```powershell
npx prisma db seed
```

Do not add production passwords to `.env.example` or Git.

## Free-tier limitation

Render Free has an ephemeral filesystem. Repository seed images remain available,
but images uploaded at runtime are not durable across restarts or deploys. Use an
external object storage provider before relying on admin uploads in production.
