import { MetadataRoute } from "next";

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