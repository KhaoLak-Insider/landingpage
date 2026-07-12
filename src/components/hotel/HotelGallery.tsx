"use client";

import { useMemo, useState } from "react";
import {
  Camera,
  ChevronRight,
  Images,
} from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import type { Language } from "@/src/lib/i18n";
import type { HotelImageRecord } from "@/src/types/spot";

interface HotelGalleryProps {
  images: HotelImageRecord[];
  fallbackImages: string[];
  hotelTitle: string;
  language: Language;
}

interface GalleryImage {
  id: string;
  src: string;
  category: string;
  categoryLabel: string;
  title: string;
  alt: string;
  creditName?: string | null;
  creditUrl?: string | null;
}

const copy = {
  de: {
    eyebrow: "Bilderwelten",
    title: "Das Resort entdecken",
    subtitle:
      "Ein visueller Rundgang durch Zimmer, Pools, Restaurants, Strand und Anlage.",
    all: "Alle",
    viewAll: "Alle Bilder ansehen",
    photo: "Foto",
    photos: "Fotos",
    categories: {
      general: "Übersicht",
      rooms: "Zimmer",
      pools: "Pools",
      restaurants: "Restaurants",
      beach: "Strand",
      spa: "Spa",
      gardens: "Anlage",
      activities: "Aktivitäten",
    },
  },
  en: {
    eyebrow: "Visual stories",
    title: "Discover the resort",
    subtitle:
      "A visual journey through rooms, pools, restaurants, beach and grounds.",
    all: "All",
    viewAll: "View all images",
    photo: "Photo",
    photos: "Photos",
    categories: {
      general: "Overview",
      rooms: "Rooms",
      pools: "Pools",
      restaurants: "Restaurants",
      beach: "Beach",
      spa: "Spa",
      gardens: "Grounds",
      activities: "Activities",
    },
  },
} as const;

function getCategoryDisplayName(
  image: HotelImageRecord,
  language: Language
): string {
  const primary =
    language === "en"
      ? image.display_name_en
      : image.display_name_de;

  const fallback =
    language === "en"
      ? image.display_name_de
      : image.display_name_en;

  if (
    typeof primary === "string" &&
    primary.trim() !== ""
  ) {
    return primary.trim();
  }

  if (
    typeof fallback === "string" &&
    fallback.trim() !== ""
  ) {
    return fallback.trim();
  }

  return "";
}

function normalizeCategory(value: string): string {
  return value.trim().toLowerCase() || "general";
}

function getLocalizedValue(
  image: HotelImageRecord,
  language: Language,
  field: "title" | "alt"
): string {
  const primary =
    language === "en"
      ? image[`${field}_en`]
      : image[`${field}_de`];

  const fallback =
    language === "en"
      ? image[`${field}_de`]
      : image[`${field}_en`];

  if (typeof primary === "string" && primary.trim()) {
    return primary.trim();
  }

  if (typeof fallback === "string" && fallback.trim()) {
    return fallback.trim();
  }

  return "";
}

export default function HotelGallery({
  images,
  fallbackImages,
  hotelTitle,
  language,
}: HotelGalleryProps) {
  const text = copy[language];
  const [activeCategory, setActiveCategory] =
    useState("all");
  const [lightboxOpen, setLightboxOpen] =
    useState(false);
  const [lightboxIndex, setLightboxIndex] =
    useState(0);

  const normalizedImages = useMemo<GalleryImage[]>(() => {
    if (images.length > 0) {
      return images.map((image, index) => {
        const category = normalizeCategory(
          image.category || "general"
        );

        const title =
          getLocalizedValue(image, language, "title") ||
          `${hotelTitle} ${index + 1}`;

        const alt =
          getLocalizedValue(image, language, "alt") ||
          title;

        const categoryLabel =
          getCategoryDisplayName(image, language);

        return {
          id: image.id,
          src: image.image_url,
          category,
          categoryLabel,
          title,
          alt,
          creditName: image.credit_name,
          creditUrl: image.credit_url,
        };
      });
    }

    return fallbackImages.map((src, index) => ({
      id: `fallback-${index}`,
      src,
      category: "general",
      categoryLabel: "",
      title: `${hotelTitle} ${index + 1}`,
      alt: `${hotelTitle} ${index + 1}`,
    }));
  }, [fallbackImages, hotelTitle, images, language]);

  const categories = useMemo(() => {
    const categoryMap = new Map<
      string,
      string
    >();

    normalizedImages.forEach((image) => {
      if (!categoryMap.has(image.category)) {
        categoryMap.set(
          image.category,
          image.categoryLabel
        );
      }
    });

    return [
      {
        value: "all",
        label: text.all,
      },
      ...Array.from(categoryMap.entries()).map(
        ([value, customLabel]) => ({
          value,
          label:
            customLabel ||
            text.categories[
              value as keyof typeof text.categories
            ] ||
            value,
        })
      ),
    ];
  }, [normalizedImages, text]);

  const filteredImages =
    activeCategory === "all"
      ? normalizedImages
      : normalizedImages.filter(
          (image) =>
            image.category === activeCategory
        );

  if (normalizedImages.length === 0) {
    return null;
  }

  const mosaicImages = filteredImages.slice(0, 5);

  const openImage = (image: GalleryImage) => {
    const index = filteredImages.findIndex(
      (item) => item.id === image.id
    );

    setLightboxIndex(Math.max(index, 0));
    setLightboxOpen(true);
  };

  return (
    <section>
      <div
        style={{
          marginBottom: 22,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ maxWidth: 680 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 9,
              color: "#0f766e",
              fontSize: 11,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.13em",
            }}
          >
            <Camera size={16} />
            {text.eyebrow}
          </div>

          <h2
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "clamp(28px, 4vw, 40px)",
              lineHeight: 1.12,
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            {text.title}
          </h2>

          <p
            style={{
              margin: "11px 0 0",
              color: "#64748b",
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            {text.subtitle}
          </p>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "#475569",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <Images size={17} color="#0f766e" />
          {filteredImages.length}{" "}
          {filteredImages.length === 1
            ? text.photo
            : text.photos}
        </div>
      </div>

      {categories.length > 2 && (
        <div
          style={{
            display: "flex",
            gap: 9,
            overflowX: "auto",
            paddingBottom: 4,
            marginBottom: 18,
          }}
        >
          {categories.map((category) => {
            const active =
              category.value === activeCategory;

            return (
              <button
                key={category.value}
                type="button"
                onClick={() => {
                  setActiveCategory(category.value);
                  setLightboxIndex(0);
                }}
                style={{
                  flexShrink: 0,
                  padding: "9px 14px",
                  borderRadius: 999,
                  border: active
                    ? "1px solid #0f766e"
                    : "1px solid #e2e8f0",
                  background: active
                    ? "#0f766e"
                    : "#ffffff",
                  color: active
                    ? "#ffffff"
                    : "#475569",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1.65fr) minmax(0, 1fr) minmax(0, 1fr)",
          gridTemplateRows: "190px 190px",
          gap: 10,
          overflow: "hidden",
          borderRadius: 26,
          background: "#e2e8f0",
          boxShadow:
            "0 18px 45px rgba(15,23,42,0.11)",
        }}
      >
        {mosaicImages.map((image, index) => {
          const isMain = index === 0;

          return (
            <button
              key={image.id}
              type="button"
              onClick={() => openImage(image)}
              aria-label={image.alt}
              style={{
                position: "relative",
                gridColumn: isMain
                  ? "span 1"
                  : "auto",
                gridRow: isMain
                  ? "span 2"
                  : "auto",
                minHeight: 0,
                padding: 0,
                border: "none",
                overflow: "hidden",
                cursor: "pointer",
                background: "#cbd5e1",
              }}
            >
              <img
                src={image.src}
                alt={image.alt}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition:
                    "transform 300ms ease",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform =
                    "scale(1.035)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform =
                    "scale(1)";
                }}
              />

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, transparent 52%, rgba(15,23,42,0.72) 100%)",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  left: 16,
                  right: 16,
                  bottom: 14,
                  color: "#ffffff",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontSize: isMain ? 16 : 12,
                    fontWeight: 800,
                    textShadow:
                      "0 2px 10px rgba(0,0,0,0.35)",
                  }}
                >
                  {image.title}
                </div>

                {image.creditName && (
                  <div
                    style={{
                      marginTop: 3,
                      fontSize: 9,
                      opacity: 0.76,
                    }}
                  >
                    © {image.creditName}
                  </div>
                )}
              </div>
            </button>
          );
        })}

        {filteredImages.length > 5 && (
          <button
            type="button"
            onClick={() => {
              setLightboxIndex(0);
              setLightboxOpen(true);
            }}
            style={{
              position: "absolute",
              right: 18,
              bottom: 18,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 15px",
              border: "1px solid rgba(255,255,255,0.55)",
              borderRadius: 999,
              background: "rgba(15,23,42,0.82)",
              color: "#ffffff",
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer",
              backdropFilter: "blur(8px)",
            }}
          >
            {text.viewAll}
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={filteredImages.map((image) => ({
          src: image.src,
          alt: image.alt,
          title: image.title,
        }))}
        on={{
          view: ({ index }) =>
            setLightboxIndex(index),
        }}
      />
    </section>
  );
}
