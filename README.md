# Marketplace Demo

A public, no-login marketplace built with Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide, and Supabase.
Anyone can browse listings, post an item with a seller email, and email the seller directly from an item page.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful checks:

```bash
npm run lint
npm run build
```

Do not run `npm run build` at the same time as `npm run dev`; both commands use `.next`, and concurrent writes can corrupt the development cache. If that happens, stop the dev server, remove `.next`, and restart it.

## Routes

- `/` - Browse listings with search, category filtering, and favorites
- `/create/item` - Validated listing form with image preview
- `/item/[id]` - Listing detail view and message interaction

## Supabase setup

1. Create a Supabase project.
2. Run [`supabase-schema.sql`](./supabase-schema.sql) in the SQL Editor.
3. Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The client helper is in [`src/lib/supabase.ts`](./src/lib/supabase.ts). The app supports Supabase listings, image uploads, messages, and anonymous likes once environment variables are configured. Demo listings remain as fallback data when Supabase is unavailable.

## Stripe Connect setup

Run the updated [`supabase-schema.sql`](./supabase-schema.sql) to add seller accounts and orders.

Add the provided sandbox keys to `.env.local` and deploy the same values in Vercel:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=optional-server-only-key
```

After deploying, register a Connect webhook for the production URL:

```bash
node --env-file=.env.local scripts/create-webhook.mjs https://your-app.vercel.app
```

Copy the printed signing secret into `STRIPE_WEBHOOK_SECRET`, redeploy, and verify a checkout with the test card `4242 4242 4242 4242`.

## Current safeguards

- TypeScript and ESLint checks
- Client-side title, category, price, and email validation
- Image MIME type and 5 MB size validation
- Next.js image optimization for remote listing images
- Supabase schema indexes, foreign-key cascading, and RLS policies

The demo RLS policies intentionally allow public browsing and creation. Add Supabase Auth and tighten insert/message policies before deploying with real user data.
