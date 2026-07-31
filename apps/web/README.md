# Green Nest Web

Next.js 16 storefront and admin frontend for Green Nest.

## Environment

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Both variables are required for production and must be public HTTPS URLs. Production builds fail if they are missing. Configure them in Vercel before the first production build.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run start
```

The frontend supports catalog browsing, category/product media, authentication, cart, wishlist, addresses, coupons, cash-on-delivery checkout, orders, notifications, and the protected admin area.

See the repository root README for complete local setup and the Render + Vercel deployment sequence.
