// app/sitemap.ts
import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const baseUrl = "https://www.khaolak.app";

// Interface-Definitionen für Supabase-Rückgaben
interface SupabaseSpot {
  slug: string;
  created_at: string | null;
}

interface SupabasePost {
  slug: string;
  created_at: string | null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date("2026-06-30"), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/entdecken`, lastModified: new Date("2026-06-30"), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date("2026-06-30"), changeFrequency: "weekly", priority: 0.8 },
  ];

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("🚨 SITEMAP ERROR: Supabase Umgebungsvariablen fehlen!");
    return staticPages;
  }

  const sitemapSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  // Hier jetzt sauber mit den Interfaces typisiert!
  let spots: SupabaseSpot[] = [];
  let posts: SupabasePost[] = [];

  try {
    const { data, error } = await sitemapSupabase.from("spots").select("slug, created_at");
    if (error) {
      console.error("🚨 SITEMAP SPOTS ERROR:", error.message);
    } else {
      spots = (data as SupabaseSpot[]) || [];
    }
  } catch (err) {
    console.error("🚨 SITEMAP SPOTS FETCH CRASH:", err);
  }

  try {
    const { data, error } = await sitemapSupabase.from("blog_posts").select("slug, created_at");
    if (error) {
      console.error("🚨 SITEMAP BLOG ERROR:", error.message);
    } else {
      posts = (data as SupabasePost[]) || [];
    }
  } catch (err) {
    console.error("🚨 SITEMAP BLOG FETCH CRASH:", err);
  }

  console.log(`[Sitemap] Gefunden: ${spots.length} Spots, ${posts.length} Blog-Posts.`);

  const spotPages: MetadataRoute.Sitemap = spots
    .filter((spot) => spot.slug)
    .map((spot) => ({
      url: `${baseUrl}/spot/${spot.slug.trim()}`,
      lastModified: spot.created_at ? new Date(spot.created_at) : new Date("2026-06-30"),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

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