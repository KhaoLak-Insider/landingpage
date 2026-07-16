-- Read-only checks for 20260716210000_spot_category_detail_tables.sql.

with expected_tables(table_name, category_slug) as (
  values
    ('restaurant_details', 'restaurant'),
    ('beach_details', 'strand'),
    ('excursion_details', 'ausfluege'),
    ('beach_bar_details', 'strandbar'),
    ('market_details', 'markt'),
    ('nature_details', 'natur'),
    ('temple_details', 'tempel'),
    ('local_food_details', 'local-food'),
    ('insider_tip_details', 'geheimtipp')
),
checks as (
  select
    'nine detail tables exist' as check_name,
    count(*) = 9 as passed
  from information_schema.tables
  where table_schema = 'public'
    and table_name in (select expected_tables.table_name from expected_tables)

  union all

  select
    'all detail tables use rls',
    count(*) = 9
  from pg_class relation
  join pg_namespace namespace on namespace.oid = relation.relnamespace
  where namespace.nspname = 'public'
    and relation.relname in (select expected_tables.table_name from expected_tables)
    and relation.relrowsecurity

  union all

  select
    'all detail tables have five policies',
    count(*) = 45
  from pg_policies
  where schemaname = 'public'
    and tablename in (select expected_tables.table_name from expected_tables)
    and policyname in (
      'public_read', 'admin_editor_read', 'admin_editor_insert',
      'admin_editor_update', 'admin_delete'
    )

  union all

  select
    'all spot ids are unique and valid',
    not exists (
      select detail.spot_id
      from (
        select spot_id from public.restaurant_details
        union all select spot_id from public.beach_details
        union all select spot_id from public.excursion_details
        union all select spot_id from public.beach_bar_details
        union all select spot_id from public.market_details
        union all select spot_id from public.nature_details
        union all select spot_id from public.temple_details
        union all select spot_id from public.local_food_details
        union all select spot_id from public.insider_tip_details
      ) detail
      left join public.spots spot on spot.id = detail.spot_id
      where spot.id is null
    )

  union all

  select
    'backfill counts match categories',
    (select count(*) from public.restaurant_details) = (select count(*) from public.spots spot join public.categories category on category.id=spot.category_id where category.slug='restaurant')
    and (select count(*) from public.beach_details) = (select count(*) from public.spots spot join public.categories category on category.id=spot.category_id where category.slug='strand')
    and (select count(*) from public.excursion_details) = (select count(*) from public.spots spot join public.categories category on category.id=spot.category_id where category.slug='ausfluege')
    and (select count(*) from public.beach_bar_details) = (select count(*) from public.spots spot join public.categories category on category.id=spot.category_id where category.slug='strandbar')
    and (select count(*) from public.market_details) = (select count(*) from public.spots spot join public.categories category on category.id=spot.category_id where category.slug='markt')
    and (select count(*) from public.nature_details) = (select count(*) from public.spots spot join public.categories category on category.id=spot.category_id where category.slug='natur')
    and (select count(*) from public.temple_details) = (select count(*) from public.spots spot join public.categories category on category.id=spot.category_id where category.slug='tempel')
    and (select count(*) from public.local_food_details) = (select count(*) from public.spots spot join public.categories category on category.id=spot.category_id where category.slug='local-food')
    and (select count(*) from public.insider_tip_details) = (select count(*) from public.spots spot join public.categories category on category.id=spot.category_id where category.slug='geheimtipp')

  union all

  select
    'sync trigger enabled',
    exists (
      select 1 from pg_trigger
      where tgrelid = 'public.spots'::regclass
        and tgname = 'sync_spot_category_details'
        and not tgisinternal
        and tgenabled <> 'D'
    )
)
select check_name, case when passed then 'pass' else 'FAIL' end as result
from checks order by check_name;
