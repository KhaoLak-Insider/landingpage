-- Remove legacy permissive policies and retain the canonical CMS policies.

begin;

alter table public.spots enable row level security;

drop policy if exists "Allow all updates for authenticated users" on public.spots;
drop policy if exists "Authentifizierte Nutzer können Spots bearbeiten" on public.spots;
drop policy if exists "Authentifizierte Nutzer können Spots erstellen" on public.spots;
drop policy if exists "Enable read access for all users" on public.spots;

commit;
