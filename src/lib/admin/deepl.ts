import { supabase } from "@/src/lib/supabase";

interface TranslateTextsOptions {
  sourceLang?: "DE" | "EN";
  targetLang?: "DE" | "EN" | "EN-GB" | "EN-US";
}

interface TranslateResponse {
  translations?: unknown;
  error?: unknown;
}

export async function translateTexts(
  texts: string[],
  options: TranslateTextsOptions = {},
): Promise<string[]> {
  const cleanedTexts = texts.map((text) => text.trim());

  if (cleanedTexts.length === 0) {
    return [];
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error(
      "Für die Übersetzung ist eine aktive Admin-Anmeldung erforderlich.",
    );
  }

  const response = await fetch("/api/admin/deepl", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      texts: cleanedTexts,
      sourceLang: options.sourceLang || "DE",
      targetLang: options.targetLang || "EN-GB",
    }),
  });

  const data = (await response.json()) as TranslateResponse;

  if (!response.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Die Übersetzung ist fehlgeschlagen.",
    );
  }

  if (
    !Array.isArray(data.translations) ||
    !data.translations.every(
      (translation): translation is string =>
        typeof translation === "string",
    )
  ) {
    throw new Error("Die DeepL-Antwort hat ein ungültiges Format.");
  }

  return data.translations;
}
