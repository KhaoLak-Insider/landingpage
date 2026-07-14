import type { RoomForm } from "./types";

export const emptyRoom: RoomForm = {
  id: "",
  premium_hotel_id: "",
  slug: "",
  status: "draft",
  sort_order: "",

  name_de: "",
  name_en: "",

  short_description_de: "",
  short_description_en: "",
  description_de: "",
  description_en: "",

  size_sqm: "",
  max_adults: "",
  max_children: "",
  max_occupancy: "",

  bed_type_de: "",
  bed_type_en: "",
  view_de: "",
  view_en: "",
  bathroom_de: "",
  bathroom_en: "",

  cover_image_url: "",
  images: [],

  highlights_de: [],
  highlights_en: [],
  amenities_de: [],
  amenities_en: [],
};
