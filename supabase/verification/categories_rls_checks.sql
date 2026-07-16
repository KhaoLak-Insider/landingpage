-- Read-only checks for 20260716190000_categories_rls.sql.

with checks as (
  select
    'rls enabled' as check_name,
    relrowsecurity as passed
  from pg_class
  where oid = 'public.categories'::regclass

  union all

  select
    'five policies exist',
    count(*) = 5
  from pg_policies
  where schemaname = 'public'
    and tablename = 'categories'
    and policyname in (
      'categories_public_read',
      'categories_admin_editor_read',
      'categories_admin_editor_insert',
      'categories_admin_editor_update',
      'categories_admin_delete'
    )

  union all

  select
    'public read is active only',
    exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'categories'
        and policyname = 'categories_public_read'
        and cmd = 'SELECT'
        and roles = array['anon', 'authenticated']::name[]
        and qual = '(is_active = true)'
    )

  union all

  select
    'admin editor write policies exist',
    count(*) = 2
  from pg_policies
  where schemaname = 'public'
    and tablename = 'categories'
    and policyname in (
      'categories_admin_editor_insert',
      'categories_admin_editor_update'
    )
    and roles = array['authenticated']::name[]

  union all

  select
    'delete is admin only',
    exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'categories'
        and policyname = 'categories_admin_delete'
        and cmd = 'DELETE'
        and roles = array['authenticated']::name[]
        and qual = 'is_admin()'
    )
)
select
  check_name,
  case when passed then 'pass' else 'FAIL' end as result
from checks
order by check_name;
