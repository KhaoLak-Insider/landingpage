alter table public.categories
  add column if not exists parent_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'categories_parent_id_fkey'
      and conrelid = 'public.categories'::regclass
  ) then
    alter table public.categories
      add constraint categories_parent_id_fkey
      foreign key (parent_id)
      references public.categories(id)
      on delete set null;
  end if;
end
$$;

create index if not exists categories_parent_id_idx
  on public.categories(parent_id);

insert into public.categories (name, name_en, slug, icon, sort_order, is_active)
select 'Essen & Trinken', 'Food & Drink', 'essen-trinken', 'Utensils', 30, true
where not exists (
  select 1 from public.categories where slug = 'essen-trinken'
);

insert into public.categories (name, name_en, slug, icon, sort_order, is_active)
select 'Bars', 'Bars', 'bars', 'Wine', 20, true
where not exists (
  select 1 from public.categories where slug = 'bars'
);

update public.categories
set
  name_en = case slug
    when 'restaurant' then 'Restaurants'
    when 'strandbar' then 'Beach Bars'
    when 'local-food' then 'Local Food'
    else name_en
  end,
  parent_id = (
    select id from public.categories where slug = 'essen-trinken'
  ),
  sort_order = case slug
    when 'restaurant' then 10
    when 'bars' then 20
    when 'strandbar' then 30
    when 'local-food' then 40
    else sort_order
  end
where slug in ('restaurant', 'bars', 'strandbar', 'local-food');
