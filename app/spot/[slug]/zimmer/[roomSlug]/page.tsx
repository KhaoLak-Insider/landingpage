import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RoomDetail, {
  type PremiumRoomDetail,
} from "@/src/components/hotel/RoomDetail";
import { supabase } from "@/src/lib/supabase";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{
    slug: string;
    roomSlug: string;
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

function localizedValue(
  room: PremiumRoomDetail,
  language: Language,
  field: "name" | "short_description" | "description",
): string {
  const primary =
    language === "en" ? room[`${field}_en`] : room[`${field}_de`];

  const fallback =
    language === "en" ? room[`${field}_de`] : room[`${field}_en`];

  return (
    (typeof primary === "string" && primary.trim()) ||
    (typeof fallback === "string" && fallback.trim()) ||
    ""
  );
}

function normalizeRooms(value: unknown): PremiumRoomDetail[] {
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

  return parsedValue.filter(
    (room): room is PremiumRoomDetail =>
      typeof room === "object" && room !== null,
  );
}

function getRoomImage(room: PremiumRoomDetail): string | null {
  const imageFromArray = Array.isArray(room.images)
    ? room.images.find(
        (image) =>
          typeof image?.url === "string" && image.url.trim() !== "",
      )?.url
    : null;

  if (typeof imageFromArray === "string" && imageFromArray.trim()) {
    return imageFromArray.trim();
  }

  if (typeof room.image_url === "string" && room.image_url.trim()) {
    return room.image_url.trim();
  }

  return null;
}

async function loadRoom(slug: string, roomSlug: string) {
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

  const rooms = normalizeRooms(hotelProfile.rooms_data);

  const room =
    rooms.find(
      (item) =>
        typeof item.slug === "string" &&
        item.slug.trim().toLowerCase() === roomSlug.toLowerCase(),
    ) || null;

  if (!room) {
    return null;
  }

  const comparisonRooms = rooms
    .filter((item) => item.slug !== room.slug)
    .filter((item) => {
      const status = String(item.status || "published")
        .trim()
        .toLowerCase();

      return status === "published";
    })
    .sort((first, second) => {
      const firstOrder = Number(first.sort_order || 0);
      const secondOrder = Number(second.sort_order || 0);

      return firstOrder - secondOrder;
    });

  return {
    spot,
    room,
    comparisonRooms,
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const hotelSlug = decodeURIComponent(resolvedParams.slug.trim());
  const roomSlug = decodeURIComponent(resolvedParams.roomSlug.trim());
  const language = getLanguage(resolvedSearchParams.lng);

  const result = await loadRoom(hotelSlug, roomSlug);

  if (!result) {
    return {
      title:
        language === "en"
          ? "Room not found | Khao Lak Insider"
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

  const roomTitle = localizedValue(result.room, language, "name");
  const description =
    localizedValue(result.room, language, "short_description") ||
    localizedValue(result.room, language, "description");

  const canonicalUrl = new URL(
    `/spot/${encodeURIComponent(hotelSlug)}/zimmer/${encodeURIComponent(
      roomSlug,
    )}`,
    BASE_URL,
  );

  canonicalUrl.searchParams.set("lng", language);

  const image = getRoomImage(result.room);

  return {
    title: `${roomTitle} | ${hotelTitle}`,
    description,
    alternates: {
      canonical: canonicalUrl.toString(),
      languages: {
        de: `${BASE_URL}/spot/${encodeURIComponent(
          hotelSlug,
        )}/zimmer/${encodeURIComponent(roomSlug)}?lng=de`,
        en: `${BASE_URL}/spot/${encodeURIComponent(
          hotelSlug,
        )}/zimmer/${encodeURIComponent(roomSlug)}?lng=en`,
      },
    },
    openGraph: {
      type: "article",
      title: `${roomTitle} | ${hotelTitle}`,
      description,
      url: canonicalUrl.toString(),
      images: image ? [{ url: image, alt: roomTitle }] : undefined,
    },
  };
}

export default async function RoomPage({
  params,
  searchParams,
}: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const hotelSlug = decodeURIComponent(resolvedParams.slug.trim());
  const roomSlug = decodeURIComponent(resolvedParams.roomSlug.trim());
  const language = getLanguage(resolvedSearchParams.lng);

  const result = await loadRoom(hotelSlug, roomSlug);

  if (!result) {
    notFound();
  }

  const hotelTitle =
    language === "en"
      ? result.spot.title_en?.trim() || result.spot.title
      : result.spot.title?.trim() || result.spot.title_en;

  const backHref = `/spot/${encodeURIComponent(
    hotelSlug,
  )}?lng=${language}#rooms`;

  return (
    <RoomDetail
      room={result.room}
      comparisonRooms={result.comparisonRooms}
      hotelTitle={hotelTitle || ""}
      hotelSlug={hotelSlug}
      language={language}
      backHref={backHref}
    />
  );
}