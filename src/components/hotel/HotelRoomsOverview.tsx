"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BedDouble,
  ImageIcon,
  Maximize2,
  Users,
  Waves,
} from "lucide-react";
import type { Language } from "@/src/lib/i18n";
import { localizePath } from "@/src/lib/i18n-routing";

interface RoomImage {
  url?: string | null;
  alt_de?: string | null;
  alt_en?: string | null;
}

export interface PremiumRoomOverview {
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
  image_url?: string | null;
  images?: RoomImage[];
  highlights_de?: unknown;
  highlights_en?: unknown;
  sort_order?: number | string | null;
  status?: string | null;
}

interface HotelRoomsOverviewProps {
  rooms: PremiumRoomOverview[];
  hotelTitle: string;
  hotelSlug: string;
  language: Language;
  backHref: string;
}

const labels = {
  de: {
    eyebrow: "Zimmer & Villen",
    title: "Alle Zimmer im Überblick",
    subtitle:
      "Vergleiche die verfügbaren Zimmerkategorien und finde die passende Unterkunft für deinen Aufenthalt.",
    back: "Zurück zum Hotel",
    guests: "Bis zu",
    people: "Personen",
    viewRoom: "Zimmer ansehen",
    noImage: "Zimmerbild folgt",
  },
  en: {
    eyebrow: "Rooms & villas",
    title: "All rooms at a glance",
    subtitle:
      "Compare the available room categories and find the right accommodation for your stay.",
    back: "Back to hotel",
    guests: "Up to",
    people: "guests",
    viewRoom: "View room",
    noImage: "Room image coming soon",
  },
} as const;

function localizedValue(
  room: PremiumRoomOverview,
  language: Language,
  field:
    | "name"
    | "short_description"
    | "description"
    | "bed_type"
    | "view",
): string {
  const primary =
    language === "en" ? room[`${field}_en`] : room[`${field}_de`];

  const fallback =
    language === "en" ? room[`${field}_de`] : room[`${field}_en`];

  if (typeof primary === "string" && primary.trim()) {
    return primary.trim();
  }

  if (typeof fallback === "string" && fallback.trim()) {
    return fallback.trim();
  }

  return "";
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function toPositiveNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getRoomImage(
  room: PremiumRoomOverview,
  language: Language,
): { src: string; alt: string } | null {
  const firstImage = Array.isArray(room.images)
    ? room.images.find(
        (image) =>
          typeof image?.url === "string" && image.url.trim() !== "",
      )
    : undefined;

  const src =
    firstImage?.url?.trim() ||
    (typeof room.image_url === "string" ? room.image_url.trim() : "");

  if (!src) {
    return null;
  }

  const name = localizedValue(room, language, "name");

  const alt =
    language === "en"
      ? firstImage?.alt_en?.trim() || firstImage?.alt_de?.trim() || name
      : firstImage?.alt_de?.trim() || firstImage?.alt_en?.trim() || name;

  return {
    src,
    alt: alt || name,
  };
}

export default function HotelRoomsOverview({
  rooms,
  hotelTitle,
  hotelSlug,
  language,
  backHref,
}: HotelRoomsOverviewProps) {
  const copy = labels[language];

  return (
    <main className="rooms-overview">
      <div className="rooms-overview__shell">
        <Link href={backHref} className="rooms-overview__back">
          {copy.back} <span aria-hidden="true">←</span>
        </Link>

        <header className="rooms-overview__header">
          <span className="rooms-overview__eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>
            {copy.subtitle} <strong>{hotelTitle}</strong>
          </p>
        </header>

        <div className="rooms-overview__list">
          {rooms.map((room, index) => {
            const slug =
              typeof room.slug === "string" && room.slug.trim()
                ? room.slug.trim()
                : `room-${index + 1}`;

            const name =
              localizedValue(room, language, "name") || `Room ${index + 1}`;

            const description =
              localizedValue(room, language, "short_description") ||
              localizedValue(room, language, "description");

            const view = localizedValue(room, language, "view");
            const bedType = localizedValue(room, language, "bed_type");
            const size = toPositiveNumber(room.size_sqm);

            const occupancy =
              toPositiveNumber(room.max_occupancy) ||
              ((toPositiveNumber(room.max_adults) || 0) +
                (toPositiveNumber(room.max_children) || 0) ||
                null);

            const highlights =
              language === "en"
                ? normalizeStringArray(room.highlights_en).length > 0
                  ? normalizeStringArray(room.highlights_en)
                  : normalizeStringArray(room.highlights_de)
                : normalizeStringArray(room.highlights_de).length > 0
                  ? normalizeStringArray(room.highlights_de)
                  : normalizeStringArray(room.highlights_en);

            const image = getRoomImage(room, language);

            const roomHref = localizePath(
              `/spot/${encodeURIComponent(hotelSlug)}/zimmer/${encodeURIComponent(slug)}`,
              language,
            );

            return (
              <article
                key={room.id || slug}
                className="rooms-overview__card"
              >
                <Link
                  href={roomHref}
                  className="rooms-overview__image-link"
                  aria-label={`${copy.viewRoom}: ${name}`}
                >
                  <div className="rooms-overview__image-frame">
                    {image ? (
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 720px) 100vw, 320px"
                        className="rooms-overview__image"
                      />
                    ) : (
                      <span className="rooms-overview__placeholder">
                        <ImageIcon size={26} />
                        {copy.noImage}
                      </span>
                    )}
                  </div>
                </Link>

                <div className="rooms-overview__body">
                  <div>
                    <h2>{name}</h2>

                    {description && <p>{description}</p>}

                    <div className="rooms-overview__facts">
                      {size && (
                        <span>
                          <Maximize2 size={14} />
                          {size} m²
                        </span>
                      )}

                      {occupancy && (
                        <span>
                          <Users size={14} />
                          {copy.guests} {occupancy} {copy.people}
                        </span>
                      )}

                      {bedType && (
                        <span>
                          <BedDouble size={14} />
                          {bedType}
                        </span>
                      )}

                      {view && (
                        <span>
                          <Waves size={14} />
                          {view}
                        </span>
                      )}
                    </div>

                    {highlights.length > 0 && (
                      <div className="rooms-overview__highlights">
                        {highlights.map((highlight) => (
                          <span key={highlight}>{highlight}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rooms-overview__footer">
                    <Link href={roomHref}>
                      {copy.viewRoom} <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .rooms-overview {
          min-height: 100vh;
          padding: 28px 40px 72px;
          background: #ffffff;
          color: #10233f;
          font-family: "Poppins", sans-serif;
        }

        .rooms-overview__shell {
          max-width: 1180px;
          margin: 0 auto;
        }

        .rooms-overview__back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #43536a;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
        }

        .rooms-overview__back span {
          transition: transform 180ms ease;
        }

        .rooms-overview__back:hover {
          color: #079ca5;
        }

        .rooms-overview__back:hover span {
          transform: translateX(-3px);
        }

        .rooms-overview__header {
          max-width: 760px;
          margin: 34px 0 30px;
        }

        .rooms-overview__eyebrow {
          display: block;
          margin-bottom: 8px;
          color: #0f8f91;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .rooms-overview__header h1 {
          margin: 0;
          font-size: clamp(30px, 4.5vw, 48px);
          line-height: 1.08;
          letter-spacing: -0.04em;
        }

        .rooms-overview__header p {
          margin: 14px 0 0;
          color: #66768a;
          font-size: 14px;
          line-height: 1.75;
        }

        .rooms-overview__list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .rooms-overview__card {
          display: grid;
          grid-template-columns: 320px minmax(0, 1fr);
          min-height: 230px;
          overflow: hidden;
          border: 1px solid #e5ebef;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 8px 24px rgba(15, 35, 62, 0.04);
          transition:
            transform 200ms ease,
            box-shadow 200ms ease,
            border-color 200ms ease;
        }

        .rooms-overview__card:hover {
          transform: translateY(-2px);
          border-color: #d4e3e6;
          box-shadow: 0 16px 36px rgba(15, 35, 62, 0.09);
        }

        .rooms-overview__image-link {
          display: block;
          min-width: 0;
          height: 100%;
          color: inherit;
          text-decoration: none;
        }

        .rooms-overview__image-frame {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 230px;
          overflow: hidden;
          background: #edf4f4;
        }

        .rooms-overview__image {
          object-fit: cover;
          transition: transform 420ms ease;
        }

        .rooms-overview__card:hover .rooms-overview__image {
          transform: scale(1.03);
        }

        .rooms-overview__placeholder {
          display: flex;
          width: 100%;
          height: 100%;
          min-height: 230px;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 8px;
          color: #7f929f;
          font-size: 10px;
          font-weight: 600;
        }

        .rooms-overview__body {
          display: flex;
          min-width: 0;
          flex-direction: column;
          justify-content: space-between;
          padding: 24px 26px 22px;
        }

        .rooms-overview__body h2 {
          margin: 0;
          color: #10233f;
          font-size: 20px;
          line-height: 1.3;
          letter-spacing: -0.025em;
        }

        .rooms-overview__body p {
          max-width: 760px;
          margin: 9px 0 0;
          color: #66768a;
          font-size: 13px;
          line-height: 1.7;
        }

        .rooms-overview__facts {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 18px;
        }

        .rooms-overview__facts span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          border: 1px solid #e3ecee;
          border-radius: 999px;
          background: #f7fbfb;
          color: #43536a;
          font-size: 10px;
          font-weight: 650;
        }

        .rooms-overview__facts span :global(svg) {
          color: #0f8f91;
        }

        .rooms-overview__highlights {
          display: flex;
          flex-wrap: wrap;
          gap: 7px 14px;
          margin-top: 18px;
        }

        .rooms-overview__highlights span {
          position: relative;
          padding-left: 12px;
          color: #5f6f82;
          font-size: 11px;
          line-height: 1.45;
        }

        .rooms-overview__highlights span::before {
          position: absolute;
          top: 0.62em;
          left: 0;
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: #0f9ca3;
          content: "";
        }

        .rooms-overview__footer {
          display: flex;
          justify-content: flex-end;
          margin-top: 18px;
        }

        .rooms-overview__footer a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #078f98;
          font-size: 11px;
          font-weight: 750;
          text-decoration: none;
          white-space: nowrap;
        }

        .rooms-overview__footer a span {
          transition: transform 180ms ease;
        }

        .rooms-overview__footer a:hover span {
          transform: translateX(3px);
        }

        @media (max-width: 820px) {
          .rooms-overview__card {
            grid-template-columns: 250px minmax(0, 1fr);
          }
        }

        @media (max-width: 680px) {
          .rooms-overview {
            padding: 18px 14px 48px;
          }

          .rooms-overview__header {
            margin: 28px 0 22px;
          }

          .rooms-overview__card {
            grid-template-columns: 1fr;
          }

          .rooms-overview__image-frame,
          .rooms-overview__placeholder {
            min-height: 230px;
          }

          .rooms-overview__body {
            padding: 20px;
          }

          .rooms-overview__footer {
            justify-content: flex-start;
          }
        }
      `}</style>
    </main>
  );
}
