import type { Language } from "@/src/lib/i18n";
import de from "@/src/locales/de";
import en from "@/src/locales/en";

const translations = {
  de,
  en,
} as const;

type GermanTranslations = typeof de;

type DeepMutable<T> =
  T extends readonly (infer Item)[]
    ? DeepMutable<Item>[]
    : T extends object
      ? {
          -readonly [Key in keyof T]: DeepMutable<T[Key]>;
        }
      : T;

export type Translations = DeepMutable<GermanTranslations>;

export type TranslationKey = {
  [Key in keyof GermanTranslations]:
    GermanTranslations[Key] extends string ? Key : never;
}[keyof GermanTranslations];

export function t(
  language: Language,
  key: TranslationKey,
): string {
  return translations[language][key] as string;
}

export function getTranslations(
  language: Language,
): Translations {
  return translations[language] as unknown as Translations;
}