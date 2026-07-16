-- Backfill normalized category references without removing the legacy text field.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '30s';

update public.spots as spot
set category_id = category.id
from public.categories as category
where spot.category_id is null
  and lower(btrim(spot.category)) = lower(btrim(category.name));

-- These two legacy records have no category text, but are restaurants.
update public.spots as spot
set category_id = category.id
from public.categories as category
where spot.category_id is null
  and spot.slug in (
    'cappadocia-turkish-restaurant-khao-lak',
    'yen-ta-fo-ko-cha'
  )
  and category.slug = 'restaurant';

do $migration$
declare
  unresolved_count integer;
begin
  select count(*)
  into unresolved_count
  from public.spots
  where category_id is null;

  if unresolved_count <> 0 then
    raise exception
      'Category backfill incomplete: % spot(s) still have no category_id',
      unresolved_count;
  end if;
end
$migration$;

commit;
