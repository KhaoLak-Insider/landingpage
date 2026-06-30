// app/sitemap.ts
import { MetadataRoute } from "next";
import { supabase } from "@/src/lib/supabase";

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
    // 2. Spots abrufen (Das klappt jetzt dank deiner RLS-Policy!)
    const { data: spots } = await supabase.from("spots").select("slug"); 

    if (!spots || spots.length === 0) {
      return staticPages;
    }

    // 3. Spots sauber in das offizielle Next.js-Sitemap-Format mappen
    const spotPages: MetadataRoute.Sitemap = spots
      .filter((spot) => spot.slug)
      .map((spot) => ({
        url: `${baseUrl}/spot/${spot.slug.trim()}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }));

    return [...staticPages, ...spotPages];
    
  } catch (error) {
    console.error("Fehler bei der Sitemap-Generierung:", error);
    return staticPages;
  }
}