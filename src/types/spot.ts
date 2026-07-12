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


export interface HotelImageRecord {
  id: string;
  hotel_profile_id: string;
  image_url: string;
  category: string;
  display_name_de?: string | null;
  display_name_en?: string | null;
  title_de?: string | null;
  title_en?: string | null;
  alt_de?: string | null;
  alt_en?: string | null;
  credit_name?: string | null;
  credit_url?: string | null;
  sort_order: number;
  is_cover: boolean;
  is_featured: boolean;
  status: "draft" | "published" | "archived";
  created_at?: string;
  updated_at?: string;
}


export interface HotelRoomRecord {
  id: string;
  hotel_profile_id: string;
  name_de: string;
  name_en?: string | null;
  description_de?: string | null;
  description_en?: string | null;
  image_url?: string | null;
  size_sqm?: number | null;
  max_adults?: number | null;
  max_children?: number | null;
  bed_type_de?: string | null;
  bed_type_en?: string | null;
  view_de?: string | null;
  view_en?: string | null;
  highlights_de?: unknown[];
  highlights_en?: unknown[];
  price_from?: number | null;
  currency?: string | null;
  booking_url?: string | null;
  sort_order: number;
  status: "draft" | "published" | "archived";
  verified_at?: string | null;
  source_id?: string | null;
  created_at?: string;
  updated_at?: string;
}


export interface HotelRestaurantRecord {
  id: string;
  hotel_profile_id: string;
  venue_type: "restaurant" | "bar" | "cafe";
  name_de: string;
  name_en?: string | null;
  description_de?: string | null;
  description_en?: string | null;
  image_url?: string | null;
  cuisine_de?: string | null;
  cuisine_en?: string | null;
  location_de?: string | null;
  location_en?: string | null;
  opening_hours_de?: string | null;
  opening_hours_en?: string | null;
  serves_breakfast: boolean;
  serves_lunch: boolean;
  serves_dinner: boolean;
  serves_drinks: boolean;
  highlights_de?: unknown[];
  highlights_en?: unknown[];
  menu_url?: string | null;
  reservation_url?: string | null;
  sort_order: number;
  status: "draft" | "published" | "archived";
  verified_at?: string | null;
  source_id?: string | null;
  created_at?: string;
  updated_at?: string;
}


export type HotelAmenityType =
  | "pool"
  | "spa"
  | "activity"
  | "fitness"
  | "kids_club"
  | "shuttle"
  | "beach_service"
  | "service"
  | "facility"
  | "other";

export interface HotelAmenityRecord {
  id: string;
  hotel_profile_id: string;
  amenity_type: HotelAmenityType;
  name_de: string;
  name_en?: string | null;
  description_de?: string | null;
  description_en?: string | null;
  image_url?: string | null;
  location_de?: string | null;
  location_en?: string | null;
  opening_hours_de?: string | null;
  opening_hours_en?: string | null;
  highlights_de?: unknown[];
  highlights_en?: unknown[];
  details?: Record<string, unknown> | null;
  sort_order: number;
  status: "draft" | "published" | "archived";
  verified_at?: string | null;
  source_id?: string | null;
  created_at?: string;
  updated_at?: string;
}


export interface HotelPoolRecord {
  id: string;
  hotel_profile_id: string;
  pool_type:
    | "main_pool"
    | "infinity_pool"
    | "family_pool"
    | "children_pool"
    | "private_pool"
    | "other";
  name_de: string;
  name_en?: string | null;
  description_de?: string | null;
  description_en?: string | null;
  image_url?: string | null;
  location_de?: string | null;
  location_en?: string | null;
  opening_hours_de?: string | null;
  opening_hours_en?: string | null;
  depth_min_m?: number | null;
  depth_max_m?: number | null;
  has_children_area: boolean;
  has_pool_bar: boolean;
  is_heated: boolean;
  is_saltwater: boolean;
  highlights_de?: unknown[];
  highlights_en?: unknown[];
  sort_order: number;
  status: "draft" | "published" | "archived";
  verified_at?: string | null;
  source_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface HotelSpaRecord {
  id: string;
  hotel_profile_id: string;
  name_de: string;
  name_en?: string | null;
  description_de?: string | null;
  description_en?: string | null;
  image_url?: string | null;
  location_de?: string | null;
  location_en?: string | null;
  opening_hours_de?: string | null;
  opening_hours_en?: string | null;
  treatments_de?: unknown[];
  treatments_en?: unknown[];
  highlights_de?: unknown[];
  highlights_en?: unknown[];
  price_from?: number | null;
  currency?: string | null;
  reservation_url?: string | null;
  sort_order: number;
  status: "draft" | "published" | "archived";
  verified_at?: string | null;
  source_id?: string | null;
  created_at?: string;
  updated_at?: string;
}


export interface HotelLocationRecord {
  id: string;
  hotel_profile_id: string;
  setting_de?: string | null;
  setting_en?: string | null;
  editorial_summary_de?: string | null;
  editorial_summary_en?: string | null;
  beach_access_de?: string | null;
  beach_access_en?: string | null;
  terrain_de?: string | null;
  terrain_en?: string | null;
  noise_level_de?: string | null;
  noise_level_en?: string | null;
  walkability_de?: string | null;
  walkability_en?: string | null;
  transport_recommendation_de?: string | null;
  transport_recommendation_en?: string | null;
  sunset_view: boolean;
  swimming_conditions_de?: string | null;
  swimming_conditions_en?: string | null;
  nearby_services_de?: unknown[];
  nearby_services_en?: unknown[];
  distances?: unknown[];
  status: "draft" | "published" | "archived";
  verified_at?: string | null;
  source_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface HotelFaqRecord {
  id: string;
  hotel_profile_id: string;
  question_de: string;
  question_en?: string | null;
  answer_de: string;
  answer_en?: string | null;
  category: string;
  sort_order: number;
  status: "draft" | "published" | "archived";
  verified_at?: string | null;
  source_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SpotClientPageProps {
  initialSpot: SpotRecord;
  initialRandomSpots: SpotRecord[];
  initialHotelProfile: HotelProfileRecord | null;
  initialHotelImages: HotelImageRecord[];
  initialHotelRooms: HotelRoomRecord[];
  initialHotelRestaurants: HotelRestaurantRecord[];
  initialHotelAmenities: HotelAmenityRecord[];
  initialHotelLocation: HotelLocationRecord | null;
  initialHotelFaqs: HotelFaqRecord[];
}
