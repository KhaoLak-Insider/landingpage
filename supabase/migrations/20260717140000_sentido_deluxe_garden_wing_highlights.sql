update public.premium_rooms
set
  highlights_de = array[
    'Privater Balkon',
    'Garten- oder Poolblick',
    'Zimmer in der 1. oder 2. Etage',
    'Badewanne und separate Dusche',
    'Kostenloses WLAN',
    'Kaffee- und Teezubereitung',
    'Klimaanlage'
  ]::text[],
  highlights_en = array[
    'Private balcony',
    'Garden or pool view',
    'Located on the 1st or 2nd floor',
    'Bath and separate shower',
    'Free in-room Wi-Fi',
    'Tea and coffee making facilities',
    'Air conditioning'
  ]::text[],
  updated_at = now()
where id = '09d16c02-d350-4ca1-9c95-fe7b0c6ab046'
  and slug = 'deluxe-garden-wing-see-all-rooms';
