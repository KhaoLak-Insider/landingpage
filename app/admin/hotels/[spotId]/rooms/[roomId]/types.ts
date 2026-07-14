export type ContentStatus = "draft" | "published" | "archived";

export interface RoomImage {
  url: string;
  alt_de?: string;
  alt_en?: string;
}

export interface RoomForm {
  id: string;
  premium_hotel_id: string;
  slug: string;
  status: ContentStatus;
  sort_order: string;

  name_de: string;
  name_en: string;

  short_description_de: string;
  short_description_en: string;
  description_de: string;
  description_en: string;

  size_sqm: string;
  max_adults: string;
  max_children: string;
  max_occupancy: string;

  bed_type_de: string;
  bed_type_en: string;
  view_de: string;
  view_en: string;
  bathroom_de: string;
  bathroom_en: string;

  cover_image_url: string;
  images: RoomImage[];

  highlights_de: string[];
  highlights_en: string[];
  amenities_de: string[];
  amenities_en: string[];
}

export interface HotelReference {
  id: string;
  spot_id: string;
}

export interface SpotReference {
  id: string;
  slug: string;
  title: string;
}

export interface FeedbackState {
  type: "success" | "error";
  message: string;
}
