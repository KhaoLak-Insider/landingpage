// app/sitemap.ts
import { MetadataRoute } from "next";
import { supabase } from "@/src/lib/supabase";

// WICHTIG: Damit die Sitemap bei jedem Google-Aufruf frisch aus Supabase geladen wird
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.khaolak.app";

  // 1. Statische Hauptseiten definieren
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/entdecken`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  try {
    // 2. Alle dynamischen Spot-Slugs aus Supabase abrufen
    const { data: spots } = await supabase
      .from("spots")
      .select("slug, updated_at"); // updated_at falls vorhanden, sonst weglassen

    if (!spots || spots.length === 0) {
      return staticPages;
    }

    // 3. Die dynamischen Spots in das Sitemap-Format umwandeln
    const spotPages: MetadataRoute.Sitemap = spots.map((spot) => ({
      url: `${baseUrl}/spot/${spot.slug}`,
      // Nutze das Update-Datum aus der DB, falls vorhanden, andernfalls das aktuelle Datum
      lastModified: spot.updated_at ? new Date(spot.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7, // Etwas niedriger als die Hauptseiten, aber hoch genug für Google
    }));

    // 4. Statische und dynamische Seiten zusammenfügen
    return [...staticPages, ...spotPages];
    
  } catch (error) {
    console.error("Fehler beim Generieren der Sitemap:", error);
    return staticPages; // Falls die DB offline ist, geben wir zumindest die Hauptseiten zurück
  }
}