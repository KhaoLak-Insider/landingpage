// app/sitemap.ts
import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Verhindert Next.js-seitiges Caching der Sitemap

const baseUrl = "https://www.khaolak.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Umgebungsvariablen flexibel abgreifen
  const supabaseUrl = 
    process.env.SUPABASE_URL || 
    process.env.NEXT_PUBLIC_SUPABASE_URL;
    
  const supabaseAnonKey = 
    process.env.SUPABASE_ANON_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Statische Basisseiten definieren
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date("2026-06-30"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/entdecken`,
      lastModified: new Date("2026-06-30"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date("2026-06-30"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("🚨 SITEMAP ERROR: Supabase Umgebungsvariablen fehlen!");
    return staticPages;
  }

  const sitemapSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  // Variables für die Daten vorab deklarieren
  let spots = [];
  let posts = [];

  // 2. Abfragen nacheinander in try-catch ausführen
  try {
    // JETZT AUCH HIER KORRIGIERT: "created_at" statt "updated_at" geladen
    const { data, error } = await sitemapSupabase.from("spots").select("slug, created_at");
    if (error) {
      console.error("🚨 SITEMAP SPOTS ERROR:", error.message);
    } else {
      spots = data || [];
    }
  } catch (err) {
    console.error("🚨 SITEMAP SPOTS FETCH CRASH:", err);
  }

  try {
    const { data, error } = await sitemapSupabase.from("blog_posts").select("slug, created_at");
    if (error) {
      console.error("🚨 SITEMAP BLOG ERROR:", error.message);
    } else {
      posts = data || [];
    }
  } catch (err) {
    console.error("🚨 SITEMAP BLOG FETCH CRASH:", err);
  }

  console.log(`[Sitemap] Gefunden: ${spots.length} Spots, ${posts.length} Blog-Posts.`);

  // 3. Dynamische Routen für Spots generieren
  const spotPages: MetadataRoute.Sitemap = spots
    .filter((spot) => spot.slug)
    .map((spot) => ({
      url: `${baseUrl}/spot/${spot.slug.trim()}`,
      // Hier ebenfalls auf created_at umgestellt:
      lastModified: spot.created_at ? new Date(spot.created_at) : new Date("2026-06-30"),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  // 4. Dynamische Routen für Blog-Posts generieren
  const blogPages: MetadataRoute.Sitemap = posts
    .filter((post) => post.slug)
    .map((post) => ({
      url: `${baseUrl}/blog/${post.slug.trim()}`,
      lastModified: post.created_at ? new Date(post.created_at) : new Date("2026-06-30"),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [...staticPages, ...spotPages, ...blogPages];
}