import type { RoomImage } from "./types";

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

export function normalizeImages(value: unknown): RoomImage[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") {
        return { url: item, alt_de: "", alt_en: "" };
      }

      if (
        typeof item === "object" &&
        item !== null &&
        "url" in item &&
        typeof item.url === "string"
      ) {
        return {
          url: item.url,
          alt_de:
            "alt_de" in item && typeof item.alt_de === "string"
              ? item.alt_de
              : "",
          alt_en:
            "alt_en" in item && typeof item.alt_en === "string"
              ? item.alt_en
              : "",
        };
      }

      return null;
    })
    .filter((item): item is RoomImage => item !== null && Boolean(item.url));
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

export function cleanStringArray(values: string[]): string[] {
  return values.map((value) => value.trim()).filter(Boolean);
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
