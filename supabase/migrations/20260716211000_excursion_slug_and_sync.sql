-- Normalize the excursion slug to ASCII and add an encoding-safe sync trigger.

begin;

update public.categories
set slug = 'ausfluege'
where encode(convert_to(slug, 'UTF8'), 'hex') = '617573666cc3bc6765';

insert into public.excursion_details (
  spot_id, opening_hours, price_level, price_range, best_months, best_time,
  parking_info, tour_link, booking_link
)
select spot.id, spot.opening_hours, spot.price_level, spot.price_range,
       coalesce(spot.best_months, '{}'), spot.best_time, spot.parking_info,
       spot.tour_link, spot.booking_link
from public.spots spot
join public.categories category on category.id = spot.category_id
where category.slug = 'ausfluege'
on conflict (spot_id) do update set
  opening_hours = excluded.opening_hours,
  price_level = excluded.price_level,
  price_range = excluded.price_range,
  best_months = excluded.best_months,
  best_time = excluded.best_time,
  parking_info = excluded.parking_info,
  tour_link = excluded.tour_link,
  booking_link = excluded.booking_link;

create or replace function public.sync_spot_excursion_details()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  if exists (
    select 1
    from public.categories
    where id = new.category_id and slug = 'ausfluege'
  ) then
    insert into public.excursion_details (
      spot_id, opening_hours, price_level, price_range, best_months, best_time,
      parking_info, tour_link, booking_link
    )
    values (
      new.id, new.opening_hours, new.price_level, new.price_range,
      coalesce(new.best_months, '{}'), new.best_time, new.parking_info,
      new.tour_link, new.booking_link
    )
    on conflict (spot_id) do update set
      opening_hours = excluded.opening_hours,
      price_level = excluded.price_level,
      price_range = excluded.price_range,
      best_months = excluded.best_months,
      best_time = excluded.best_time,
      parking_info = excluded.parking_info,
      tour_link = excluded.tour_link,
      booking_link = excluded.booking_link;
  end if;

  return new;
end
$function$;

drop trigger if exists sync_spot_excursion_details on public.spots;
create trigger sync_spot_excursion_details
after insert or update of category_id, opening_hours, price_level, price_range,
  best_months, best_time, parking_info, tour_link, booking_link
on public.spots
for each row execute function public.sync_spot_excursion_details();

commit;
