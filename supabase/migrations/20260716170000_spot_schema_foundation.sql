-- Additive foundation for the normalized spot/category model.
-- Legacy columns remain in place until data migration and code rollout are complete.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '30s';

alter table public.categories
  add column if not exists name_en text,
  add column if not exists sort_order integer not null default 0,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.spots
  add column if not exists category_id uuid,
  add column if not exists updated_at timestamptz not null default now();

do $migration$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'categories_sort_order_nonnegative'
      and conrelid = 'public.categories'::regclass
  ) then
    alter table public.categories
      add constraint categories_sort_order_nonnegative
      check (sort_order >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'spots_category_id_fkey'
      and conrelid = 'public.spots'::regclass
  ) then
    alter table public.spots
      add constraint spots_category_id_fkey
      foreign key (category_id)
      references public.categories (id)
      on update cascade
      on delete restrict;
  end if;
end
$migration$;

create unique index if not exists categories_slug_unique
  on public.categories (slug);

create unique index if not exists categories_name_ci_unique
  on public.categories (lower(btrim(name)));

create unique index if not exists spots_slug_unique
  on public.spots (slug)
  where slug is not null and btrim(slug) <> '';

create index if not exists spots_category_id_idx
  on public.spots (category_id);

create index if not exists spots_publication_idx
  on public.spots (is_published, show_in_app);

create index if not exists categories_active_sort_idx
  on public.categories (is_active, sort_order);

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

drop trigger if exists set_spots_updated_at on public.spots;
create trigger set_spots_updated_at
before update on public.spots
for each row
execute function public.set_updated_at();

comment on column public.categories.name_en is
  'Optional English display name for the category.';
comment on column public.categories.sort_order is
  'Non-negative display order; lower values are shown first.';
comment on column public.categories.is_active is
  'Controls whether the category is available to application flows.';
comment on column public.spots.category_id is
  'Normalized category reference. The legacy category text remains during rollout.';

commit;
