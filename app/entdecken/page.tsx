import type { Metadata } from "next";
import { supabase } from "@/src/lib/supabase";
import EntdeckenClientPage from "./EntdeckenClientPage";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    lng?: string | string[];
  }>;
}

type Language = "de" | "en";

const BASE_URL = "https://khaolak.app";

function getLanguage(lng?: string | string[]): Language {
  const value = Array.isArray(lng) ? lng[0] : lng;
  return value === "en" ? "en" : "de";
}

function createLanguageUrl(language: Language): string {
  const url = new URL("/entdecken", BASE_URL);
  url.searchParams.set("lng", language);
  return url.toString();
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

function createJsonLd(value: Record<string, unknown>): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const language = getLanguage(resolvedSearchParams.lng);
  const isEnglish = language === "en";

  const germanUrl = createLanguageUrl("de");
  const englishUrl = createLanguageUrl("en");
  const canonicalUrl = isEnglish ? englishUrl : germanUrl;

  const title = isEnglish
    ? "Discover Khao Lak | Beaches, Restaurants & Insider Tips"
    : "Khao Lak entdecken | Strände, Restaurants & Insider-Tipps";

  const description = isEnglish
    ? "Discover the best beaches, restaurants, markets, temples and hidden gems in Khao Lak. Filter places and find spots near your accommodation."
    : "Entdecke die besten Strände, Restaurants, Märkte, Tempel und Geheimtipps in Khao Lak. Filtere Orte und finde Spots nahe deiner Unterkunft.";

  const imageUrl = `${BASE_URL}/images/og-image.jpg`;

  return {
    title,
    description,

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
      type: "website",
      url: canonicalUrl,
      siteName: "Khao Lak Insider",
      locale: isEnglish ? "en_GB" : "de_DE",
      alternateLocale: isEnglish ? ["de_DE"] : ["en_GB"],
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: isEnglish
            ? "Discover Khao Lak with Khao Lak Insider"
            : "Khao Lak mit Khao Lak Insider entdecken",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function EntdeckenPage({
  searchParams,
}: Props) {
  const resolvedSearchParams = await searchParams;
  const language = getLanguage(resolvedSearchParams.lng);

  const [
    { data: spotsData, error: spotsError },
    { data: categoriesData, error: categoriesError },
  ] = await Promise.all([
    supabase
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
      .eq("is_published", true)
      .order("title", { ascending: true }),

    supabase
      .from("categories")
      .select("name, icon")
      .order("name", { ascending: true }),
  ]);

  if (spotsError) {
    console.error(
      "Fehler beim Laden der Entdecken-Spots:",
      spotsError
    );
  }

  if (categoriesError) {
    console.error(
      "Fehler beim Laden der Kategorien:",
      categoriesError
    );
  }

  const spots = spotsData || [];
  const categories = categoriesData || [];
  const canonicalUrl = createLanguageUrl(language);

  const localizedPageTitle =
    language === "en"
      ? "Discover Khao Lak"
      : "Khao Lak entdecken";

  const localizedPageDescription =
    language === "en"
      ? "Beaches, restaurants, markets, temples and genuine insider tips for your stay in Khao Lak."
      : "Strände, Restaurants, Märkte, Tempel und echte Insider-Tipps für deinen Aufenthalt in Khao Lak.";

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: localizedPageTitle,
        description: localizedPageDescription,
        inLanguage: language === "en" ? "en-GB" : "de-DE",
        isPartOf: {
          "@type": "WebSite",
          "@id": `${BASE_URL}/#website`,
          name: "Khao Lak Insider",
          url: BASE_URL,
        },
        about: {
          "@type": "Place",
          name: "Khao Lak",
          address: {
            "@type": "PostalAddress",
            addressRegion: "Phang Nga",
            addressCountry: "TH",
          },
        },
      },
      {
        "@type": "ItemList",
        "@id": `${canonicalUrl}#spots`,
        name: localizedPageTitle,
        numberOfItems: spots.length,
        itemListElement: spots.slice(0, 50).map((spot, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${BASE_URL}/spot/${encodeURIComponent(
            spot.slug
          )}?lng=${language}`,
          name: getLocalizedValue(
            spot.title,
            spot.title_en,
            language
          ),
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: language === "en" ? "Home" : "Startseite",
            item: `${BASE_URL}/?lng=${language}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: localizedPageTitle,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: createJsonLd(structuredData),
        }}
      />

      <EntdeckenClientPage
        initialSpots={spots}
        initialCategories={categories}
      />
    </>
  );
}