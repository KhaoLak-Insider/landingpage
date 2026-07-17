update public.categories
set name_en = case slug
  when 'ausfluege' then 'Excursions'
  when 'markt' then 'Markets'
  when 'natur' then 'Nature'
  when 'strand' then 'Beaches'
  when 'tempel' then 'Temples'
  when 'unterkunft' then 'Accommodation'
  when 'restaurant' then 'Restaurants'
  when 'bars' then 'Bars'
  when 'essen-trinken' then 'Food & Drink'
  when 'strandbar' then 'Beach Bars'
  when 'local-food' then 'Local Food'
  else name_en
end
where slug in (
  'ausfluege',
  'markt',
  'natur',
  'strand',
  'tempel',
  'unterkunft',
  'restaurant',
  'bars',
  'essen-trinken',
  'strandbar',
  'local-food'
);
