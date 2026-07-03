// app/sitemap.ts
import { MetadataRoute } from "next";
import { supabase } from "@/src/lib/supabase";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.khaolak.app";

  // 1. Statische Hauptseiten definieren (JETZT NEU: Inklusive deiner /blog Übersichtsseite!)
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
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  try {
    // 2. Dynamische SPOTS aus der Datenbank abrufen
    const { data: spots } = await supabase.from("spots").select("slug"); 

    // 3. Dynamische BLOG-BEITRÄGE aus der Datenbank abrufen
    const { data: posts } = await supabase.from("blog_posts").select("slug");

    // Arrays für dynamische Seiten initialisieren
    let spotPages: MetadataRoute.Sitemap = [];
    let blogPages: MetadataRoute.Sitemap = [];

    // Spots sauber in das offizielle Next.js-Sitemap-Format mappen
    if (spots && spots.length > 0) {
      spotPages = spots
        .filter((spot) => spot.slug)
        .map((spot) => ({
          url: `${baseUrl}/spot/${spot.slug.trim()}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        }));
    }

    // Blog-Beiträge sauber in das offizielle Next.js-Sitemap-Format mappen
    if (posts && posts.length > 0) {
      blogPages = posts
        .filter((post) => post.slug)
        .map((post) => ({
          url: `${baseUrl}/blog/${post.slug.trim()}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        }));
    }

    // Alle statischen und dynamischen Pfade zusammenführen und zurückgeben
    return [...staticPages, ...spotPages, ...blogPages];
    
  } catch (error) {
    console.error("Fehler bei der Sitemap-Generierung:", error);
    return staticPages;
  }
}