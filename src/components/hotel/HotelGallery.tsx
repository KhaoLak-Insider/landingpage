"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
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
  title: string;
  alt: string;
  mediaType: "image" | "video";
}

const copy = {
  de: {
    title: "Impressionen",
    viewAll: (count: number) => `Alle ${count} Bilder ansehen`,
  },
  en: {
    title: "Impressions",
    viewAll: (count: number) => `View all ${count} images`,
  },
} as const;

function getLocalizedValue(
  image: HotelImageRecord,
  language: Language,
  field: "title" | "alt",
): string {
  const primary =
    language === "en" ? image[`${field}_en`] : image[`${field}_de`];
  const fallback =
    language === "en" ? image[`${field}_de`] : image[`${field}_en`];

  if (typeof primary === "string" && primary.trim()) return primary.trim();
  if (typeof fallback === "string" && fallback.trim()) return fallback.trim();
  return "";
}

export default function HotelGallery({
  images,
  fallbackImages,
  hotelTitle,
  language,
}: HotelGalleryProps) {
  const text = copy[language];
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const normalizedImages = useMemo<GalleryImage[]>(() => {
    if (images.length > 0) {
      return images.map((image, index) => {
        const title =
          getLocalizedValue(image, language, "title") ||
          `${hotelTitle} ${index + 1}`;
        const alt = getLocalizedValue(image, language, "alt") || title;

        return {
          id: image.id,
          src: image.image_url,
          title,
          alt,
          mediaType:
            image.media_type === "video" ||
            /\.(mp4|webm|mov)(?:$|\?)/i.test(image.image_url)
              ? "video"
              : "image",
        };
      });
    }

    return fallbackImages.map((src, index) => ({
      id: `fallback-${index}`,
      src,
      title: `${hotelTitle} ${index + 1}`,
      alt: `${hotelTitle} ${index + 1}`,
      mediaType: "image",
    }));
  }, [fallbackImages, hotelTitle, images, language]);

  if (normalizedImages.length === 0) return null;

  const previewImages = normalizedImages.slice(0, 4);
  const mainImage = previewImages[0];
  const smallImages = previewImages.slice(1, 4);

  const openImage = (index: number) => {
    const targetIndex = normalizedImages[index]?.mediaType === "video"
      ? normalizedImages.findIndex((image) => image.mediaType === "image")
      : index;
    if (targetIndex < 0) return;
    const imageIndex = normalizedImages.slice(0, targetIndex).filter((image) => image.mediaType === "image").length;
    setLightboxIndex(imageIndex);
    setLightboxOpen(true);
  };

  return (
    <section className="hotel-gallery-compact">
      <h2>{text.title}</h2>

      <div className="hotel-gallery-compact__content">
        {mainImage.mediaType === "video" ? (
          <video className="hotel-gallery-compact__main hotel-gallery-compact__video" src={mainImage.src} controls playsInline preload="metadata" />
        ) : (
          <button type="button" className="hotel-gallery-compact__main" onClick={() => openImage(0)} aria-label={mainImage.alt}>
            <img src={mainImage.src} alt={mainImage.alt} />
          </button>
        )}

        {smallImages.length > 0 && (
          <div className="hotel-gallery-compact__row">
            {smallImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => openImage(index + 1)}
                aria-label={image.alt}
              >
                {image.mediaType === "video" ? <video src={image.src} playsInline preload="metadata" /> : <img src={image.src} alt={image.alt} />}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          className="hotel-gallery-compact__all"
          onClick={() => openImage(0)}
        >
          {text.viewAll(normalizedImages.length)}
          <ChevronRight size={16} />
        </button>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={normalizedImages.filter((image) => image.mediaType === "image").map((image) => ({
          src: image.src,
          alt: image.alt,
          title: image.title,
        }))}
        on={{ view: ({ index }) => setLightboxIndex(index) }}
      />

      <style jsx>{`
        .hotel-gallery-compact {
          padding: 14px 18px 16px;
        }

        h2 {
          margin: 0 0 14px;
          color: #10233f;
          font-size: 18px;
          line-height: 1.25;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        button {
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
        }

        .hotel-gallery-compact__content {
          display: flex;
          flex-direction: column;
          margin-inline: 6px;
        }

        .hotel-gallery-compact__main {
          display: block;
          width: 100%;
          height: 238px;
          overflow: hidden;
          border-radius: 10px;
        }

        img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 240ms ease;
        }

        video { display:block;width:100%;height:100%;object-fit:cover;background:#08192d; }
        .hotel-gallery-compact__video { cursor:default; }

        .hotel-gallery-compact__main:hover img,
        .hotel-gallery-compact__row button:hover img {
          transform: scale(1.025);
        }

        .hotel-gallery-compact__row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-top: 8px;
        }

        .hotel-gallery-compact__row button {
          height: 126px;
          overflow: hidden;
          border-radius: 8px;
        }

        .hotel-gallery-compact__all {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 3px;
  margin-top: 18px;   /* vorher 6px */
  color: #079ca5;
  font-size: 12px;
  line-height: 1.4;
  font-weight: 600;
}

        @media (max-width: 720px) {
          .hotel-gallery-compact {
            padding: 14px 14px 16px;
          }

          .hotel-gallery-compact__content {
            margin-inline: 2px;
          }

          .hotel-gallery-compact__main {
            height: 220px;
          }

          .hotel-gallery-compact__row button {
            height: 88px;
          }
        }
      `}</style>
    </section>
  );
}
