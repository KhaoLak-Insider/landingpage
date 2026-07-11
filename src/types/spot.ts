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

export interface SpotClientPageProps {
  initialSpot: SpotRecord;
  initialRandomSpots: SpotRecord[];
}
