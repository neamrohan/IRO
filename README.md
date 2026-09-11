# IRO — Women's Three-Piece E-commerce

A full-stack Next.js 15 + Supabase e-commerce site for the IRO clothing brand, built for the Bangladeshi market (BDT currency, district-based delivery, Cash on Delivery).

This is real, working code — every page queries Supabase directly (or through a Server Action), there are no mocked buttons or hardcoded product arrays. It has been type-checked (`tsc --noEmit`) and production-built (`next build`) successfully.

---

## 1. What's implemented

**Storefront:** Home, Shop (with working filters: category, price, color, size, fabric, sort), Three-Piece, New Arrivals, Best Sellers, Product Details (gallery with hover-zoom, size/color/qty picker, buy now, wishlist, reviews, related products, JSON-LD SEO), Search, Cart (guest localStorage + DB sync for logged-in users, coupon validation), Checkout (BD districts, COD fully functional, bKash/Nagad/Online shown as "coming soon"), Order Success, Login/Register/Forgot/Reset Password, My Account, My Orders, Wishlist, About, Contact, FAQ, Privacy Policy, Terms, Return & Refund Policy.

**Admin** (`/admin`, protected by middleware — only `role = 'admin'` profiles can access): Dashboard (live sales/order/stock stats), Product Management (list, add, edit, delete, image upload to Supabase Storage), Order Management (search, filter, status update), Customer Management, Category Management, Coupon Management, Sales Overview (6-month revenue chart + editable delivery charges).

**Backend:** Full Supabase Postgres schema with RLS on every table, triggers (auto-profile on signup, rating aggregation, order-number generator), and a seed of 6 realistic IRO products.

**SEO:** per-page metadata, Open Graph tags, Product JSON-LD structured data, dynamic `sitemap.xml` and `robots.ts`.

## 2. What you still need to do

- Create a Supabase project and run `supabase/schema.sql`.
- Create the `product-images` Storage bucket (instructions below) — the admin image uploader needs it.
- Promote your own account to `role = 'admin'` (instructions below) to access `/admin`.
- Deploy to Netlify with your environment variables.
- I could not run a live end-to-end test against a real Supabase project or a real Netlify deploy from this environment — you'll need to do a first manual pass (see "Testing checklist" below).

---

## 3. Project structure

```
src/
  app/                  — Next.js App Router pages & API-less server actions
    admin/              — Admin dashboard, protected by middleware.ts
    products/[slug]/    — Product details page
    checkout/actions.ts — Order creation server action
    ...
  components/           — Shared UI (header, footer, product card, filters, admin/*)
  lib/
    supabase/           — client.ts (browser), server.ts (SSR), admin.ts (service role, server-only)
    data/products.ts    — Server-side product/category queries
    cart-context.tsx    — Cart state (localStorage for guests, Supabase for logged-in users)
    types.ts, utils.ts, auth-actions.ts
  middleware.ts          — Blocks non-admins from /admin
supabase/schema.sql       — Full DB schema, RLS policies, triggers, seed data
netlify.toml, .env.example
```

---

## 4. Supabase setup instructions

1. Go to [supabase.com](https://supabase.com) → New Project. Note your project's **Project URL** and **anon public key** (Project Settings → API).
2. Open the SQL Editor → New Query, paste the entire contents of `supabase/schema.sql`, and run it. This creates all tables, RLS policies, triggers, functions, and 6 seed products.
3. **Create the Storage bucket** for product images:
   - Go to Storage → New Bucket → name it exactly `product-images` → toggle **Public bucket** on.
   - Under that bucket's Policies, add a policy allowing `INSERT`/`UPDATE`/`DELETE` for authenticated users with `role = 'admin'` (or simplest for testing: allow all authenticated inserts, since the admin UI is already gated by middleware). Public `SELECT` is required so product images load on the storefront.
4. Enable Email auth (Authentication → Providers → Email) — it's on by default.
5. Under Authentication → URL Configuration, set your Site URL and add `/reset-password` as a redirect URL once you have a real domain.

## 5. Admin setup instructions

There's no hardcoded admin login. To make your own account an admin:

1. Register a normal account at `/register` on your deployed (or local) site.
2. In Supabase → Table Editor → `profiles`, find your row (matched by email via `auth.users`) and change `role` from `customer` to `admin`.
3. Log out and back in. You now have access to `/admin`.

## 6. Environment variables

Copy `.env.example` to `.env.local` (for local dev) and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only, never exposed to the browser
NEXT_PUBLIC_SITE_URL=
```

Add the same variables in Netlify: Site configuration → Environment variables.

## 7. Local development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## 8. Netlify deployment instructions

1. Push this project to a GitHub repo.
2. In Netlify: Add new site → Import an existing project → connect the repo.
3. Netlify auto-detects `netlify.toml` (build command `npm run build`, the `@netlify/plugin-nextjs` plugin handles Next.js SSR/API routes automatically — no extra config needed).
4. Add the environment variables from step 6 in Site configuration → Environment variables.
5. Deploy. Netlify's Next.js plugin installs itself on first build; if it doesn't, run `npm install -D @netlify/plugin-nextjs` locally and commit the lockfile change.

## 9. Test account instructions

There are no seeded auth users (Supabase Auth users can't be created via SQL seed safely). To test:

- **Customer flow:** Register at `/register`, browse `/shop`, add a seeded product to cart, checkout with Cash on Delivery, confirm the order appears at `/account/orders`.
- **Admin flow:** Follow "Admin setup instructions" above, then visit `/admin` to manage the 6 seeded products, update an order's status, and add a coupon.

## 10. Testing checklist (do this after connecting Supabase)

- [ ] Run `supabase/schema.sql` with no errors
- [ ] Create the `product-images` bucket
- [ ] Register an account, confirm a row appears in `profiles`
- [ ] Promote it to `admin`, confirm `/admin` loads (non-admins should be redirected)
- [ ] Add a product with images from `/admin/products/new`
- [ ] Add it to cart as a guest (not logged in) — refresh the page, confirm it persists (localStorage)
- [ ] Log in — confirm the cart merges/loads from the database
- [ ] Apply a coupon created in `/admin/coupons`
- [ ] Complete a Cash on Delivery checkout, confirm the order number format `IRO-YYYY-000001`
- [ ] Confirm stock quantity decremented on the product
- [ ] Update the order status from `/admin/orders`, confirm it reflects in `/account/orders`
- [ ] Change delivery charges in `/admin/sales`, confirm checkout reflects the new amount

## 11. Known limitations

- bKash, Nagad, and card payments are UI-complete but intentionally disabled ("Coming soon") pending real payment gateway credentials — wiring them in is a follow-up once you have merchant accounts.
- Newsletter and Contact forms are client-side only (no persistence) — add a `newsletter_subscribers` / `contact_messages` table and an insert call if you want to store submissions.
- Product Storage bucket policies must be created manually in the Supabase dashboard (step 3 above) since bucket policies aren't part of the SQL schema.
- No automated tests are included.
- I was unable to run this against a live Supabase project or deploy it to Netlify from this environment — the build and full TypeScript check passed locally, but you should walk through the testing checklist above once your own Supabase project is connected.
