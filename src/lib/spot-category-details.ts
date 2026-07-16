export type SpotCategoryDetails = {
  spot_id: string;
  category_slug: string;
  opening_hours: string | null;
  price_level: number | null;
  price_range: string | null;
  best_months: number[] | null;
  best_time: string | null;
  parking_info: Record<string, unknown> | null;
  tour_link: string | null;
  booking_link: string | null;
  google_rating: number | null;
};

const detailKeys = [
  "opening_hours",
  "price_level",
  "price_range",
  "best_months",
  "best_time",
  "parking_info",
  "tour_link",
  "booking_link",
  "google_rating",
] as const;

export function mergeSpotCategoryDetails<
  T extends Record<string, unknown>,
>(spot: T, details: SpotCategoryDetails | null): T {
  if (!details) return spot;

  const merged: Record<string, unknown> = { ...spot };

  for (const key of detailKeys) {
    if (details[key] !== null && details[key] !== undefined) {
      merged[key] = details[key];
    }
  }

  return merged as T;
}
