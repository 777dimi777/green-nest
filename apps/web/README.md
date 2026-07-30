# Green Nest Web

Next.js App Router frontend za Green Nest monorepo.

## Podešavanje

```bash
npm install
```

Kopirajte `.env.example` u `.env.local` i podesite:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Backend treba da bude dostupan na `http://localhost:3001`, sa globalnim `/api` prefiksom.

## Razvoj i provera

```bash
npm run dev
npm run lint
npm run build
```
