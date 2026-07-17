export type ContentStatus = "draft" | "published" | "archived";

export interface HotelGalleryImage {
  id: string;
  media_type: "image" | "video";
  image_url: string;
  title_de: string;
  title_en: string;
  alt_de: string;
  alt_en: string;
  credit_name: string;
  credit_url: string;
  status: ContentStatus;
  sort_order: number;
  is_cover: boolean;
  is_featured: boolean;
}

export interface HotelFaqItem {
  id: string;
  category: string;
  question_de: string;
  question_en: string;
  answer_de: string;
  answer_en: string;
  status: ContentStatus;
  sort_order: number;
  verified_at: string | null;
}

export interface SpotForm {
  id: string;
  slug: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  long_description: string;
  long_description_en: string;
  seo_title: string;
  seo_title_en: string;
  seo_description: string;
  seo_description_en: string;
  image_url: string;
}

export interface HotelForm {
  id: string;
  spot_id: string;
  status: ContentStatus;

  intro_features_de: string[];
  intro_features_en: string[];

  pool_count: string;
  room_count: string;
  restaurant_count: string;
  bar_count: string;

  suitable_for_families: boolean;
  adults_only: boolean;

  hero_summary_de: string;
  hero_summary_en: string;

  editorial_summary_de: string;
  editorial_summary_en: string;

  distance_bang_niang_market_m: string;
  distance_coconut_beach_m: string;
  distance_memories_beach_m: string;
  distance_nang_thong_center_m: string;
  distance_nearest_exchange_m: string;
  distance_phuket_airport_m: string;
  distance_nearest_7eleven_m: string;

  gallery_images: HotelGalleryImage[];
  faq_items: HotelFaqItem[];

  source_url: string;
  verified_at: string;
}

export interface FeedbackState {
  type: "success" | "error";
  message: string;
}
