import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HotelRoomsOverview, {
  type PremiumRoomOverview,
} from "@/src/components/hotel/HotelRoomsOverview";
import { supabase } from "@/src/lib/supabase";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    lng?: string | string[];
  }>;
}

type Language = "de" | "en";

const BASE_URL = "https://khaolak.app";

function getLanguage(value?: string | string[]): Language {
  const language = Array.isArray(value) ? value[0] : value;
  return language === "en" ? "en" : "de";
}

function normalizeRooms(value: unknown): PremiumRoomOverview[] {
  let parsedValue = value;

  if (typeof parsedValue === "string") {
    try {
      parsedValue = JSON.parse(parsedValue);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue
    .filter(
      (room): room is PremiumRoomOverview =>
        typeof room === "object" && room !== null,
    )
    .filter((room) => {
      const status = String(room.status || "published")
        .trim()
        .toLowerCase();

      return status === "published";
    })
    .sort((first, second) => {
      const firstOrder = Number(first.sort_order || 0);
      const secondOrder = Number(second.sort_order || 0);

      return firstOrder - secondOrder;
    });
}

async function loadHotelRooms(slug: string) {
  const { data: spot, error: spotError } = await supabase
    .from("spots")
    .select("id, slug, title, title_en, template")
    .ilike("slug", slug)
    .maybeSingle();

  if (spotError) {
    console.error("Fehler beim Laden des Hotels:", spotError);
  }

  if (!spot) {
    return null;
  }

  const { data: premiumHotel, error: premiumHotelError } = await supabase
    .from("premium_hotels")
    .select("id")
    .eq("spot_id", spot.id)
    .maybeSingle();

  if (premiumHotelError) {
    console.error(
      "Fehler beim Laden des Premium-Hotelprofils:",
      premiumHotelError,
    );
  }

  if (premiumHotel?.id) {
    const { data: premiumRooms, error: premiumRoomsError } = await supabase
      .from("premium_rooms")
      .select("*")
      .eq("premium_hotel_id", premiumHotel.id)
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .order("name_de", { ascending: true });

    if (premiumRoomsError) {
      console.error(
        "Fehler beim Laden der Premium-Zimmer:",
        premiumRoomsError,
      );
    }

    if (premiumRooms && premiumRooms.length > 0) {
      return {
        spot,
        rooms: normalizeRooms(premiumRooms),
      };
    }
  }

  const { data: hotelProfile, error: profileError } = await supabase
    .from("hotel_profiles")
    .select("id, rooms_data")
    .eq("spot_id", spot.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "Fehler beim Laden des Hotelprofils:",
      profileError,
    );
  }

  if (!hotelProfile) {
    return null;
  }

  return {
    spot,
    rooms: normalizeRooms(hotelProfile.rooms_data),
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const slug = decodeURIComponent(resolvedParams.slug.trim());
  const language = getLanguage(resolvedSearchParams.lng);

  const result = await loadHotelRooms(slug);

  if (!result) {
    return {
      title:
        language === "en"
          ? "Rooms not found | Khao Lak Insider"
          : "Zimmer nicht gefunden | Khao Lak Insider",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const hotelTitle =
    language === "en"
      ? result.spot.title_en?.trim() || result.spot.title
      : result.spot.title?.trim() || result.spot.title_en;

  const title =
    language === "en"
      ? `Rooms & Villas | ${hotelTitle}`
      : `Zimmer & Villen | ${hotelTitle}`;

  const description =
    language === "en"
      ? `Discover all room and villa categories at ${hotelTitle}.`
      : `Entdecke alle Zimmer- und Villenkategorien im ${hotelTitle}.`;

  const canonicalUrl = `${BASE_URL}/spot/${encodeURIComponent(
    slug,
  )}/zimmer?lng=${language}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        de: `${BASE_URL}/spot/${encodeURIComponent(slug)}/zimmer?lng=de`,
        en: `${BASE_URL}/spot/${encodeURIComponent(slug)}/zimmer?lng=en`,
      },
    },
  };
}

export default async function RoomsOverviewPage({
  params,
  searchParams,
}: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const slug = decodeURIComponent(resolvedParams.slug.trim());
  const language = getLanguage(resolvedSearchParams.lng);

  const result = await loadHotelRooms(slug);

  if (!result || result.rooms.length === 0) {
    notFound();
  }

  const hotelTitle =
    language === "en"
      ? result.spot.title_en?.trim() || result.spot.title
      : result.spot.title?.trim() || result.spot.title_en;

  const backHref = `/spot/${encodeURIComponent(
    slug,
  )}?lng=${language}#rooms`;

  return (
    <HotelRoomsOverview
      rooms={result.rooms}
      hotelTitle={hotelTitle || ""}
      hotelSlug={slug}
      language={language}
      backHref={backHref}
    />
  );
}
