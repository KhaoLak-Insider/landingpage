-- Allow editors to delete spots as part of the CMS workflow.

begin;

drop policy if exists spots_admin_delete on public.spots;

create policy spots_admin_delete
on public.spots
for delete
to authenticated
using (public.is_admin_or_editor());

commit;
