import type { Language } from "@/src/lib/i18n";

export interface DescriptionBlock {
  type: "heading" | "paragraph" | string;
  content: string;
}

export function getLocalizedField<T = unknown>(
  item: Record<string, unknown> | null | undefined,
  field: string,
  language: Language
): T | undefined {
  if (!item) return undefined;

  const fallback = item[field] as T | undefined;

  if (language === "de") {
    return fallback;
  }

  const localized = item[`${field}_${language}`] as T | undefined;

  if (Array.isArray(localized)) {
    return (localized.length > 0 ? localized : fallback) as T | undefined;
  }

  if (typeof localized === "string") {
    return (localized.trim() !== "" ? localized : fallback) as T | undefined;
  }

  return localized ?? fallback;
}

export function getLocalizedConfigField<T = unknown>(
  item: Record<string, unknown> | null | undefined,
  field: string,
  language: Language
): T | undefined {
  if (!item) return undefined;

  if (language === "en") {
    const englishValue = item[`${field}_en`] as T | undefined;

    if (typeof englishValue === "string" && englishValue.trim() !== "") {
      return englishValue;
    }

    if (englishValue !== undefined && englishValue !== null) {
      return englishValue;
    }
  }

  return item[field] as T | undefined;
}

export function parseDescriptionBlocks(value: unknown): DescriptionBlock[] {
  if (Array.isArray(value)) {
    return value.filter(
      (block): block is DescriptionBlock =>
        typeof block === "object" &&
        block !== null &&
        typeof (block as DescriptionBlock).content === "string"
    );
  }

  if (typeof value === "string" && value.trim() !== "") {
    try {
      const parsed: unknown = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.filter(
          (block): block is DescriptionBlock =>
            typeof block === "object" &&
            block !== null &&
            typeof (block as DescriptionBlock).content === "string"
        );
      }
    } catch {
      return [{ type: "paragraph", content: value }];
    }
  }

  return [];
}
