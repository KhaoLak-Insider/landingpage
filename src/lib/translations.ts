import type { Language } from "@/src/lib/i18n";
import de from "@/src/locales/de";
import en from "@/src/locales/en";

const translations = {
  de,
  en,
};

export type TranslationKey = keyof typeof de;

export function t(
  language: Language,
  key: TranslationKey
): (typeof de)[TranslationKey] {
  return translations[language][key];
}

export function getTranslations(language: Language) {
  return translations[language];
}