import { supabase } from "@/src/lib/supabase";
import SpotClientPage from "./SpotClientPage";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    lng?: string | string[];
  }>;
}

type Language = "de" | "en";

type SpotSchemaType =
  | "Restaurant"
  | "Hotel"
  | "Beach"
  | "TouristAttraction"
  | "Place";

const BASE_URL = "https://khaolak.app";

function getLanguage(lng?: string | string[]): Language {
  const value = Array.isArray(lng) ? lng[0] : lng;

  return value === "en" ? "en" : "de";
}

function createLanguageUrl(
  slug: string,
  language: Language
): string {
  const url = new URL(
    `/spot/${encodeURIComponent(slug)}`,
    BASE_URL
  );

  url.searchParams.set("lng", language);

  return url.toString();
}

function createLocalizedUrl(
  path: string,
  language: Language
): string {
  const url = new URL(path, BASE_URL);
  url.searchParams.set("lng", language);

  return url.toString();
}

function shortenDescription(
  description: string,
  maxLength = 160
): string {
  const cleanedDescription = description.trim();

  if (cleanedDescription.length <= maxLength) {
    return cleanedDescription;
  }

  return `${cleanedDescription
    .slice(0, maxLength - 3)
    .trimEnd()}...`;
}

function getLocalizedValue(
  germanValue: string | null | undefined,
  englishValue: string | null | undefined,
  language: Language
): string {
  if (language === "en") {
    return englishValue?.trim() || germanValue?.trim() || "";
  }

  return germanValue?.trim() || englishValue?.trim() || "";
}

function getSpotSchemaType(category?: string | null): SpotSchemaType {
  const normalizedCategory = category
    ?.trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");

  if (
    normalizedCategory === "restaurant" ||
    normalizedCategory === "restaurants" ||
    normalizedCategory === "strandbar" ||
    normalizedCategory === "strandbars" ||
    normalizedCategory === "bar" ||
    normalizedCategory === "bars"
  ) {
    return "Restaurant";
  }

  if (
    normalizedCategory === "hotel" ||
    normalizedCategory === "hotels" ||
    normalizedCategory === "unterkunft" ||
    normalizedCategory === "unterkuenfte" ||
    normalizedCategory === "resort" ||
    normalizedCategory === "resorts"
  ) {
    return "Hotel";
  }

  if (
    normalizedCategory === "strand" ||
    normalizedCategory === "straende" ||
    normalizedCategory === "beach" ||
    normalizedCategory === "beaches"
  ) {
    return "Beach";
  }

  if (
    normalizedCategory === "sehenswuerdigkeit" ||
    normalizedCategory === "sehenswuerdigkeiten" ||
    normalizedCategory === "ausflug" ||
    normalizedCategory === "ausfluege" ||
    normalizedCategory === "tempel" ||
    normalizedCategory === "natur" ||
    normalizedCategory === "markt" ||
    normalizedCategory === "maerkte" ||
    normalizedCategory === "tourist attraction" ||
    normalizedCategory === "attraction"
  ) {
    return "TouristAttraction";
  }

  return "Place";
}

function createJsonLd(
  value: Record<string, unknown>
): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

// ======================================================
// DYNAMISCHE MEHRSPRACHIGE SEO-METADATEN
// ======================================================

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const decodedSlug = decodeURIComponent(
    resolvedParams.slug.trim()
  );

  const language = getLanguage(
    resolvedSearchParams.lng
  );

  const isEnglish = language === "en";

  const { data: spot, error } = await supabase
    .from("spots")
    .select(`
      title,
      title_en,
      description,
      description_en,
      seo_title,
      seo_title_en,
      seo_description,
      seo_description_en,
      image_url
    `)
    .ilike("slug", decodedSlug)
    .maybeSingle();

  if (error) {
    console.error(
      "Fehler beim Laden der Spot-Metadaten:",
      error
    );
  }

  if (!spot) {
    return {
      title: isEnglish
        ? "Spot not found | Khao Lak Insider"
        : "Spot nicht gefunden | Khao Lak Insider",

      description: isEnglish
        ? "The requested spot could not be found."
        : "Der angeforderte Spot konnte nicht gefunden werden.",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const localizedTitle = getLocalizedValue(
    spot.title,
    spot.title_en,
    language
  );

  const localizedDescription = getLocalizedValue(
    spot.description,
    spot.description_en,
    language
  );

  const finalTitle = isEnglish
    ? spot.seo_title_en ||
      `${localizedTitle} in Khao Lak | Highlights & Insider Tips`
    : spot.seo_title ||
      `${localizedTitle} Khao Lak | Highlights & Insider-Tipps`;

  const fallbackDescription = isEnglish
    ? `Discover ${localizedTitle} in Khao Lak. Find information, opening hours, directions and insider tips on Khao Lak Insider.`
    : `Entdecke ${localizedTitle} in Khao Lak. Infos, Öffnungszeiten, Anfahrt und echte Insider-Tipps auf Khao Lak Insider.`;

  const finalDescription = shortenDescription(
    isEnglish
      ? spot.seo_description_en ||
          localizedDescription ||
          fallbackDescription
      : spot.seo_description ||
          localizedDescription ||
          fallbackDescription
  );

  const germanUrl = createLanguageUrl(
    decodedSlug,
    "de"
  );

  const englishUrl = createLanguageUrl(
    decodedSlug,
    "en"
  );

  const canonicalUrl = isEnglish
    ? englishUrl
    : germanUrl;

  const imageUrl =
    spot.image_url ||
    `${BASE_URL}/images/og-image.jpg`;

  return {
    title: finalTitle,
    description: finalDescription,

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    alternates: {
      canonical: canonicalUrl,

      languages: {
        de: germanUrl,
        en: englishUrl,
        "x-default": germanUrl,
      },
    },

    openGraph: {
      type: "article",
      url: canonicalUrl,
      siteName: "Khao Lak Insider",

      locale: isEnglish
        ? "en_GB"
        : "de_DE",

      alternateLocale: isEnglish
        ? ["de_DE"]
        : ["en_GB"],

      title: finalTitle,
      description: finalDescription,

      images: [
        {
          url: imageUrl,
          alt: localizedTitle,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
      images: [imageUrl],
    },
  };
}

// ======================================================
// SERVER-DATENABRUF + STRUKTURIERTE DATEN
// ======================================================

export default async function Page({
  params,
  searchParams,
}: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const decodedSlug = decodeURIComponent(
    resolvedParams.slug.trim()
  );

  const language = getLanguage(
    resolvedSearchParams.lng
  );

  const { data: spotData, error: spotError } =
    await supabase
      .from("spots")
      .select("*")
      .ilike("slug", decodedSlug)
      .maybeSingle();

  if (spotError) {
    console.error(
      "Fehler beim Laden des Spots:",
      spotError
    );
  }

  if (!spotData) {
    notFound();
  }

  const isPremiumHotel =
    String(spotData.template || "")
      .trim()
      .toLowerCase()
      .replace(/_/g, "-") === "premium-hotel";

  let hotelProfile = null;

  if (isPremiumHotel) {
    const {
      data: hotelProfileData,
      error: hotelProfileError,
    } = await supabase
      .from("hotel_profiles")
      .select("*")
      .eq("spot_id", spotData.id)
      .maybeSingle();

    if (hotelProfileError) {
      console.error(
        "Fehler beim Laden des Premium-Hotelprofils:",
        hotelProfileError
      );
    }

    hotelProfile = hotelProfileData;
  }

  let hotelImages: Array<Record<string, unknown>> = [];

  if (hotelProfile?.id) {
    const {
      data: hotelImageData,
      error: hotelImageError,
    } = await supabase
      .from("hotel_images")
      .select(`
        id,
        hotel_profile_id,
        image_url,
        category,
        title_de,
        title_en,
        alt_de,
        alt_en,
        credit_name,
        credit_url,
        sort_order,
        is_cover,
        is_featured,
        status,
        created_at,
        updated_at
      `)
      .eq("hotel_profile_id", hotelProfile.id)
      .eq("status", "published")
      .order("is_cover", { ascending: false })
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: true });

    if (hotelImageError) {
      console.error(
        "Fehler beim Laden der Premium-Hotelbilder:",
        hotelImageError
      );
    }

    hotelImages = hotelImageData || [];
  }

  const { data: randomData, error: randomError } =
    await supabase
      .from("spots")
      .select(`
        id,
        slug,
        title,
        title_en,
        description,
        description_en,
        image_url,
        category,
        category_en,
        latitude,
        longitude
      `)
      .neq("category", "Unterkunft");

  if (randomError) {
    console.error(
      "Fehler beim Laden der Empfehlungen:",
      randomError
    );
  }

  const filteredRandom = randomData
    ? randomData
        .filter(
          (spot) =>
            spot.id !== spotData.id
        )
        .sort(() => Math.random() - 0.5)
        .slice(0, 10)
    : [];

  const localizedTitle = getLocalizedValue(
    spotData.title,
    spotData.title_en,
    language
  );

  const localizedDescription = getLocalizedValue(
    spotData.description,
    spotData.description_en,
    language
  );

  const localizedCategory = getLocalizedValue(
    spotData.category,
    spotData.category_en,
    language
  );

  const canonicalUrl = createLanguageUrl(
    decodedSlug,
    language
  );

  const homeUrl = createLocalizedUrl(
    "/",
    language
  );

  const discoverUrl = createLocalizedUrl(
    "/entdecken",
    language
  );

  const imageUrl =
    spotData.image_url ||
    `${BASE_URL}/images/og-image.jpg`;

  const schemaType = getSpotSchemaType(
    spotData.category
  );

  const spotStructuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "@id": `${canonicalUrl}#spot`,
    name: localizedTitle,
    description: localizedDescription,
    url: canonicalUrl,
    image: [imageUrl],
    inLanguage: language === "en" ? "en-GB" : "de-DE",
    isAccessibleForFree: true,
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: "Khao Lak",
      address: {
        "@type": "PostalAddress",
        addressRegion: "Phang Nga",
        addressCountry: "TH",
      },
    },
  };

  if (
    typeof spotData.latitude === "number" &&
    typeof spotData.longitude === "number"
  ) {
    spotStructuredData.geo = {
      "@type": "GeoCoordinates",
      latitude: spotData.latitude,
      longitude: spotData.longitude,
    };
  }

  if (
    typeof spotData.address === "string" &&
    spotData.address.trim() !== ""
  ) {
    spotStructuredData.address = {
      "@type": "PostalAddress",
      streetAddress: spotData.address.trim(),
      addressRegion: "Phang Nga",
      addressCountry: "TH",
    };
  }

  if (
    typeof spotData.opening_hours === "string" &&
    spotData.opening_hours.trim() !== ""
  ) {
    spotStructuredData.openingHours = spotData.opening_hours.trim();
  }

  if (
    schemaType === "Hotel" &&
    typeof spotData.stars === "number"
  ) {
    spotStructuredData.starRating = {
      "@type": "Rating",
      ratingValue: spotData.stars,
      bestRating: 5,
    };
  }

  if (
    schemaType === "Restaurant" &&
    typeof spotData.price_level !== "undefined" &&
    spotData.price_level !== null &&
    String(spotData.price_level).trim() !== ""
  ) {
    spotStructuredData.priceRange =
      `${spotData.price_level}/5`;
  }

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: language === "en"
          ? "Home"
          : "Startseite",
        item: homeUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: language === "en"
          ? "Discover"
          : "Entdecken",
        item: discoverUrl,
      },
      ...(localizedCategory
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: localizedCategory,
              item: `${discoverUrl}#${encodeURIComponent(
                localizedCategory
              )}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: localizedCategory ? 4 : 3,
        name: localizedTitle,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: createJsonLd(
            spotStructuredData
          ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: createJsonLd(
            breadcrumbStructuredData
          ),
        }}
      />

      <SpotClientPage
        initialSpot={spotData}
        initialRandomSpots={filteredRandom}
        initialHotelProfile={hotelProfile}
        initialHotelImages={hotelImages}
      />
    </>
  );
}