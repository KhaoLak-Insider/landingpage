-- Read-only checks for 20260716200000_spots_rls_cleanup.sql.

with checks as (
  select 'rls enabled' as check_name, relrowsecurity as passed
  from pg_class where oid = 'public.spots'::regclass

  union all

  select 'canonical policies exist', count(*) = 4
  from pg_policies
  where schemaname = 'public'
    and tablename = 'spots'
    and policyname in (
      'spots_public_read',
      'spots_admin_editor_insert',
      'spots_admin_editor_update',
      'spots_admin_delete'
    )

  union all

  select 'no unrestricted writes', not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'spots'
      and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
      and (qual = 'true' or with_check = 'true')
  )
  union all

  select 'delete is admin or editor', exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'spots'
      and policyname = 'spots_admin_delete'
      and cmd = 'DELETE'
      and roles = array['authenticated']::name[]
      and qual = 'public.is_admin_or_editor()'
  )
)
select check_name, case when passed then 'pass' else 'FAIL' end as result
from checks order by check_name;
