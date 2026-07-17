alter table public.premium_rooms
  drop constraint if exists premium_rooms_occupancy_check;

alter table public.premium_rooms
  add constraint premium_rooms_occupancy_check
  check (
    max_occupancy is null
    or (
      (max_adults is null or max_occupancy >= max_adults)
      and (max_children is null or max_occupancy >= max_children)
    )
  );
