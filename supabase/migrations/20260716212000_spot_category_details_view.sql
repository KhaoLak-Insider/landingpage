-- Unified read model for category-specific details.

begin;

create or replace view public.spot_category_details
with (security_invoker = true)
as
select spot_id, 'restaurant'::text category_slug,
       opening_hours, price_level, price_range,
       null::integer[] best_months, null::text best_time, null::jsonb parking_info,
       null::text tour_link, booking_link, google_rating
from public.restaurant_details
union all
select spot_id, 'strand',
       null, null, null, best_months, best_time, parking_info,
       null, null, null
from public.beach_details
union all
select spot_id, 'ausfluege',
       opening_hours, price_level, price_range, best_months, best_time, parking_info,
       tour_link, booking_link, null
from public.excursion_details
union all
select spot_id, 'strandbar',
       opening_hours, price_level, price_range, null, best_time, parking_info,
       null, booking_link, google_rating
from public.beach_bar_details
union all
select spot_id, 'markt',
       opening_hours, price_level, price_range, null, best_time, parking_info,
       null, null, null
from public.market_details
union all
select spot_id, 'natur',
       null, null, null, best_months, best_time, parking_info,
       tour_link, null, null
from public.nature_details
union all
select spot_id, 'tempel',
       opening_hours, price_level, null, null, best_time, parking_info,
       null, null, null
from public.temple_details
union all
select spot_id, 'local-food',
       opening_hours, price_level, price_range, null, null, null,
       null, booking_link, google_rating
from public.local_food_details
union all
select spot_id, 'geheimtipp',
       null, null, null, best_months, best_time, parking_info,
       tour_link, booking_link, null
from public.insider_tip_details;

grant select on public.spot_category_details to anon, authenticated;

commit;
