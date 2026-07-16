-- Keep legacy writers compatible by resolving category_id from category text.

begin;

create or replace function public.ensure_spot_category_id()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  if new.category_id is null and nullif(btrim(new.category), '') is not null then
    select id
    into new.category_id
    from public.categories
    where lower(btrim(name)) = lower(btrim(new.category))
    limit 1;
  end if;

  return new;
end
$function$;

drop trigger if exists ensure_spot_category_id on public.spots;
create trigger ensure_spot_category_id
before insert or update of category, category_id
on public.spots
for each row execute function public.ensure_spot_category_id();

update public.spots as spot
set category_id = category.id
from public.categories as category
where spot.category_id is null
  and lower(btrim(spot.category)) = lower(btrim(category.name));

commit;
