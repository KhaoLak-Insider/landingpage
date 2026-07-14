import type { HotelForm, SpotForm } from "./types";

export const emptySpot: SpotForm = {
  id: "",
  slug: "",
  title: "",
  title_en: "",
  description: "",
  description_en: "",
  long_description: "",
  long_description_en: "",
  seo_title: "",
  seo_title_en: "",
  seo_description: "",
  seo_description_en: "",
  image_url: "",
};

export const emptyHotel: HotelForm = {
  id: "",
  spot_id: "",
  status: "draft",

  intro_features_de: [],
  intro_features_en: [],

  pool_count: "",
  room_count: "",
  restaurant_count: "",
  bar_count: "",

  suitable_for_families: false,
  adults_only: false,

  hero_summary_de: "",
  hero_summary_en: "",

  editorial_summary_de: "",
  editorial_summary_en: "",

  distance_bang_niang_market_m: "",
  distance_coconut_beach_m: "",
  distance_memories_beach_m: "",
  distance_nang_thong_center_m: "",
  distance_nearest_exchange_m: "",
  distance_phuket_airport_m: "",
  distance_nearest_7eleven_m: "",

  gallery_images: [],
  faq_items: [],

  source_url: "",
  verified_at: "",
};