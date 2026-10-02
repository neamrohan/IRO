-- Apply in Supabase SQL Editor to upgrade an existing IRO database.
-- Safe to run more than once.

begin;

alter table public.categories
  add column if not exists parent_id uuid references public.categories(id) on delete set null;

alter table public.categories
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_categories_parent
  on public.categories(parent_id);

create index if not exists idx_categories_active_order
  on public.categories(is_active, sort_order);

create or replace function public.set_category_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute procedure public.set_category_updated_at();

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select using (is_active = true or public.is_admin());

commit;

notify pgrst, 'reload schema';
