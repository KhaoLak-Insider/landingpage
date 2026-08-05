begin;

create table if not exists public.planner_trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  title text not null default 'Khao Lak Reise',
  arrival_date date not null,
  departure_date date not null,
  rest_days integer not null default 0 check (rest_days >= 0),
  has_rental_car boolean not null default false,
  has_scooter boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.planner_events (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.planner_trips(id) on delete cascade,
  day_index integer not null check (day_index >= 0 and day_index <= 6),
  start_hour numeric(4,2) not null check (start_hour >= 0 and start_hour <= 24),
  duration_hours numeric(4,2) not null check (duration_hours > 0 and duration_hours <= 24),
  title text not null,
  subtitle text not null default '',
  category text not null default 'Spot',
  color text not null default '#128fa3',
  spot_id uuid references public.spots(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.planner_trips enable row level security;
alter table public.planner_events enable row level security;

drop trigger if exists set_planner_trips_updated_at on public.planner_trips;
create trigger set_planner_trips_updated_at
before update on public.planner_trips
for each row execute function public.set_updated_at();

drop trigger if exists set_planner_events_updated_at on public.planner_events;
create trigger set_planner_events_updated_at
before update on public.planner_events
for each row execute function public.set_updated_at();

drop policy if exists planner_trips_select_own on public.planner_trips;
create policy planner_trips_select_own
on public.planner_trips
for select
to authenticated
using (auth.uid() = user_id or public.is_admin_or_editor());

drop policy if exists planner_trips_insert_own on public.planner_trips;
create policy planner_trips_insert_own
on public.planner_trips
for insert
to authenticated
with check (auth.uid() = user_id or public.is_admin_or_editor());

drop policy if exists planner_trips_update_own on public.planner_trips;
create policy planner_trips_update_own
on public.planner_trips
for update
to authenticated
using (auth.uid() = user_id or public.is_admin_or_editor())
with check (auth.uid() = user_id or public.is_admin_or_editor());

drop policy if exists planner_trips_delete_own on public.planner_trips;
create policy planner_trips_delete_own
on public.planner_trips
for delete
to authenticated
using (auth.uid() = user_id or public.is_admin_or_editor());

drop policy if exists planner_events_select_own on public.planner_events;
create policy planner_events_select_own
on public.planner_events
for select
to authenticated
using (
  exists (
    select 1
    from public.planner_trips trips
    where trips.id = planner_events.trip_id
      and (trips.user_id = auth.uid() or public.is_admin_or_editor())
  )
);

drop policy if exists planner_events_insert_own on public.planner_events;
create policy planner_events_insert_own
on public.planner_events
for insert
to authenticated
with check (
  exists (
    select 1
    from public.planner_trips trips
    where trips.id = planner_events.trip_id
      and (trips.user_id = auth.uid() or public.is_admin_or_editor())
  )
);

drop policy if exists planner_events_update_own on public.planner_events;
create policy planner_events_update_own
on public.planner_events
for update
to authenticated
using (
  exists (
    select 1
    from public.planner_trips trips
    where trips.id = planner_events.trip_id
      and (trips.user_id = auth.uid() or public.is_admin_or_editor())
  )
)
with check (
  exists (
    select 1
    from public.planner_trips trips
    where trips.id = planner_events.trip_id
      and (trips.user_id = auth.uid() or public.is_admin_or_editor())
  )
);

drop policy if exists planner_events_delete_own on public.planner_events;
create policy planner_events_delete_own
on public.planner_events
for delete
to authenticated
using (
  exists (
    select 1
    from public.planner_trips trips
    where trips.id = planner_events.trip_id
      and (trips.user_id = auth.uid() or public.is_admin_or_editor())
  )
);

commit;
