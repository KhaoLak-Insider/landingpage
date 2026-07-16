-- Add category-specific detail tables without removing legacy spot columns.

begin;

create table if not exists public.restaurant_details (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null unique references public.spots(id) on delete cascade,
  opening_hours text,
  price_level integer check (price_level is null or price_level between 0 and 5),
  price_range text,
  booking_link text,
  google_rating numeric check (google_rating is null or google_rating between 0 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.beach_details (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null unique references public.spots(id) on delete cascade,
  best_months integer[] not null default '{}',
  best_time text,
  parking_info jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.excursion_details (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null unique references public.spots(id) on delete cascade,
  opening_hours text,
  price_level integer check (price_level is null or price_level between 0 and 5),
  price_range text,
  best_months integer[] not null default '{}',
  best_time text,
  parking_info jsonb,
  tour_link text,
  booking_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.beach_bar_details (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null unique references public.spots(id) on delete cascade,
  opening_hours text,
  price_level integer check (price_level is null or price_level between 0 and 5),
  price_range text,
  best_time text,
  parking_info jsonb,
  booking_link text,
  google_rating numeric check (google_rating is null or google_rating between 0 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.market_details (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null unique references public.spots(id) on delete cascade,
  opening_hours text,
  price_level integer check (price_level is null or price_level between 0 and 5),
  price_range text,
  best_time text,
  parking_info jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nature_details (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null unique references public.spots(id) on delete cascade,
  best_months integer[] not null default '{}',
  best_time text,
  parking_info jsonb,
  tour_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.temple_details (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null unique references public.spots(id) on delete cascade,
  opening_hours text,
  price_level integer check (price_level is null or price_level between 0 and 5),
  best_time text,
  parking_info jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.local_food_details (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null unique references public.spots(id) on delete cascade,
  opening_hours text,
  price_level integer check (price_level is null or price_level between 0 and 5),
  price_range text,
  booking_link text,
  google_rating numeric check (google_rating is null or google_rating between 0 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.insider_tip_details (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null unique references public.spots(id) on delete cascade,
  best_months integer[] not null default '{}',
  best_time text,
  parking_info jsonb,
  tour_link text,
  booking_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $migration$
declare
  detail_table text;
begin
  foreach detail_table in array array[
    'restaurant_details', 'beach_details', 'excursion_details',
    'beach_bar_details', 'market_details', 'nature_details',
    'temple_details', 'local_food_details', 'insider_tip_details'
  ] loop
    execute format('alter table public.%I enable row level security', detail_table);
    execute format('drop trigger if exists set_%I_updated_at on public.%I', detail_table, detail_table);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      detail_table,
      detail_table
    );

    execute format('drop policy if exists public_read on public.%I', detail_table);
    execute format(
      'create policy public_read on public.%I for select to anon, authenticated using (exists (select 1 from public.spots where spots.id = spot_id and spots.is_published = true))',
      detail_table
    );
    execute format('drop policy if exists admin_editor_read on public.%I', detail_table);
    execute format(
      'create policy admin_editor_read on public.%I for select to authenticated using (public.is_admin_or_editor())',
      detail_table
    );
    execute format('drop policy if exists admin_editor_insert on public.%I', detail_table);
    execute format(
      'create policy admin_editor_insert on public.%I for insert to authenticated with check (public.is_admin_or_editor())',
      detail_table
    );
    execute format('drop policy if exists admin_editor_update on public.%I', detail_table);
    execute format(
      'create policy admin_editor_update on public.%I for update to authenticated using (public.is_admin_or_editor()) with check (public.is_admin_or_editor())',
      detail_table
    );
    execute format('drop policy if exists admin_delete on public.%I', detail_table);
    execute format(
      'create policy admin_delete on public.%I for delete to authenticated using (public.is_admin())',
      detail_table
    );
  end loop;
end
$migration$;

insert into public.restaurant_details (
  spot_id, opening_hours, price_level, price_range, booking_link, google_rating
)
select spot.id, spot.opening_hours, spot.price_level, spot.price_range,
       spot.booking_link, spot.google_rating
from public.spots spot
join public.categories category on category.id = spot.category_id
where category.slug = 'restaurant'
on conflict (spot_id) do nothing;

insert into public.beach_details (spot_id, best_months, best_time, parking_info)
select spot.id, coalesce(spot.best_months, '{}'), spot.best_time, spot.parking_info
from public.spots spot join public.categories category on category.id = spot.category_id
where category.slug = 'strand'
on conflict (spot_id) do nothing;

insert into public.excursion_details (
  spot_id, opening_hours, price_level, price_range, best_months, best_time,
  parking_info, tour_link, booking_link
)
select spot.id, spot.opening_hours, spot.price_level, spot.price_range,
       coalesce(spot.best_months, '{}'), spot.best_time, spot.parking_info,
       spot.tour_link, spot.booking_link
from public.spots spot join public.categories category on category.id = spot.category_id
where category.slug = 'ausflüge'
on conflict (spot_id) do nothing;

insert into public.beach_bar_details (
  spot_id, opening_hours, price_level, price_range, best_time, parking_info,
  booking_link, google_rating
)
select spot.id, spot.opening_hours, spot.price_level, spot.price_range,
       spot.best_time, spot.parking_info, spot.booking_link, spot.google_rating
from public.spots spot join public.categories category on category.id = spot.category_id
where category.slug = 'strandbar'
on conflict (spot_id) do nothing;

insert into public.market_details (
  spot_id, opening_hours, price_level, price_range, best_time, parking_info
)
select spot.id, spot.opening_hours, spot.price_level, spot.price_range,
       spot.best_time, spot.parking_info
from public.spots spot join public.categories category on category.id = spot.category_id
where category.slug = 'markt'
on conflict (spot_id) do nothing;

insert into public.nature_details (
  spot_id, best_months, best_time, parking_info, tour_link
)
select spot.id, coalesce(spot.best_months, '{}'), spot.best_time,
       spot.parking_info, spot.tour_link
from public.spots spot join public.categories category on category.id = spot.category_id
where category.slug = 'natur'
on conflict (spot_id) do nothing;

insert into public.temple_details (
  spot_id, opening_hours, price_level, best_time, parking_info
)
select spot.id, spot.opening_hours, spot.price_level, spot.best_time, spot.parking_info
from public.spots spot join public.categories category on category.id = spot.category_id
where category.slug = 'tempel'
on conflict (spot_id) do nothing;

insert into public.local_food_details (
  spot_id, opening_hours, price_level, price_range, booking_link, google_rating
)
select spot.id, spot.opening_hours, spot.price_level, spot.price_range,
       spot.booking_link, spot.google_rating
from public.spots spot join public.categories category on category.id = spot.category_id
where category.slug = 'local-food'
on conflict (spot_id) do nothing;

insert into public.insider_tip_details (
  spot_id, best_months, best_time, parking_info, tour_link, booking_link
)
select spot.id, coalesce(spot.best_months, '{}'), spot.best_time,
       spot.parking_info, spot.tour_link, spot.booking_link
from public.spots spot join public.categories category on category.id = spot.category_id
where category.slug = 'geheimtipp'
on conflict (spot_id) do nothing;

create or replace function public.sync_spot_category_details()
returns trigger
language plpgsql
set search_path = public
as $function$
declare
  category_slug text;
begin
  select slug into category_slug from public.categories where id = new.category_id;

  case category_slug
    when 'restaurant' then
      insert into public.restaurant_details (spot_id, opening_hours, price_level, price_range, booking_link, google_rating)
      values (new.id, new.opening_hours, new.price_level, new.price_range, new.booking_link, new.google_rating)
      on conflict (spot_id) do update set opening_hours=excluded.opening_hours, price_level=excluded.price_level, price_range=excluded.price_range, booking_link=excluded.booking_link, google_rating=excluded.google_rating;
    when 'strand' then
      insert into public.beach_details (spot_id, best_months, best_time, parking_info)
      values (new.id, coalesce(new.best_months, '{}'), new.best_time, new.parking_info)
      on conflict (spot_id) do update set best_months=excluded.best_months, best_time=excluded.best_time, parking_info=excluded.parking_info;
    when 'ausflüge' then
      insert into public.excursion_details (spot_id, opening_hours, price_level, price_range, best_months, best_time, parking_info, tour_link, booking_link)
      values (new.id, new.opening_hours, new.price_level, new.price_range, coalesce(new.best_months, '{}'), new.best_time, new.parking_info, new.tour_link, new.booking_link)
      on conflict (spot_id) do update set opening_hours=excluded.opening_hours, price_level=excluded.price_level, price_range=excluded.price_range, best_months=excluded.best_months, best_time=excluded.best_time, parking_info=excluded.parking_info, tour_link=excluded.tour_link, booking_link=excluded.booking_link;
    when 'strandbar' then
      insert into public.beach_bar_details (spot_id, opening_hours, price_level, price_range, best_time, parking_info, booking_link, google_rating)
      values (new.id, new.opening_hours, new.price_level, new.price_range, new.best_time, new.parking_info, new.booking_link, new.google_rating)
      on conflict (spot_id) do update set opening_hours=excluded.opening_hours, price_level=excluded.price_level, price_range=excluded.price_range, best_time=excluded.best_time, parking_info=excluded.parking_info, booking_link=excluded.booking_link, google_rating=excluded.google_rating;
    when 'markt' then
      insert into public.market_details (spot_id, opening_hours, price_level, price_range, best_time, parking_info)
      values (new.id, new.opening_hours, new.price_level, new.price_range, new.best_time, new.parking_info)
      on conflict (spot_id) do update set opening_hours=excluded.opening_hours, price_level=excluded.price_level, price_range=excluded.price_range, best_time=excluded.best_time, parking_info=excluded.parking_info;
    when 'natur' then
      insert into public.nature_details (spot_id, best_months, best_time, parking_info, tour_link)
      values (new.id, coalesce(new.best_months, '{}'), new.best_time, new.parking_info, new.tour_link)
      on conflict (spot_id) do update set best_months=excluded.best_months, best_time=excluded.best_time, parking_info=excluded.parking_info, tour_link=excluded.tour_link;
    when 'tempel' then
      insert into public.temple_details (spot_id, opening_hours, price_level, best_time, parking_info)
      values (new.id, new.opening_hours, new.price_level, new.best_time, new.parking_info)
      on conflict (spot_id) do update set opening_hours=excluded.opening_hours, price_level=excluded.price_level, best_time=excluded.best_time, parking_info=excluded.parking_info;
    when 'local-food' then
      insert into public.local_food_details (spot_id, opening_hours, price_level, price_range, booking_link, google_rating)
      values (new.id, new.opening_hours, new.price_level, new.price_range, new.booking_link, new.google_rating)
      on conflict (spot_id) do update set opening_hours=excluded.opening_hours, price_level=excluded.price_level, price_range=excluded.price_range, booking_link=excluded.booking_link, google_rating=excluded.google_rating;
    when 'geheimtipp' then
      insert into public.insider_tip_details (spot_id, best_months, best_time, parking_info, tour_link, booking_link)
      values (new.id, coalesce(new.best_months, '{}'), new.best_time, new.parking_info, new.tour_link, new.booking_link)
      on conflict (spot_id) do update set best_months=excluded.best_months, best_time=excluded.best_time, parking_info=excluded.parking_info, tour_link=excluded.tour_link, booking_link=excluded.booking_link;
    else
      null;
  end case;

  return new;
end
$function$;

drop trigger if exists sync_spot_category_details on public.spots;
create trigger sync_spot_category_details
after insert or update of category_id, opening_hours, price_level, price_range,
  best_months, best_time, parking_info, tour_link, booking_link, google_rating
on public.spots
for each row execute function public.sync_spot_category_details();

commit;
