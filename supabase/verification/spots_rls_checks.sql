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
)
select check_name, case when passed then 'pass' else 'FAIL' end as result
from checks order by check_name;
