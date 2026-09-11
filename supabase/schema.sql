-- ============================================================================
-- IRO E-commerce — Supabase Schema
-- Run this entire file once in: Supabase Dashboard → SQL Editor → New Query
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE where possible.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────
do $$ begin
  create type order_status as enum ('pending','confirmed','processing','shipped','delivered','cancelled','returned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('cod','bkash','nagad','online');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('customer','admin');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  sku text unique,
  name text not null,
  slug text not null unique,
  description text,
  category_id uuid references public.categories(id) on delete set null,

  price numeric(10,2) not null check (price >= 0),
  discount_price numeric(10,2) check (discount_price is null or discount_price >= 0),

  stock_quantity int not null default 0 check (stock_quantity >= 0),

  fabric text,
  colors text[] default '{}',
  sizes text[] default '{}',

  -- Three-piece specific fields
  kameez_details text,
  salwar_details text,
  orna_details text,
  work_type text,
  length_info text,
  care_instructions text,

  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  is_best_seller boolean not null default false,

  rating_avg numeric(2,1) not null default 0,
  rating_count int not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_featured on public.products(is_featured) where is_featured = true;
create index if not exists idx_products_new on public.products(is_new_arrival) where is_new_arrival = true;
create index if not exists idx_products_bestseller on public.products(is_best_seller) where is_best_seller = true;
create index if not exists idx_products_active on public.products(is_active) where is_active = true;

-- ─────────────────────────────────────────────────────────────────────────
-- PRODUCT IMAGES
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_images_product on public.product_images(product_id);

-- ─────────────────────────────────────────────────────────────────────────
-- PRODUCT VARIANTS (size/color combinations with independent stock)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text,
  color text,
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  sku_suffix text,
  created_at timestamptz not null default now(),
  unique(product_id, size, color)
);

create index if not exists idx_variants_product on public.product_variants(product_id);

-- ─────────────────────────────────────────────────────────────────────────
-- ADDRESSES
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text default 'Home',
  full_name text not null,
  phone text not null,
  address_line text not null,
  district text not null,
  area text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_addresses_user on public.addresses(user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- CART ITEMS (logged-in users; guests use localStorage on the client)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.cart_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  size text,
  color text,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique(user_id, product_id, size, color)
);

create index if not exists idx_cart_user on public.cart_items(user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- WISHLISTS
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.wishlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create index if not exists idx_wishlist_user on public.wishlists(user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- COUPONS
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.coupons (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  discount_percent numeric(5,2),
  discount_fixed numeric(10,2),
  min_order_amount numeric(10,2) not null default 0,
  expires_at timestamptz,
  usage_limit int,
  used_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (discount_percent is not null or discount_fixed is not null)
);

-- ─────────────────────────────────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique, -- e.g. IRO-2026-000001
  user_id uuid references public.profiles(id) on delete set null,

  customer_name text not null,
  phone text not null,
  email text,
  address_line text not null,
  district text not null,
  area text,
  delivery_method text not null default 'standard',
  order_notes text,

  payment_method payment_method not null default 'cod',
  status order_status not null default 'pending',

  subtotal numeric(10,2) not null default 0,
  delivery_charge numeric(10,2) not null default 0,
  discount_amount numeric(10,2) not null default 0,
  coupon_code text,
  total numeric(10,2) not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_number on public.orders(order_number);
create index if not exists idx_orders_status on public.orders(status);

-- ─────────────────────────────────────────────────────────────────────────
-- ORDER ITEMS
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  size text,
  color text,
  unit_price numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  line_total numeric(10,2) not null
);

create index if not exists idx_order_items_order on public.order_items(order_id);

-- ─────────────────────────────────────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  reviewer_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  is_approved boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_reviews_product on public.reviews(product_id);

-- Keep product rating aggregate in sync
create or replace function public.refresh_product_rating()
returns trigger as $$
begin
  update public.products p
  set rating_avg = coalesce((select round(avg(rating)::numeric,1) from public.reviews r where r.product_id = coalesce(new.product_id, old.product_id) and r.is_approved), 0),
      rating_count = coalesce((select count(*) from public.reviews r where r.product_id = coalesce(new.product_id, old.product_id) and r.is_approved), 0)
  where p.id = coalesce(new.product_id, old.product_id);
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_review_change on public.reviews;
create trigger trg_review_change
  after insert or update or delete on public.reviews
  for each row execute procedure public.refresh_product_rating();

-- ─────────────────────────────────────────────────────────────────────────
-- SITE SETTINGS (key/value — powers admin-editable delivery charges etc.)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (key, value) values
  ('delivery_charges', '{"inside_dhaka": 80, "outside_dhaka": 130}'::jsonb)
on conflict (key) do nothing;

insert into public.site_settings (key, value) values
  ('bd_districts', '["Dhaka","Chattogram","Khulna","Rajshahi","Sylhet","Barishal","Rangpur","Mymensingh","Comilla","Narayanganj","Gazipur","Bogura","Cox''s Bazar","Jessore","Dinajpur","Faridpur","Tangail","Noakhali","Pabna","Kushtia"]'::jsonb)
on conflict (key) do nothing;

-- ─────────────────────────────────────────────────────────────────────────
-- ORDER NUMBER GENERATOR — IRO-<year>-000001
-- ─────────────────────────────────────────────────────────────────────────
create sequence if not exists public.order_number_seq start 1;

create or replace function public.generate_order_number()
returns text as $$
declare
  next_val bigint;
  yr text := to_char(now(), 'YYYY');
begin
  next_val := nextval('public.order_number_seq');
  return 'IRO-' || yr || '-' || lpad(next_val::text, 6, '0');
end;
$$ language plpgsql;

-- Decrement product stock after a successful order (called from checkout server action)
create or replace function public.decrement_stock(p_product_id uuid, p_qty int)
returns void as $$
begin
  update public.products
  set stock_quantity = greatest(0, stock_quantity - p_qty)
  where id = p_product_id;
end;
$$ language plpgsql security definer;

-- Increment a coupon's used_count after a successful order
create or replace function public.increment_coupon_usage(p_code text)
returns void as $$
begin
  update public.coupons
  set used_count = used_count + 1
  where code = p_code;
end;
$$ language plpgsql security definer;

-- ─────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.addresses enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.site_settings enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- PROFILES: users see/edit their own row; admins see all
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- CATEGORIES: public read; admin write
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories for select using (true);
drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

-- PRODUCTS: public read active products; admin full access
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products for select using (is_active = true or public.is_admin());
drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- PRODUCT IMAGES / VARIANTS: public read; admin write
drop policy if exists "product_images_public_read" on public.product_images;
create policy "product_images_public_read" on public.product_images for select using (true);
drop policy if exists "product_images_admin_write" on public.product_images;
create policy "product_images_admin_write" on public.product_images for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "variants_public_read" on public.product_variants;
create policy "variants_public_read" on public.product_variants for select using (true);
drop policy if exists "variants_admin_write" on public.product_variants;
create policy "variants_admin_write" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());

-- ADDRESSES: owner only (+ admin read)
drop policy if exists "addresses_owner" on public.addresses;
create policy "addresses_owner" on public.addresses for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id);

-- CART: owner only
drop policy if exists "cart_owner" on public.cart_items;
create policy "cart_owner" on public.cart_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- WISHLIST: owner only
drop policy if exists "wishlist_owner" on public.wishlists;
create policy "wishlist_owner" on public.wishlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- COUPONS: public can read active coupons (to validate codes); admin manages
drop policy if exists "coupons_public_read_active" on public.coupons;
create policy "coupons_public_read_active" on public.coupons for select using (is_active = true or public.is_admin());
drop policy if exists "coupons_admin_write" on public.coupons;
create policy "coupons_admin_write" on public.coupons for all using (public.is_admin()) with check (public.is_admin());

-- ORDERS: owner can read own; anyone can INSERT (guest checkout); admin full access
drop policy if exists "orders_owner_read" on public.orders;
create policy "orders_owner_read" on public.orders for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "orders_insert" on public.orders;
create policy "orders_insert" on public.orders for insert with check (auth.uid() = user_id or user_id is null);
drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders for update using (public.is_admin());

-- ORDER ITEMS: readable if you can read the parent order; insert alongside order
drop policy if exists "order_items_read" on public.order_items;
create policy "order_items_read" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);
drop policy if exists "order_items_insert" on public.order_items;
create policy "order_items_insert" on public.order_items for insert with check (true);
drop policy if exists "order_items_admin_write" on public.order_items;
create policy "order_items_admin_write" on public.order_items for all using (public.is_admin());

-- REVIEWS: public read approved; owner can insert/manage own; admin full
drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews for select using (is_approved = true or public.is_admin());
drop policy if exists "reviews_owner_insert" on public.reviews;
create policy "reviews_owner_insert" on public.reviews for insert with check (auth.uid() = user_id or user_id is null);
drop policy if exists "reviews_admin_write" on public.reviews;
create policy "reviews_admin_write" on public.reviews for all using (public.is_admin());

-- SITE SETTINGS: public read; admin write
drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings for select using (true);
drop policy if exists "settings_admin_write" on public.site_settings;
create policy "settings_admin_write" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- SEED: categories + sample IRO products (safe to skip/re-run)
-- ─────────────────────────────────────────────────────────────────────────
insert into public.categories (name, slug, description, sort_order) values
  ('Cotton', 'cotton', 'Everyday breathable cotton three-piece sets', 1),
  ('Printed', 'printed', 'Hand and digital printed three-piece sets', 2),
  ('Embroidered', 'embroidered', 'Detailed embroidery and handwork', 3),
  ('Premium', 'premium', 'Our finest fabrics and finishing', 4),
  ('New Arrivals', 'new-arrivals', 'Freshly launched pieces', 5)
on conflict (slug) do nothing;

do $$
declare
  cat_cotton uuid; cat_printed uuid; cat_embroidered uuid; cat_premium uuid;
  p_id uuid;
begin
  select id into cat_cotton from public.categories where slug = 'cotton';
  select id into cat_printed from public.categories where slug = 'printed';
  select id into cat_embroidered from public.categories where slug = 'embroidered';
  select id into cat_premium from public.categories where slug = 'premium';

  if not exists (select 1 from public.products where slug = 'iro-floral-dream') then
    insert into public.products (sku,name,slug,description,category_id,price,discount_price,stock_quantity,fabric,colors,sizes,kameez_details,salwar_details,orna_details,work_type,length_info,care_instructions,is_active,is_featured,is_new_arrival,is_best_seller)
    values ('IRO-FD-001','IRO Floral Dream','iro-floral-dream','A soft floral print three-piece in breathable cotton voile, designed for warm days with a relaxed silhouette.',cat_printed,3450,2990,24,'Cotton Voile','{"Maroon","Ivory","Sage"}','{"S","M","L","XL"}','Straight-cut kameez with floral placement print','Cotton cambric salwar, elastic waist','Chiffon orna with printed border','Digital Print','Kameez 44in / Salwar 40in / Orna 90in','Hand wash cold, do not bleach, iron on reverse',true,true,true,false)
    returning id into p_id;
    insert into public.product_images (product_id,image_url,alt_text,sort_order,is_primary) values
      (p_id,'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800','IRO Floral Dream front',0,true),
      (p_id,'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800','IRO Floral Dream detail',1,false);
  end if;

  if not exists (select 1 from public.products where slug = 'iro-classic-cotton') then
    insert into public.products (sku,name,slug,description,category_id,price,discount_price,stock_quantity,fabric,colors,sizes,kameez_details,salwar_details,orna_details,work_type,length_info,care_instructions,is_active,is_featured,is_new_arrival,is_best_seller)
    values ('IRO-CC-002','IRO Classic Cotton','iro-classic-cotton','An everyday essential three-piece in pure cotton, minimal and comfortable for daily wear.',cat_cotton,2650,null,40,'100% Cotton','{"White","Black","Beige"}','{"S","M","L","XL","XXL"}','Round-neck plain kameez with side slits','Straight-cut cotton salwar','Plain cotton orna','Plain / Woven','Kameez 42in / Salwar 40in / Orna 88in','Machine wash cold, tumble dry low',true,true,false,true)
    returning id into p_id;
    insert into public.product_images (product_id,image_url,alt_text,sort_order,is_primary) values
      (p_id,'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=800','IRO Classic Cotton front',0,true);
  end if;

  if not exists (select 1 from public.products where slug = 'iro-premium-embroidery') then
    insert into public.products (sku,name,slug,description,category_id,price,discount_price,stock_quantity,fabric,colors,sizes,kameez_details,salwar_details,orna_details,work_type,length_info,care_instructions,is_active,is_featured,is_new_arrival,is_best_seller)
    values ('IRO-PE-003','IRO Premium Embroidery','iro-premium-embroidery','Statement embroidered three-piece in premium georgette, hand-finished neckline detail for special occasions.',cat_embroidered,6890,5990,12,'Georgette','{"Maroon","Emerald"}','{"S","M","L"}','Georgette kameez with hand embroidered yoke','Santoon inner with georgette overlay salwar','Net orna with embroidered border','Hand Embroidery','Kameez 46in / Salwar 40in / Orna 92in','Dry clean only',true,true,false,true)
    returning id into p_id;
    insert into public.product_images (product_id,image_url,alt_text,sort_order,is_primary) values
      (p_id,'https://images.unsplash.com/photo-1610030181087-540f5b6c1c7c?w=800','IRO Premium Embroidery front',0,true);
  end if;

  if not exists (select 1 from public.products where slug = 'iro-elegant-print') then
    insert into public.products (sku,name,slug,description,category_id,price,discount_price,stock_quantity,fabric,colors,sizes,kameez_details,salwar_details,orna_details,work_type,length_info,care_instructions,is_active,is_featured,is_new_arrival,is_best_seller)
    values ('IRO-EP-004','IRO Elegant Print','iro-elegant-print','A refined printed set with a contemporary silhouette, suited for both office and casual outings.',cat_printed,3150,null,30,'Cotton Lawn','{"Navy","Rust"}','{"S","M","L","XL"}','A-line kameez with block print','Cotton straight salwar','Printed cotton orna','Block Print','Kameez 44in / Salwar 40in / Orna 90in','Hand wash separately in cold water',true,false,true,false)
    returning id into p_id;
    insert into public.product_images (product_id,image_url,alt_text,sort_order,is_primary) values
      (p_id,'https://images.unsplash.com/photo-1583744946564-b52d01a7b321?w=800','IRO Elegant Print front',0,true);
  end if;

  if not exists (select 1 from public.products where slug = 'iro-soft-voile') then
    insert into public.products (sku,name,slug,description,category_id,price,discount_price,stock_quantity,fabric,colors,sizes,kameez_details,salwar_details,orna_details,work_type,length_info,care_instructions,is_active,is_featured,is_new_arrival,is_best_seller)
    values ('IRO-SV-005','IRO Soft Voile','iro-soft-voile','Lightweight voile three-piece built for humid days, with a gentle drape and airy comfort.',cat_cotton,2890,2490,18,'Cotton Voile','{"Sky Blue","Ivory"}','{"S","M","L"}','Loose-fit voile kameez','Voile palazzo-style salwar','Voile orna, lightly printed','Plain / Light Print','Kameez 43in / Salwar 39in / Orna 88in','Hand wash cold',true,false,false,false)
    returning id into p_id;
    insert into public.product_images (product_id,image_url,alt_text,sort_order,is_primary) values
      (p_id,'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800','IRO Soft Voile front',0,true);
  end if;

  if not exists (select 1 from public.products where slug = 'iro-royal-collection') then
    insert into public.products (sku,name,slug,description,category_id,price,discount_price,stock_quantity,fabric,colors,sizes,kameez_details,salwar_details,orna_details,work_type,length_info,care_instructions,is_active,is_featured,is_new_arrival,is_best_seller)
    values ('IRO-RC-006','IRO Royal Collection','iro-royal-collection','Our flagship occasion-wear three-piece in silk-blend fabric with intricate zari work.',cat_premium,9990,8490,8,'Silk Blend','{"Maroon","Gold"}','{"M","L","XL"}','Silk-blend kameez with zari embroidery','Matching silk-blend salwar','Zari-bordered net orna','Zari Embroidery','Kameez 46in / Salwar 41in / Orna 94in','Dry clean only',true,true,true,true)
    returning id into p_id;
    insert into public.product_images (product_id,image_url,alt_text,sort_order,is_primary) values
      (p_id,'https://images.unsplash.com/photo-1610189844772-2f5c66c85dd2?w=800','IRO Royal Collection front',0,true);
  end if;
end $$;

-- ============================================================================
-- Done. Next: create an admin user (see README "Admin setup instructions").
-- ============================================================================
