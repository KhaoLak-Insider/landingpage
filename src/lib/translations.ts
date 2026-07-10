import type { Language } from "@/src/lib/i18n";
import de from "@/src/locales/de";
import en from "@/src/locales/en";

const translations = {
  de,
  en,
} as const;

type GermanTranslations = typeof de;

export type TranslationKey = {
  [Key in keyof GermanTranslations]:
    GermanTranslations[Key] extends string ? Key : never;
}[keyof GermanTranslations];

export function t(
  language: Language,
  key: TranslationKey
): string {
  return translations[language][key] as string;
}

export function getTranslations(language: Language) {
  return translations[language];
}