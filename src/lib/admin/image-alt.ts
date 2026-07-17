import { supabase } from "@/src/lib/supabase";

export interface GeneratedAltTexts {
  de: string;
  en: string;
  title_de: string;
  title_en: string;
  category: string;
  quality_score: number;
  hero_score: number;
}

export async function generateImageAltTexts(
  imageUrl: string,
  context?: string,
): Promise<GeneratedAltTexts> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Eine Admin-Anmeldung ist erforderlich.");

  const response = await fetch("/api/admin/image-alt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ imageUrl, context }),
  });
  const data = (await response.json()) as Partial<GeneratedAltTexts> & { error?: string };
  if (!response.ok) throw new Error(data.error || "Alt-Texte konnten nicht erstellt werden.");
  if (!data.de || !data.en || !data.title_de || !data.title_en || !data.category) throw new Error("Die KI-Antwort ist unvollständig.");
  return {
    de: data.de,
    en: data.en,
    title_de: data.title_de,
    title_en: data.title_en,
    category: data.category,
    quality_score: Number(data.quality_score) || 0,
    hero_score: Number(data.hero_score) || 0,
  };
}
