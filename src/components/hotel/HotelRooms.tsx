"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  ImageIcon,
  Maximize2,
  Users,
  Waves,
} from "lucide-react";
import type { Language } from "@/src/lib/i18n";

interface RoomImage {
  url?: string | null;
  alt_de?: string | null;
  alt_en?: string | null;
}

interface PremiumRoom {
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
  sort_order?: number | string | null;
  status?: string | null;
}

interface HotelRoomsProps {
  roomsData: unknown;
  hotelSlug: string;
  language: Language;
  localizedHref: (path: string) => string;
}

const labels = {
  de: {
    title: "Zimmer & Villen",
    subtitle:
      "Ausgewählte Unterkunftskategorien mit den wichtigsten Merkmalen im Überblick.",
    guests: "Bis zu",
    people: "Personen",
    viewRoom: "Zimmer ansehen",
    viewAll: "Alle Zimmer ansehen",
    noImage: "Zimmerbild folgt",
  },
  en: {
    title: "Rooms & villas",
    subtitle:
      "Selected accommodation categories and their key features at a glance.",
    guests: "Up to",
    people: "guests",
    viewRoom: "View room",
    viewAll: "View all rooms",
    noImage: "Room image coming soon",
  },
} as const;

function isPremiumRoom(value: unknown): value is PremiumRoom {
  return typeof value === "object" && value !== null;
}

function normalizeRooms(value: unknown): PremiumRoom[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isPremiumRoom)
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

function localizedValue(
  room: PremiumRoom,
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

function toPositiveNumber(value: unknown): number | null {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function getRoomImage(
  room: PremiumRoom,
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

export default function HotelRooms({
  roomsData,
  hotelSlug,
  language,
  localizedHref,
}: HotelRoomsProps) {
  const copy = labels[language];
  const rooms = normalizeRooms(roomsData);
  const featuredRooms = rooms.slice(0, 3);

  if (featuredRooms.length === 0) {
    return null;
  }

  return (
    <section className="hotel-rooms-preview">
      <header className="hotel-rooms-preview__header">
        <div>
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>
      </header>

      <div className="hotel-rooms-preview__list">
        {featuredRooms.map((room, index) => {
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

          const occupancy = toPositiveNumber(room.max_occupancy);

          const image = getRoomImage(room, language);

          const roomHref = localizedHref(
            `/spot/${encodeURIComponent(hotelSlug)}/zimmer/${encodeURIComponent(
              slug,
            )}`,
          );

          return (
            <article
              className="hotel-rooms-preview__card"
              key={room.id || slug}
            >
              <Link
                href={roomHref}
                className="hotel-rooms-preview__image-link"
                aria-label={`${copy.viewRoom}: ${name}`}
              >
                <div className="hotel-rooms-preview__image-frame">
                  {image ? (
                    <>
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 560px) 100vw, (max-width: 900px) 42vw, 245px"
                        className="hotel-rooms-preview__image"
                      />
                      <span className="hotel-rooms-preview__image-shade" />
                    </>
                  ) : (
                    <span className="hotel-rooms-preview__placeholder">
                      <ImageIcon size={24} />
                      {copy.noImage}
                    </span>
                  )}
                </div>
              </Link>

              <div className="hotel-rooms-preview__body">
                <div className="hotel-rooms-preview__content">
                  <h3>{name}</h3>

                  {description && <p>{description}</p>}

                  <div className="hotel-rooms-preview__facts">
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
                </div>

                <div className="hotel-rooms-preview__footer">
                  <Link
                    href={roomHref}
                    className="hotel-rooms-preview__cta"
                    aria-label={`${copy.viewRoom}: ${name}`}
                  >
                    {copy.viewRoom} <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <Link
        href={localizedHref(
          `/spot/${encodeURIComponent(hotelSlug)}/zimmer`,
        )}
        className="hotel-rooms-preview__all"
      >
        {copy.viewAll} <span aria-hidden="true">→</span>
      </Link>

      <style jsx>{`
        .hotel-rooms-preview {
          padding: 18px;
        }

        .hotel-rooms-preview__header {
          margin: 8px 0 16px 8px;
        }

        h2 {
          margin: 0;
          color: #10233f;
          font-size: 18px;
          line-height: 1.3;
          font-weight: 700;
          letter-spacing: -0.025em;
        }

        .hotel-rooms-preview__header p {
          max-width: 620px;
          margin: 5px 0 0;
          color: #66768a;
          font-size: 11px;
          line-height: 1.55;
        }

        .hotel-rooms-preview__list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .hotel-rooms-preview__card {
          display: grid;
          grid-template-columns: 245px minmax(0, 1fr);
          min-height: 174px;
          overflow: hidden;
          border: 1px solid #e5ebef;
          border-radius: 16px;
          background: #ffffff;
          box-shadow: 0 6px 20px rgba(15, 35, 62, 0.035);
          transition:
            transform 200ms ease,
            box-shadow 200ms ease,
            border-color 200ms ease;
        }

        .hotel-rooms-preview__card:hover {
          transform: translateY(-2px);
          border-color: #d4e3e6;
          box-shadow: 0 16px 34px rgba(15, 35, 62, 0.09);
        }

        .hotel-rooms-preview__image-link {
          display: block;
          min-width: 0;
          height: 100%;
          color: inherit;
          text-decoration: none;
        }

        .hotel-rooms-preview__image-frame {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 174px;
          overflow: hidden;
          border-radius: 14px 0 0 14px;
          background: #edf4f4;
        }

        .hotel-rooms-preview__image {
          object-fit: cover;
          transition: transform 420ms ease;
        }

        .hotel-rooms-preview__card:hover .hotel-rooms-preview__image {
          transform: scale(1.03);
        }

        .hotel-rooms-preview__image-shade {
          position: absolute;
          inset: auto 0 0;
          height: 44%;
          pointer-events: none;
          background: linear-gradient(
            to top,
            rgba(9, 26, 47, 0.22),
            rgba(9, 26, 47, 0)
          );
        }

        .hotel-rooms-preview__placeholder {
          display: flex;
          width: 100%;
          height: 100%;
          min-height: 174px;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 8px;
          color: #7f929f;
          font-size: 10px;
          font-weight: 600;
        }

        .hotel-rooms-preview__body {
          display: flex;
          min-width: 0;
          flex-direction: column;
          justify-content: space-between;
          padding: 19px 20px 17px;
        }

        .hotel-rooms-preview__content {
          min-width: 0;
        }

        h3 {
          margin: 0;
          color: #10233f;
          font-size: 16px;
          line-height: 1.3;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .hotel-rooms-preview__body p {
          display: -webkit-box;
          margin: 8px 0 0;
          overflow: hidden;
          color: #66768a;
          font-size: 13px;
          line-height: 1.65;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .hotel-rooms-preview__facts {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 20px;
        }

        .hotel-rooms-preview__facts span {
          display: inline-flex;
          min-width: 0;
          align-items: center;
          gap: 5px;
          padding: 6px 9px;
          border: 1px solid #e3ecee;
          border-radius: 999px;
          background: #f7fbfb;
          color: #43536a;
          font-size: 9px;
          line-height: 1.2;
          font-weight: 650;
          white-space: nowrap;
        }

        .hotel-rooms-preview__facts span :global(svg) {
          flex: 0 0 auto;
          color: #0f8f91;
        }

        .hotel-rooms-preview__footer {
          display: flex;
          justify-content: flex-end;
          margin-top: 14px;
        }

        .hotel-rooms-preview__cta {
          display: inline-flex !important;
          align-items: center;
          flex-wrap: nowrap;
          flex-shrink: 0;
          gap: 6px;
          color: #078f98;
          font-size: 10px;
          line-height: 1.3;
          font-weight: 750;
          text-decoration: none;
          white-space: nowrap;
        }

        .hotel-rooms-preview__cta span {
          display: inline;
          flex: 0 0 auto;
          font-size: 14px;
          line-height: 1;
          transition: transform 180ms ease;
        }

        .hotel-rooms-preview__cta:hover {
          color: #056d75;
        }

        .hotel-rooms-preview__cta:hover span {
          transform: translateX(3px);
        }

        .hotel-rooms-preview__all {
          display: inline-flex !important;
          align-items: center;
          flex-wrap: nowrap;
          gap: 6px;
          margin-top: 14px;
          color: #079ca5;
          font-size: 10px;
          line-height: 1.4;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
        }

        .hotel-rooms-preview__all span {
          display: inline;
          flex: 0 0 auto;
          font-size: 14px;
          line-height: 1;
          transition: transform 180ms ease;
        }

        .hotel-rooms-preview__all:hover {
          text-decoration: underline;
        }

        .hotel-rooms-preview__all:hover span {
          transform: translateX(3px);
        }

        @media (max-width: 820px) {
          .hotel-rooms-preview__card {
            grid-template-columns: 205px minmax(0, 1fr);
          }
        }

        @media (max-width: 620px) {
          .hotel-rooms-preview {
            padding: 14px;
          }

          .hotel-rooms-preview__header {
            margin-left: 4px;
          }

          .hotel-rooms-preview__card {
            grid-template-columns: 1fr;
            border-radius: 14px;
          }

          .hotel-rooms-preview__image-frame,
          .hotel-rooms-preview__placeholder {
            min-height: 220px;
          }

          .hotel-rooms-preview__image-frame {
            border-radius: 14px 14px 0 0;
          }

          .hotel-rooms-preview__body {
            padding: 16px;
          }

          .hotel-rooms-preview__footer {
            justify-content: flex-start;
          }
        }
      `}</style>
    </section>
  );
}
