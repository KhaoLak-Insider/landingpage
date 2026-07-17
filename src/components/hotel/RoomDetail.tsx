"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Bath,
  BedDouble,
  Check,
  ChevronLeft,
  ChevronRight,
  Expand,
  Maximize2,
  Users,
  Waves,
  X,
} from "lucide-react";
import type { Language } from "@/src/lib/i18n";
import { localizePath } from "@/src/lib/i18n-routing";

export interface RoomImage {
  url?: string | null;
  alt_de?: string | null;
  alt_en?: string | null;
}

export interface PremiumRoomDetail {
  id?: string;
  slug?: string;
  name_de?: string;
  name_en?: string;
  short_description_de?: string;
  short_description_en?: string;
  description_de?: string;
  description_en?: string;
  size_sqm?: number | string | null;
  max_adults?: number | string | null;
  max_children?: number | string | null;
  max_occupancy?: number | string | null;
  bed_type_de?: string;
  bed_type_en?: string;
  view_de?: string;
  view_en?: string;
  bathroom_de?: string;
  bathroom_en?: string;
  highlights_de?: unknown;
  highlights_en?: unknown;
  amenities_de?: unknown;
  amenities_en?: unknown;
  image_url?: string | null;
  images?: RoomImage[];
  sort_order?: number | string | null;
  status?: string | null;
  source_url?: string | null;
}

interface RoomDetailProps {
  room: PremiumRoomDetail;
  comparisonRooms?: PremiumRoomDetail[];
  hotelTitle: string;
  hotelSlug: string;
  language: Language;
  backHref: string;
  onClose?: () => void;
  modal?: boolean;
}

const labels = {
  de: {
    back: "Zurück zum Hotel",
    close: "Schließen",
    guests: "Bis zu",
    people: "Personen",
    highlights: "Zimmer-Highlights",
    description: "Über dieses Zimmer",
    amenities: "Komplette Ausstattung",
    compare: "Weitere Zimmer entdecken",
    compareSubtitle: "Vergleiche weitere Zimmerkategorien des Hotels.",
    viewRoom: "Zimmer ansehen",
    noImage: "Zimmerbild folgt",
    gallery: "Zimmergalerie",
    openImage: "Bild vergrößern",
  },
  en: {
    back: "Back to hotel",
    close: "Close",
    guests: "Up to",
    people: "guests",
    highlights: "Room highlights",
    description: "About this room",
    amenities: "Complete amenities",
    compare: "Discover more rooms",
    compareSubtitle: "Compare other room categories at the hotel.",
    viewRoom: "View room",
    noImage: "Room image coming soon",
    gallery: "Room gallery",
    openImage: "Enlarge image",
  },
} as const;

function localizedValue(
  room: PremiumRoomDetail,
  language: Language,
  field:
    | "name"
    | "short_description"
    | "description"
    | "bed_type"
    | "view"
    | "bathroom",
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

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function localizedArray(
  room: PremiumRoomDetail,
  language: Language,
  field: "highlights" | "amenities",
): string[] {
  const primary =
    language === "en"
      ? normalizeStringArray(room[`${field}_en`])
      : normalizeStringArray(room[`${field}_de`]);

  if (primary.length > 0) return primary;

  return language === "en"
    ? normalizeStringArray(room[`${field}_de`])
    : normalizeStringArray(room[`${field}_en`]);
}

function toPositiveNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getImages(
  room: PremiumRoomDetail,
  language: Language,
): Array<{ src: string; alt: string }> {
  const name = localizedValue(room, language, "name");

  const images = Array.isArray(room.images)
    ? room.images
        .filter(
          (image) =>
            typeof image?.url === "string" && image.url.trim() !== "",
        )
        .map((image) => ({
          src: image.url!.trim(),
          alt:
            language === "en"
              ? image.alt_en?.trim() || image.alt_de?.trim() || name
              : image.alt_de?.trim() || image.alt_en?.trim() || name,
        }))
    : [];

  if (
    images.length === 0 &&
    typeof room.image_url === "string" &&
    room.image_url.trim()
  ) {
    images.push({
      src: room.image_url.trim(),
      alt: name,
    });
  }

  return images;
}

function getOccupancy(room: PremiumRoomDetail): number | null {
  return toPositiveNumber(room.max_occupancy);
}

export default function RoomDetail({
  room,
  comparisonRooms = [],
  hotelTitle,
  hotelSlug,
  language,
  backHref,
  onClose,
  modal = false,
}: RoomDetailProps) {
  const copy = labels[language];
  const name = localizedValue(room, language, "name");
  const shortDescription = localizedValue(
    room,
    language,
    "short_description",
  );
  const description = localizedValue(room, language, "description");
  const bedType = localizedValue(room, language, "bed_type");
  const view = localizedValue(room, language, "view");
  const bathroom = localizedValue(room, language, "bathroom");
  const size = toPositiveNumber(room.size_sqm);
  const occupancy = getOccupancy(room);
  const highlights = localizedArray(room, language, "highlights");
  const amenities = localizedArray(room, language, "amenities");
  const images = getImages(room, language);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const safeImageIndex = selectedImageIndex < images.length ? selectedImageIndex : 0;
  const mainImage = images[safeImageIndex];

  function selectRelativeImage(direction: -1 | 1) {
    if (images.length < 2) return;
    setSelectedImageIndex((current) => (current + direction + images.length) % images.length);
  }

  const roomHref = (slug: string) =>
    localizePath(
      `/spot/${encodeURIComponent(hotelSlug)}/zimmer/${encodeURIComponent(slug)}`,
      language,
    );

  return (
    <article
      className={`room-detail${modal ? " room-detail--modal" : ""}`}
      aria-labelledby="room-detail-title"
    >
      <div className="room-detail__topbar">
        <Link href={backHref} className="room-detail__back">
          {copy.back} <span aria-hidden="true">←</span>
        </Link>

        {onClose && (
          <button
            type="button"
            className="room-detail__close"
            onClick={onClose}
            aria-label={copy.close}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="room-detail__hero">
        {mainImage ? (
          <Image
            src={mainImage.src}
            alt={mainImage.alt}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 1180px"
            className="room-detail__hero-image"
          />
        ) : (
          <div className="room-detail__placeholder">{copy.noImage}</div>
        )}

        <div className="room-detail__overlay" />

        {mainImage && (
          <button
            type="button"
            className="room-detail__expand"
            onClick={() => setIsLightboxOpen(true)}
            aria-label={copy.openImage}
          >
            <Expand size={17} />
          </button>
        )}

        {images.length > 1 && (
          <>
            <button type="button" className="room-detail__gallery-arrow room-detail__gallery-arrow--left" onClick={() => selectRelativeImage(-1)} aria-label="Vorheriges Bild">
              <ChevronLeft size={21} />
            </button>
            <button type="button" className="room-detail__gallery-arrow room-detail__gallery-arrow--right" onClick={() => selectRelativeImage(1)} aria-label="Nächstes Bild">
              <ChevronRight size={21} />
            </button>
          </>
        )}

        <div className="room-detail__hero-content">
          <span className="room-detail__eyebrow">{hotelTitle}</span>
          <h1 id="room-detail-title">{name}</h1>
          {shortDescription && <p>{shortDescription}</p>}
        </div>
      </div>

      {images.length > 1 && (
        <section className="room-detail__gallery" aria-label={copy.gallery}>
          {images.map((image, index) => (
            <button key={`${image.src}-${index}`} type="button" className={index === safeImageIndex ? "is-active" : ""} onClick={() => setSelectedImageIndex(index)}>
              <Image src={image.src} alt={image.alt} fill sizes="120px" />
            </button>
          ))}
        </section>
      )}

      {isLightboxOpen && mainImage && (
        <div className="room-detail__lightbox" role="dialog" aria-modal="true" aria-label={copy.gallery} onClick={() => setIsLightboxOpen(false)}>
          <button type="button" className="room-detail__lightbox-close" onClick={() => setIsLightboxOpen(false)} aria-label={copy.close}><X size={22} /></button>
          {images.length > 1 && <button type="button" className="room-detail__lightbox-arrow room-detail__lightbox-arrow--left" onClick={(event) => { event.stopPropagation(); selectRelativeImage(-1); }} aria-label="Vorheriges Bild"><ChevronLeft size={28} /></button>}
          <div className="room-detail__lightbox-image" onClick={(event) => event.stopPropagation()}>
            <Image src={mainImage.src} alt={mainImage.alt} fill sizes="95vw" />
          </div>
          {images.length > 1 && <button type="button" className="room-detail__lightbox-arrow room-detail__lightbox-arrow--right" onClick={(event) => { event.stopPropagation(); selectRelativeImage(1); }} aria-label="Nächstes Bild"><ChevronRight size={28} /></button>}
        </div>
      )}

      <div className="room-detail__content">
        <div className="room-detail__main">
          <div className="room-detail__facts">
            {size && (
              <div className="room-detail__fact">
                <Maximize2 size={18} />
                <span>{size} m²</span>
              </div>
            )}

            {occupancy && (
              <div className="room-detail__fact">
                <Users size={18} />
                <span>
                  {copy.guests} {occupancy} {copy.people}
                </span>
              </div>
            )}

            {bedType && (
              <div className="room-detail__fact">
                <BedDouble size={18} />
                <span>{bedType}</span>
              </div>
            )}

            {view && (
              <div className="room-detail__fact">
                <Waves size={18} />
                <span>{view}</span>
              </div>
            )}

            {bathroom && (
              <div className="room-detail__fact">
                <Bath size={18} />
                <span>{bathroom}</span>
              </div>
            )}
          </div>

          {description && (
            <section className="room-detail__section">
              <h2>{copy.description}</h2>
              <p>{description}</p>
            </section>
          )}

          {highlights.length > 0 && (
            <section className="room-detail__section">
              <h2>{copy.highlights}</h2>

              <div className="room-detail__highlights">
                {highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="room-detail__highlight"
                  >
                    <span aria-hidden="true">
                      <Check size={14} strokeWidth={2.5} />
                    </span>
                    <p>{highlight}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {amenities.length > 0 && (
            <section className="room-detail__section">
              <h2>{copy.amenities}</h2>

              <div className="room-detail__amenities">
                {amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="room-detail__amenity"
                  >
                    <Check size={15} strokeWidth={2.4} />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {comparisonRooms.length > 0 && (
          <aside className="room-detail__aside">
            <div className="room-detail__compare-card">
              <h2>{copy.compare}</h2>
              <p>{copy.compareSubtitle}</p>

              <div className="room-detail__compare-list">
                {comparisonRooms.slice(0, 3).map((comparisonRoom) => {
                  const comparisonSlug =
                    typeof comparisonRoom.slug === "string"
                      ? comparisonRoom.slug.trim()
                      : "";

                  if (!comparisonSlug) return null;

                  const comparisonName = localizedValue(
                    comparisonRoom,
                    language,
                    "name",
                  );
                  const comparisonSize = toPositiveNumber(
                    comparisonRoom.size_sqm,
                  );
                  const comparisonView = localizedValue(
                    comparisonRoom,
                    language,
                    "view",
                  );
                  const comparisonImages = getImages(
                    comparisonRoom,
                    language,
                  );
                  const comparisonImage = comparisonImages[0];

                  return (
                    <Link
                      key={comparisonRoom.id || comparisonSlug}
                      href={roomHref(comparisonSlug)}
                      className="room-detail__compare-item"
                    >
                      <div className="room-detail__compare-image">
                        {comparisonImage ? (
                          <Image
                            src={comparisonImage.src}
                            alt={comparisonImage.alt}
                            fill
                            sizes="84px"
                            className="room-detail__compare-photo"
                          />
                        ) : (
                          <span>{copy.noImage}</span>
                        )}
                      </div>

                      <div className="room-detail__compare-copy">
                        <strong>{comparisonName}</strong>

                        <div>
                          {comparisonSize && <span>{comparisonSize} m²</span>}
                          {comparisonSize && comparisonView && <i>•</i>}
                          {comparisonView && <span>{comparisonView}</span>}
                        </div>

                        <small>
                          {copy.viewRoom} <span aria-hidden="true">→</span>
                        </small>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        )}
      </div>

      <style jsx>{`
        .room-detail {
          width: 100%;
          min-height: 100vh;
          padding: 24px 40px 72px;
          background: #ffffff;
          color: #10233f;
          font-family: "Poppins", sans-serif;
        }

        .room-detail--modal {
          min-height: 0;
          padding: 0;
        }

        .room-detail__topbar {
          display: flex;
          max-width: 1180px;
          margin: 0 auto 16px;
          align-items: center;
          justify-content: space-between;
        }

        .room-detail__back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #43536a;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
        }

        .room-detail__back span {
          display: inline-block;
          line-height: 1;
          transition: transform 180ms ease;
        }

        .room-detail__back:hover {
          color: #079ca5;
        }

        .room-detail__back:hover span {
          transform: translateX(-3px);
        }

        .room-detail__close {
          display: inline-flex;
          width: 38px;
          height: 38px;
          align-items: center;
          justify-content: center;
          border: 1px solid #e5ebef;
          border-radius: 999px;
          background: #ffffff;
          color: #10233f;
          cursor: pointer;
        }

        .room-detail__hero {
          position: relative;
          max-width: 1180px;
          height: min(62vh, 650px);
          min-height: 430px;
          margin: 0 auto;
          overflow: hidden;
          border-radius: 20px;
          background: #edf4f4;
        }

        .room-detail__hero-image {
          object-fit: cover;
        }

        .room-detail__expand,.room-detail__gallery-arrow{position:absolute;z-index:3;display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.35);background:rgba(8,25,45,.55);color:#fff;backdrop-filter:blur(8px);cursor:pointer}.room-detail__expand{top:18px;right:18px;width:40px;height:40px;border-radius:11px}.room-detail__gallery-arrow{top:50%;width:42px;height:42px;border-radius:999px;transform:translateY(-50%)}.room-detail__gallery-arrow--left{left:18px}.room-detail__gallery-arrow--right{right:18px}.room-detail__expand:hover,.room-detail__gallery-arrow:hover{background:rgba(7,156,165,.9)}

        .room-detail__gallery{display:flex;max-width:1180px;gap:10px;margin:12px auto 0;overflow-x:auto;padding:2px 1px 5px}.room-detail__gallery button{position:relative;width:118px;min-width:118px;aspect-ratio:4/3;overflow:hidden;padding:0;border:2px solid transparent;border-radius:11px;background:#edf4f4;cursor:pointer;opacity:.72}.room-detail__gallery button.is-active{border-color:#079ca5;opacity:1;box-shadow:0 0 0 2px rgba(7,156,165,.12)}.room-detail__gallery :global(img){object-fit:cover}

        .room-detail__lightbox{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:30px;background:rgba(3,12,22,.94);backdrop-filter:blur(10px)}.room-detail__lightbox-image{position:relative;width:min(1200px,88vw);height:min(820px,86vh)}.room-detail__lightbox-image :global(img){object-fit:contain}.room-detail__lightbox-close,.room-detail__lightbox-arrow{position:absolute;z-index:2;display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.1);color:#fff;cursor:pointer}.room-detail__lightbox-close{top:20px;right:20px;width:44px;height:44px;border-radius:999px}.room-detail__lightbox-arrow{top:50%;width:48px;height:48px;border-radius:999px;transform:translateY(-50%)}.room-detail__lightbox-arrow--left{left:22px}.room-detail__lightbox-arrow--right{right:22px}.room-detail__lightbox-close:hover,.room-detail__lightbox-arrow:hover{background:#079ca5}

        .room-detail__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(8, 25, 45, 0.78) 0%,
            rgba(8, 25, 45, 0.24) 52%,
            rgba(8, 25, 45, 0.04) 100%
          );
        }

        .room-detail__placeholder {
          display: flex;
          width: 100%;
          height: 100%;
          align-items: center;
          justify-content: center;
          color: #7f929f;
          font-size: 13px;
          font-weight: 600;
        }

        .room-detail__hero-content {
          position: absolute;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 1;
          max-width: 760px;
          padding: 42px;
          color: #ffffff;
        }

        .room-detail__eyebrow {
          display: block;
          margin-bottom: 9px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .room-detail__hero-content h1 {
          margin: 0;
          font-size: clamp(30px, 4.2vw, 54px);
          line-height: 1.08;
          letter-spacing: -0.04em;
        }

        .room-detail__hero-content p {
          max-width: 680px;
          margin: 14px 0 0;
          font-size: 14px;
          line-height: 1.7;
        }

        .room-detail__content {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 330px;
          gap: 42px;
          max-width: 1100px;
          margin: 38px auto 0;
          align-items: start;
        }

        .room-detail__main {
          min-width: 0;
        }

        .room-detail__facts {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .room-detail__fact {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 13px;
          border: 1px solid #e3ecee;
          border-radius: 999px;
          background: #f7fbfb;
          color: #35465d;
          font-size: 11px;
          font-weight: 600;
        }

        .room-detail__fact :global(svg) {
          color: #0f8f91;
        }

        .room-detail__section {
          margin-top: 36px;
        }

        .room-detail__section h2,
        .room-detail__compare-card h2 {
          margin: 0;
          font-size: 20px;
          line-height: 1.3;
          letter-spacing: -0.025em;
        }

        .room-detail__section > p {
          margin: 13px 0 0;
          color: #516176;
          font-size: 14px;
          line-height: 1.8;
        }

        .room-detail__highlights {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 16px;
        }

        .room-detail__highlight {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 14px;
          border: 1px solid #e8edf2;
          border-radius: 12px;
          background: #ffffff;
        }

        .room-detail__highlight > span {
          display: inline-flex;
          width: 24px;
          height: 24px;
          flex: 0 0 24px;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #dff7f6;
          color: #0da6a6;
        }

        .room-detail__highlight p {
          margin: 0;
          color: #35465d;
          font-size: 12px;
          font-weight: 600;
        }

        .room-detail__amenities {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px 24px;
          margin-top: 18px;
          padding: 22px;
          border: 1px solid #e8edf2;
          border-radius: 16px;
          background: #fbfdfd;
        }

        .room-detail__amenity {
          display: flex;
          min-width: 0;
          align-items: flex-start;
          gap: 9px;
          color: #43536a;
          font-size: 12px;
          line-height: 1.55;
        }

        .room-detail__amenity :global(svg) {
          flex: 0 0 auto;
          margin-top: 2px;
          color: #0f9ca3;
        }

        .room-detail__aside {
          position: sticky;
          top: 92px;
        }

        .room-detail__compare-card {
          padding: 22px;
          border: 1px solid #e5ebef;
          border-radius: 16px;
          background: #ffffff;
          box-shadow: 0 12px 34px rgba(15, 35, 62, 0.07);
        }

        .room-detail__compare-card > p {
          margin: 8px 0 0;
          color: #718096;
          font-size: 11px;
          line-height: 1.6;
        }

        .room-detail__compare-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 18px;
        }

        .room-detail__compare-item {
          display: grid;
          grid-template-columns: 84px minmax(0, 1fr);
          gap: 12px;
          padding: 10px;
          border: 1px solid #e8edf2;
          border-radius: 13px;
          color: inherit;
          text-decoration: none;
          transition:
            transform 180ms ease,
            border-color 180ms ease,
            box-shadow 180ms ease;
        }

        .room-detail__compare-item:hover {
          transform: translateY(-1px);
          border-color: #d4e3e6;
          box-shadow: 0 8px 22px rgba(15, 35, 62, 0.07);
        }

        .room-detail__compare-image {
          position: relative;
          min-height: 78px;
          overflow: hidden;
          border-radius: 10px;
          background: #edf4f4;
        }

        .room-detail__compare-image > span {
          display: flex;
          width: 100%;
          height: 100%;
          align-items: center;
          justify-content: center;
          padding: 8px;
          color: #7f929f;
          font-size: 8px;
          text-align: center;
        }

        .room-detail__compare-photo {
          object-fit: cover;
        }

        .room-detail__compare-copy {
          display: flex;
          min-width: 0;
          flex-direction: column;
          justify-content: center;
        }

        .room-detail__compare-copy strong {
          color: #10233f;
          font-size: 12px;
          line-height: 1.35;
        }

        .room-detail__compare-copy > div {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 5px;
          margin-top: 5px;
          color: #68778a;
          font-size: 9px;
          line-height: 1.4;
        }

        .room-detail__compare-copy > div i {
          font-style: normal;
        }

        .room-detail__compare-copy small {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 8px;
          color: #078f98;
          font-size: 9px;
          font-weight: 700;
        }

        @media (max-width: 900px) {
          .room-detail__content {
            grid-template-columns: 1fr;
          }

          .room-detail__aside {
            position: static;
          }
        }

        @media (max-width: 620px) {
          .room-detail {
            padding: 14px 14px 48px;
          }

          .room-detail__hero {
            min-height: 470px;
            border-radius: 16px;
          }

          .room-detail__gallery{margin-top:8px}.room-detail__gallery button{width:88px;min-width:88px}.room-detail__gallery-arrow{width:36px;height:36px}.room-detail__gallery-arrow--left{left:10px}.room-detail__gallery-arrow--right{right:10px}.room-detail__expand{top:10px;right:10px}.room-detail__lightbox{padding:12px}.room-detail__lightbox-image{width:100%;height:80vh}.room-detail__lightbox-arrow{width:40px;height:40px}.room-detail__lightbox-arrow--left{left:8px}.room-detail__lightbox-arrow--right{right:8px}

          .room-detail__hero-content {
            padding: 24px;
          }

          .room-detail__hero-content p {
            font-size: 12px;
          }

          .room-detail__content {
            gap: 24px;
            margin-top: 24px;
          }

          .room-detail__highlights,
          .room-detail__amenities {
            grid-template-columns: 1fr;
          }

          .room-detail__amenities {
            padding: 18px;
          }
        }
      `}</style>
    </article>
  );
}
