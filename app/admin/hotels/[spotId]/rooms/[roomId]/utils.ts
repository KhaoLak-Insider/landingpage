import type { RoomImage } from "./types";

export function normalizeText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").map(item => item.trim()).filter(Boolean);
}

export function normalizeImages(value: unknown): RoomImage[] {
  if (!Array.isArray(value)) return [];
  const images: RoomImage[] = [];
  for (const item of value) {
    if (typeof item === "string") {
      images.push({ url: item, alt_de: "", alt_en: "" });
      continue;
    }
    if (typeof item === "object" && item !== null && "url" in item && typeof (item as {url:unknown}).url === "string") {
      const obj = item as {url:string; alt_de?:unknown; alt_en?:unknown};
      images.push({
        url: obj.url,
        alt_de: typeof obj.alt_de === "string" ? obj.alt_de : "",
        alt_en: typeof obj.alt_en === "string" ? obj.alt_en : "",
      });
    }
  }
  return images;
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
  return values.map(v => v.trim()).filter(Boolean);
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error && typeof (error as {message?:unknown}).message === "string") {
    return (error as {message:string}).message;
  }
  return "Ein unbekannter Fehler ist aufgetreten.";
}