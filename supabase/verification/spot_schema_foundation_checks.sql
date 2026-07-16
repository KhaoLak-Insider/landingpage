-- Read-only checks for 20260716170000_spot_schema_foundation.sql.
-- Run after the migration. Every row in the first result set must report "pass".

with checks as (
  select
    'required columns' as check_name,
    (
      select count(*) = 7
      from information_schema.columns
      where table_schema = 'public'
        and (table_name, column_name) in (
          ('categories', 'name_en'),
          ('categories', 'sort_order'),
          ('categories', 'is_active'),
          ('categories', 'created_at'),
          ('categories', 'updated_at'),
          ('spots', 'category_id'),
          ('spots', 'updated_at')
        )
    ) as passed,
    '7 columns expected' as detail

  union all

  select
    'category foreign key',
    exists (
      select 1
      from pg_constraint
      where conname = 'spots_category_id_fkey'
        and conrelid = 'public.spots'::regclass
        and confrelid = 'public.categories'::regclass
        and contype = 'f'
        and confupdtype = 'c'
        and confdeltype = 'r'
    ),
    'categories(id), ON UPDATE CASCADE, ON DELETE RESTRICT'

  union all

  select
    'sort order constraint',
    exists (
      select 1
      from pg_constraint
      where conname = 'categories_sort_order_nonnegative'
        and conrelid = 'public.categories'::regclass
        and contype = 'c'
    ),
    'categories.sort_order must be non-negative'

  union all

  select
    'required indexes',
    (
      select count(*) = 6
      from pg_indexes
      where schemaname = 'public'
        and indexname in (
          'categories_slug_unique',
          'categories_name_ci_unique',
          'spots_slug_unique',
          'spots_category_id_idx',
          'spots_publication_idx',
          'categories_active_sort_idx'
        )
    ),
    '6 indexes expected'

  union all

  select
    'updated_at triggers',
    (
      select count(*) = 2
      from pg_trigger
      where not tgisinternal
        and tgenabled <> 'D'
        and tgname in ('set_categories_updated_at', 'set_spots_updated_at')
        and tgrelid in ('public.categories'::regclass, 'public.spots'::regclass)
    ),
    '2 enabled triggers expected'

  union all

  select
    'category slugs remain unique',
    not exists (
      select slug
      from public.categories
      group by slug
      having count(*) > 1
    ),
    'no duplicate category slugs'

  union all

  select
    'category names remain unique',
    not exists (
      select lower(btrim(name))
      from public.categories
      group by lower(btrim(name))
      having count(*) > 1
    ),
    'no case-insensitive duplicate category names'

  union all

  select
    'spot slugs remain unique',
    not exists (
      select slug
      from public.spots
      where slug is not null and btrim(slug) <> ''
      group by slug
      having count(*) > 1
    ),
    'no duplicate non-empty spot slugs'
)
select
  check_name,
  case when passed then 'pass' else 'FAIL' end as result,
  detail
from checks
order by check_name;

-- Informational rollout state. category_id is intentionally not backfilled
-- by the foundation migration; that happens in the next migration.
select
  (select count(*) from public.categories) as category_count,
  (select count(*) from public.spots) as spot_count,
  (select count(*) from public.spots where category_id is null) as spots_pending_category_backfill,
  (select count(*) from public.spots where category is null or btrim(category) = '') as spots_without_legacy_category;
