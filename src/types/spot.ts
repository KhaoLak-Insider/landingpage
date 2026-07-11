export type SpotTemplate =
  | "standard"
  | "premium-hotel"
  | "hotel-standard"
  | "restaurant-standard"
  | "restaurant-premium"
  | "beach";

export type SpotType =
  | "hotel"
  | "restaurant"
  | "beach"
  | "activity"
  | "temple"
  | "market"
  | "nature"
  | "attraction"
  | "place";

export interface SpotRecord {
  id: string | number;
  slug: string;
  title: string;
  title_en?: string | null;
  description?: string | null;
  description_en?: string | null;
  long_description?: unknown;
  long_description_en?: unknown;
  category?: string | null;
  category_en?: string | null;
  spot_type?: SpotType | string | null;
  template?: SpotTemplate | string | null;
  image_url?: string | null;
  gallery_urls?: string[] | string | null;
  latitude?: number | null;
  longitude?: number | null;
  [key: string]: unknown;
}

export interface HotelProfileRecord {
  id: string;
  spot_id: string;
  status: "draft" | "review" | "published" | "archived";
  summary_de?: string | null;
  summary_en?: string | null;
  room_count?: number | null;
  pool_count?: number | null;
  restaurant_count?: number | null;
  bar_count?: number | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  price_level?: number | null;
  beachfront?: boolean | null;
  suitable_for_couples?: boolean | null;
  suitable_for_families?: boolean | null;
  suitable_for_honeymoon?: boolean | null;
  suitable_for_relaxation?: boolean | null;
  best_for_de?: unknown[];
  best_for_en?: unknown[];
  highlights_de?: unknown[];
  highlights_en?: unknown[];
  facilities_de?: unknown[];
  facilities_en?: unknown[];
  hero_badges_de?: unknown[];
  hero_badges_en?: unknown[];
  editorial_note_de?: string | null;
  editorial_note_en?: string | null;
  verified_at?: string | null;
  verified_by?: string | null;
  verification_note?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface SpotClientPageProps {
  initialSpot: SpotRecord;
  initialRandomSpots: SpotRecord[];
  initialHotelProfile: HotelProfileRecord | null;
}
