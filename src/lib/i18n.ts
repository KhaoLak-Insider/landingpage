// src/lib/i18n.ts

export const languages = ["de", "en"] as const;

export type Language = (typeof languages)[number];

export const defaultLanguage: Language = "de";

export function getLanguage(searchParams?: {
  lng?: string;
}): Language {
  const lng = searchParams?.lng;

  if (languages.includes(lng as Language)) {
    return lng as Language;
  }

  return defaultLanguage;
}