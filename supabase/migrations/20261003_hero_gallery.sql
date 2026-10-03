create table if not exists public.hero_slides (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  image_url text not null,
  alt_text text not null default '',
  object_position text not null default 'center',
  sort_order int not null default 0 check (sort_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_hero_slides_active_order on public.hero_slides(is_active, sort_order);

insert into public.hero_slides (id, title, image_url, alt_text, object_position, sort_order) values
  ('00000000-0000-4000-8000-000000000001', 'The signature drape', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&crop=bottom&w=1200&q=90', 'Purple saree with ornate gold embroidery', 'center 72%', 0),
  ('00000000-0000-4000-8000-000000000002', 'Prints with a story', 'https://images.unsplash.com/photo-1727430228383-aa1fb59db8bf?auto=format&fit=crop&crop=bottom&w=1200&q=90', 'Traditional saree styled in a colorful print', 'center 78%', 1),
  ('00000000-0000-4000-8000-000000000003', 'Together in tradition', 'https://images.unsplash.com/photo-1745482039058-92017fb981cf?auto=format&fit=crop&crop=bottom&w=1200&q=90', 'Two women wearing traditional sarees', 'center 72%', 2),
  ('00000000-0000-4000-8000-000000000004', 'The everyday edit', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&crop=bottom&w=1200&q=90', 'Pink trousers styled in a relaxed fashion look', 'center 78%', 3),
  ('00000000-0000-4000-8000-000000000005', 'A closer look', 'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?auto=format&fit=crop&crop=bottom&w=1200&q=90', 'Dark green shorts styled in a fashion look', 'center 76%', 4)
on conflict (id) do nothing;

alter table public.hero_slides enable row level security;

drop policy if exists "hero_slides_public_read" on public.hero_slides;
create policy "hero_slides_public_read" on public.hero_slides
  for select using (is_active = true or public.is_admin());

drop policy if exists "hero_slides_admin_write" on public.hero_slides;
create policy "hero_slides_admin_write" on public.hero_slides
  for all using (public.is_admin()) with check (public.is_admin());