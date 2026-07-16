-- Protect category management while keeping active categories publicly readable.

begin;

alter table public.categories enable row level security;

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read
on public.categories
for select
to anon, authenticated
using (is_active = true);

drop policy if exists categories_admin_editor_read on public.categories;
create policy categories_admin_editor_read
on public.categories
for select
to authenticated
using (public.is_admin_or_editor());

drop policy if exists categories_admin_editor_insert on public.categories;
create policy categories_admin_editor_insert
on public.categories
for insert
to authenticated
with check (public.is_admin_or_editor());

drop policy if exists categories_admin_editor_update on public.categories;
create policy categories_admin_editor_update
on public.categories
for update
to authenticated
using (public.is_admin_or_editor())
with check (public.is_admin_or_editor());

drop policy if exists categories_admin_delete on public.categories;
create policy categories_admin_delete
on public.categories
for delete
to authenticated
using (public.is_admin());

commit;
