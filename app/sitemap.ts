import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://khaolak.app",
      lastModified: "2026-06-20",
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}