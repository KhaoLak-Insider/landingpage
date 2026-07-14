import type {
  HotelFaqItem,
  HotelGalleryImage,
} from "./types";

export function normalizeText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function cleanStringArray(values: string[]): string[] {
  return values.map((value) => value.trim()).filter(Boolean);
}

export function nullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function nullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeDateTime(value: unknown): string {
  if (typeof value !== "string" || !value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function toIsoDateTime(value: string): string | null {
  if (!value.trim()) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function normalizeGalleryImages(value: unknown): HotelGalleryImage[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (
        typeof item !== "object" ||
        item === null ||
        !("image_url" in item) ||
        typeof item.image_url !== "string"
      ) {
        return null;
      }

      const status =
        "status" in item &&
        (item.status === "published" || item.status === "archived")
          ? item.status
          : "draft";

      return {
        id:
          "id" in item && typeof item.id === "string"
            ? item.id
            : createId(),
        image_url: item.image_url,
        title_de:
          "title_de" in item && typeof item.title_de === "string"
            ? item.title_de
            : "",
        title_en:
          "title_en" in item && typeof item.title_en === "string"
            ? item.title_en
            : "",
        alt_de:
          "alt_de" in item && typeof item.alt_de === "string"
            ? item.alt_de
            : "",
        alt_en:
          "alt_en" in item && typeof item.alt_en === "string"
            ? item.alt_en
            : "",
        credit_name:
          "credit_name" in item && typeof item.credit_name === "string"
            ? item.credit_name
            : "",
        credit_url:
          "credit_url" in item && typeof item.credit_url === "string"
            ? item.credit_url
            : "",
        status,
        sort_order:
          "sort_order" in item && typeof item.sort_order === "number"
            ? item.sort_order
            : index + 1,
        is_cover:
          "is_cover" in item && typeof item.is_cover === "boolean"
            ? item.is_cover
            : false,
        is_featured:
          "is_featured" in item && typeof item.is_featured === "boolean"
            ? item.is_featured
            : false,
      };
    })
    .filter((item): item is HotelGalleryImage => item !== null)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function normalizeFaqItems(value: unknown): HotelFaqItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (typeof item !== "object" || item === null) return null;

      const status =
        "status" in item &&
        (item.status === "published" || item.status === "archived")
          ? item.status
          : "draft";

      return {
        id:
          "id" in item && typeof item.id === "string"
            ? item.id
            : createId(),
        category:
          "category" in item && typeof item.category === "string"
            ? item.category
            : "",
        question_de:
          "question_de" in item && typeof item.question_de === "string"
            ? item.question_de
            : "",
        question_en:
          "question_en" in item && typeof item.question_en === "string"
            ? item.question_en
            : "",
        answer_de:
          "answer_de" in item && typeof item.answer_de === "string"
            ? item.answer_de
            : "",
        answer_en:
          "answer_en" in item && typeof item.answer_en === "string"
            ? item.answer_en
            : "",
        status,
        sort_order:
          "sort_order" in item && typeof item.sort_order === "number"
            ? item.sort_order
            : index + 1,
        verified_at:
          "verified_at" in item && typeof item.verified_at === "string"
            ? item.verified_at
            : null,
      };
    })
    .filter((item): item is HotelFaqItem => item !== null)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Ein unbekannter Fehler ist aufgetreten.";
}
