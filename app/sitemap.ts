// app/sitemap.ts
import type { MetadataRoute } from "next";
import { supabase } from "@/src/lib/supabase";

export const dynamic = "force-dynamic";

const baseUrl = "https://www.khaolak.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const { data: spots, error: spotsError } = await supabase
    .from("spots")
    .select("slug, updated_at");

  const { data: posts, error: postsError } = await supabase
    .from("blog_posts")
    .select("slug, updated_at");

  if (spotsError) {
    console.error("Sitemap Spots Fehler:", spotsError);
  }

  if (postsError) {
    console.error("Sitemap Blog Fehler:", postsError);
  }

  const spotPages: MetadataRoute.Sitemap =
    spots
      ?.filter((spot) => spot.slug)
      .map((spot) => ({
        url: `${baseUrl}/spot/${spot.slug.trim()}`,
        lastModified: spot.updated_at
          ? new Date(spot.updated_at)
          : new Date("2026-06-30"),
        changeFrequency: "monthly",
        priority: 0.7,
      })) ?? [];

  const blogPages: MetadataRoute.Sitemap =
    posts
      ?.filter((post) => post.slug)
      .map((post) => ({
        url: `${baseUrl}/blog/${post.slug.trim()}`,
        lastModified: post.updated_at
          ? new Date(post.updated_at)
          : new Date("2026-06-30"),
        changeFrequency: "monthly",
        priority: 0.7,
      })) ?? [];

  return [...staticPages, ...spotPages, ...blogPages];
}