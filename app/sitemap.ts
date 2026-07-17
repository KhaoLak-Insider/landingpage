import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { absoluteLocalizedUrl } from "@/src/lib/i18n-routing";
import type { Language } from "@/src/lib/i18n";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const baseUrl = "https://www.khaolak.app";
const fallbackLastModified = new Date("2026-07-17");

interface SupabaseSpot {
  id: string;
  slug: string;
  title_en: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface SupabasePost {
  slug: string;
  title_en: string | null;
  content_en: string | null;
  created_at: string | null;
}

interface SupabasePremiumHotel {
  id: string;
  spot_id: string;
  updated_at: string | null;
}

interface SupabasePremiumRoom {
  premium_hotel_id: string;
  slug: string;
  name_en: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface SitemapOptions {
  lastModified: Date;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
  languages?: Language[];
}

function localizedEntries(
  path: string,
  {
    lastModified,
    changeFrequency,
    priority,
    languages = ["de", "en"],
  }: SitemapOptions,
): MetadataRoute.Sitemap {
  const languageAlternates: Record<string, string> = {
    de: absoluteLocalizedUrl(path, "de", baseUrl),
    "x-default": absoluteLocalizedUrl(path, "de", baseUrl),
  };

  if (languages.includes("en")) {
    languageAlternates.en = absoluteLocalizedUrl(path, "en", baseUrl);
  }

  return languages.map((language) => ({
    url: absoluteLocalizedUrl(path, language, baseUrl),
    lastModified,
    changeFrequency,
    priority,
    alternates: {
      languages: languageAlternates,
    },
  }));
}

function toDate(value: string | null | undefined): Date {
  return value ? new Date(value) : fallbackLastModified;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const bilingualStaticPages = [
    { path: "/home", priority: 1.0 },
    { path: "/entdecken", priority: 0.9 },
    { path: "/blog", priority: 0.9 },
    { path: "/ueber-uns", priority: 0.7 },
  ];

  const germanStaticPages = [
    { path: "/", priority: 0.8 },
    { path: "/planen", priority: 0.7 },
    { path: "/community", priority: 0.6 },
    { path: "/datenschutz", priority: 0.3 },
    { path: "/impressum", priority: 0.3 },
  ];

  const staticPages: MetadataRoute.Sitemap = [
    ...bilingualStaticPages.flatMap(({ path, priority }) =>
      localizedEntries(path, {
        lastModified: fallbackLastModified,
        changeFrequency: "weekly",
        priority,
      }),
    ),
    ...germanStaticPages.flatMap(({ path, priority }) =>
      localizedEntries(path, {
        lastModified: fallbackLastModified,
        changeFrequency: "yearly",
        priority,
        languages: ["de"],
      }),
    ),
  ];

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("SITEMAP ERROR: Supabase environment variables are missing.");
    return staticPages;
  }

  const sitemapSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const [spotsResult, postsResult, hotelsResult, roomsResult] =
    await Promise.all([
      sitemapSupabase
        .from("spots")
        .select("id, slug, title_en, created_at, updated_at")
        .eq("is_published", true)
        .not("slug", "is", null),
      sitemapSupabase
        .from("blog_posts")
        .select("slug, title_en, content_en, created_at")
        .not("slug", "is", null),
      sitemapSupabase
        .from("premium_hotels")
        .select("id, spot_id, updated_at")
        .eq("status", "published"),
      sitemapSupabase
        .from("premium_rooms")
        .select("premium_hotel_id, slug, name_en, created_at, updated_at")
        .eq("status", "published")
        .not("slug", "is", null),
    ]);

  for (const result of [spotsResult, postsResult, hotelsResult, roomsResult]) {
    if (result.error) {
      console.error("SITEMAP SUPABASE ERROR:", result.error.message);
    }
  }

  const spots = (spotsResult.data as SupabaseSpot[] | null) || [];
  const posts = (postsResult.data as SupabasePost[] | null) || [];
  const hotels =
    (hotelsResult.data as SupabasePremiumHotel[] | null) || [];
  const rooms = (roomsResult.data as SupabasePremiumRoom[] | null) || [];

  const spotById = new Map(spots.map((spot) => [spot.id, spot]));
  const hotelById = new Map(hotels.map((hotel) => [hotel.id, hotel]));

  const spotPages = spots.flatMap((spot) => {
    const hasEnglishContent = Boolean(spot.title_en?.trim());
    return localizedEntries(`/spot/${spot.slug.trim()}`, {
      lastModified: toDate(spot.updated_at || spot.created_at),
      changeFrequency: "monthly",
      priority: 0.8,
      languages: hasEnglishContent ? ["de", "en"] : ["de"],
    });
  });

  const blogPages = posts.flatMap((post) => {
    const hasEnglishContent = Boolean(
      post.title_en?.trim() && post.content_en?.trim(),
    );
    return localizedEntries(`/blog/${post.slug.trim()}`, {
      lastModified: toDate(post.created_at),
      changeFrequency: "monthly",
      priority: 0.7,
      languages: hasEnglishContent ? ["de", "en"] : ["de"],
    });
  });

  const roomOverviewPages = hotels.flatMap((hotel) => {
    const spot = spotById.get(hotel.spot_id);
    if (!spot) return [];

    const hotelRooms = rooms.filter(
      (room) => room.premium_hotel_id === hotel.id,
    );
    if (hotelRooms.length === 0) return [];

    const hasEnglishContent =
      Boolean(spot.title_en?.trim()) &&
      hotelRooms.some((room) => Boolean(room.name_en?.trim()));

    return localizedEntries(`/spot/${spot.slug.trim()}/zimmer`, {
      lastModified: toDate(hotel.updated_at),
      changeFrequency: "monthly",
      priority: 0.7,
      languages: hasEnglishContent ? ["de", "en"] : ["de"],
    });
  });

  const roomPages = rooms.flatMap((room) => {
    const hotel = hotelById.get(room.premium_hotel_id);
    const spot = hotel ? spotById.get(hotel.spot_id) : undefined;
    if (!hotel || !spot) return [];

    const hasEnglishContent = Boolean(
      spot.title_en?.trim() && room.name_en?.trim(),
    );
    return localizedEntries(
      `/spot/${spot.slug.trim()}/zimmer/${room.slug.trim()}`,
      {
        lastModified: toDate(room.updated_at || room.created_at),
        changeFrequency: "monthly",
        priority: 0.7,
        languages: hasEnglishContent ? ["de", "en"] : ["de"],
      },
    );
  });

  return [
    ...staticPages,
    ...spotPages,
    ...blogPages,
    ...roomOverviewPages,
    ...roomPages,
  ];
}
