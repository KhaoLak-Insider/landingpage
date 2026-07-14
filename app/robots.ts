import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/editor",
        "/editor/",
      ],
    },
    sitemap: "https://www.khaolak.app/sitemap.xml",
  };
}
