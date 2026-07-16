-- Read-only checks for 20260716180000_spot_category_backfill.sql.

with checks as (
  select
    'all spots assigned' as check_name,
    not exists (
      select 1 from public.spots where category_id is null
    ) as passed

  union all

  select
    'all references valid',
    not exists (
      select 1
      from public.spots as spot
      left join public.categories as category on category.id = spot.category_id
      where category.id is null
    )

  union all

  select
    'legacy category mappings agree',
    not exists (
      select 1
      from public.spots as spot
      join public.categories as category on category.id = spot.category_id
      where nullif(btrim(spot.category), '') is not null
        and lower(btrim(spot.category)) <> lower(btrim(category.name))
    )

  union all

  select
    'manual restaurant mappings agree',
    (
      select count(*) = 2
      from public.spots as spot
      join public.categories as category on category.id = spot.category_id
      where spot.slug in (
        'cappadocia-turkish-restaurant-khao-lak',
        'yen-ta-fo-ko-cha'
      )
        and category.slug = 'restaurant'
    )
)
select
  check_name,
  case when passed then 'pass' else 'FAIL' end as result
from checks
order by check_name;

select
  category.name,
  category.slug,
  count(spot.id) as spot_count
from public.categories as category
left join public.spots as spot on spot.category_id = category.id
group by category.id, category.name, category.slug
order by category.name;
