"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import type { Language } from "@/src/lib/i18n";
import { getLocalizedField } from "@/src/lib/spot/localization";

interface HotelNearbyProps {
  spots: any[];
  originLatitude: number;
  originLongitude: number;
  language: Language;
  localizedHref: (path: string) => string;
  maxItems?: number;
}

const labels = {
  de: {
    eyebrow: "Rund um das Hotel",
    title: "In der Nähe entdecken",
    subtitle:
      "Restaurants, Strände, Märkte und Sehenswürdigkeiten rund um das Hotel.",
    distanceMeters: "{distance} m entfernt",
    distanceKilometers: "{distance} km entfernt",
    previous: "Vorherige Orte anzeigen",
    next: "Weitere Orte anzeigen",
    noImage: "Bild folgt",
  },
  en: {
    eyebrow: "Around the hotel",
    title: "Discover nearby",
    subtitle:
      "Restaurants, beaches, markets and attractions close to the hotel.",
    distanceMeters: "{distance} m away",
    distanceKilometers: "{distance} km away",
    previous: "Show previous places",
    next: "Show more places",
    noImage: "Image coming soon",
  },
} as const;

const categoryPriority = [
  "restaurant",
  "restaurants",
  "strandbar",
  "strandbars",
  "bar",
  "bars",
  "strand",
  "straende",
  "beach",
  "beaches",
  "markt",
  "maerkte",
  "market",
  "markets",
  "sehenswuerdigkeit",
  "sehenswuerdigkeiten",
  "attraction",
  "attractions",
  "tempel",
  "temple",
  "natur",
  "nature",
];

function normalizeCategory(value: unknown): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number | null {
  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lon1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lon2)
  ) {
    return null;
  }

  const earthRadiusKm = 6371;
  const latitudeDifference = (lat2 - lat1) * (Math.PI / 180);
  const longitudeDifference = (lon2 - lon1) * (Math.PI / 180);

  const value =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(longitudeDifference / 2) ** 2;

  return (
    earthRadiusKm *
    2 *
    Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
  );
}

function formatDistance(
  distanceKm: number | null,
  language: Language,
): string {
  if (distanceKm === null) {
    return "";
  }

  const copy = labels[language];

  if (distanceKm < 1) {
    return copy.distanceMeters.replace(
      "{distance}",
      String(Math.max(1, Math.round(distanceKm * 1000))),
    );
  }

  return copy.distanceKilometers.replace(
    "{distance}",
    distanceKm.toFixed(1).replace(".", language === "de" ? "," : "."),
  );
}

export default function HotelNearby({
  spots,
  originLatitude,
  originLongitude,
  language,
  localizedHref,
  maxItems = 12,
}: HotelNearbyProps) {
  const copy = labels[language];
  const scrollRef = useRef<HTMLDivElement>(null);

  const preparedSpots = useMemo(() => {
    return spots
      .map((spot) => {
        const distanceKm = calculateDistanceKm(
          originLatitude,
          originLongitude,
          Number(spot.latitude),
          Number(spot.longitude),
        );

        const normalizedCategory = normalizeCategory(spot.category);
        const priorityIndex = categoryPriority.indexOf(normalizedCategory);

        return {
          spot,
          distanceKm,
          priorityIndex:
            priorityIndex === -1
              ? categoryPriority.length
              : priorityIndex,
        };
      })
      .filter(({ spot }) => spot?.slug)
      .sort((first, second) => {
        const distanceDifference =
          (first.distanceKm ?? Number.POSITIVE_INFINITY) -
          (second.distanceKm ?? Number.POSITIVE_INFINITY);

        if (distanceDifference !== 0) {
          return distanceDifference;
        }

        return first.priorityIndex - second.priorityIndex;
      })
      .slice(0, maxItems);
  }, [
    spots,
    originLatitude,
    originLongitude,
    maxItems,
  ]);

  if (preparedSpots.length === 0) {
    return null;
  }

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const cards = Array.from(
      container.children,
    ) as HTMLElement[];

    if (cards.length === 0) {
      return;
    }

    const cardStep =
      cards.length > 1
        ? cards[1].offsetLeft - cards[0].offsetLeft
        : cards[0].offsetWidth;

    const visibleCards =
      container.clientWidth >= 900
        ? 3
        : container.clientWidth >= 620
          ? 2
          : 1;

    const distance = cardStep * visibleCards;

    container.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  return (
    <section className="hotel-nearby">
      <header className="hotel-nearby__header">
        <div>
          <span className="hotel-nearby__eyebrow">
            <MapPin size={14} />
            {copy.eyebrow}
          </span>

          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>

        {preparedSpots.length > 3 && (
          <div className="hotel-nearby__controls">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label={copy.previous}
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label={copy.next}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </header>

      <div
        ref={scrollRef}
        className="hotel-nearby__track"
      >
        {preparedSpots.map(({ spot, distanceKm }) => {
          const localizedTitle =
            getLocalizedField(spot, "title", language) ||
            spot.title ||
            "";

          const localizedCategory =
            getLocalizedField(spot, "category", language) ||
            spot.category ||
            "";

          const localizedDescription =
            getLocalizedField(
              spot,
              "description",
              language,
            ) ||
            spot.description ||
            "";

          const distanceLabel = formatDistance(
            distanceKm,
            language,
          );

          return (
            <Link
              key={spot.id ?? spot.slug}
              href={localizedHref(`/spot/${spot.slug}`)}
              className="hotel-nearby__card"
            >
              <article>
                <div className="hotel-nearby__image-wrap">
                  {spot.image_url ? (
                    <img
                      src={spot.image_url}
                      alt={localizedTitle}
                      className="hotel-nearby__image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="hotel-nearby__placeholder">
                      {copy.noImage}
                    </div>
                  )}

                  {localizedCategory && (
                    <span className="hotel-nearby__category">
                      {localizedCategory}
                    </span>
                  )}
                </div>

                <div className="hotel-nearby__body">
                  <h3>{localizedTitle}</h3>

                  {localizedDescription && (
                    <p>{localizedDescription}</p>
                  )}

                  {distanceLabel && (
                    <div className="hotel-nearby__distance">
                      <MapPin size={13} />
                      <span>{distanceLabel}</span>
                    </div>
                  )}
                </div>
              </article>
            </Link>
          );
        })}
      </div>

      <style jsx>{`
        .hotel-nearby {
          width: 100%;
          padding: 22px;
        }

        .hotel-nearby__header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 18px;
        }

        .hotel-nearby__header > div:first-child {
          max-width: 720px;
        }

        .hotel-nearby__eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 8px;
          color: #0f8f91;
          font-size: 10px;
          line-height: 1.3;
          font-weight: 800;
          letter-spacing: 0.11em;
          text-transform: uppercase;
        }

        .hotel-nearby__header h2 {
          margin: 0;
          color: #10233f;
          font-size: clamp(24px, 3vw, 30px);
          line-height: 1.2;
          font-weight: 750;
          letter-spacing: -0.035em;
        }

        .hotel-nearby__header p {
          max-width: 620px;
          margin: 9px 0 0;
          color: #66768a;
          font-size: 12.5px;
          line-height: 1.65;
        }

        .hotel-nearby__controls {
          display: flex;
          gap: 8px;
          flex: 0 0 auto;
        }

        .hotel-nearby__controls button {
          display: inline-flex;
          width: 38px;
          height: 38px;
          align-items: center;
          justify-content: center;
          border: 1px solid #dfe7eb;
          border-radius: 999px;
          background: #ffffff;
          color: #334155;
          cursor: pointer;
          transition:
            border-color 180ms ease,
            color 180ms ease,
            background 180ms ease;
        }

        .hotel-nearby__controls button:hover {
          border-color: #b9dcde;
          background: #f1fbfb;
          color: #078f98;
        }

        .hotel-nearby__track {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: calc((100% - 28px) / 3);
          gap: 14px;
          overflow-x: auto;
          overscroll-behavior-inline: contain;
          scroll-behavior: smooth;
          scroll-snap-type: inline mandatory;
          scroll-padding-inline: 0;
          scrollbar-width: none;
        }

        .hotel-nearby__track::-webkit-scrollbar {
          display: none;
        }

        .hotel-nearby__card {
          min-width: 0;
          color: inherit;
          text-decoration: none;
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }

        .hotel-nearby__card article {
          height: 100%;
          overflow: hidden;
          border: 1px solid #e5ebef;
          border-radius: 16px;
          background: #ffffff;
          box-shadow: 0 6px 20px rgba(15, 35, 62, 0.035);
          transition:
            transform 200ms ease,
            border-color 200ms ease,
            box-shadow 200ms ease;
        }

        .hotel-nearby__card:hover article {
          transform: translateY(-2px);
          border-color: #d4e3e6;
          box-shadow: 0 14px 30px rgba(15, 35, 62, 0.08);
        }

        .hotel-nearby__image-wrap {
          position: relative;
          height: 176px;
          overflow: hidden;
          background: #edf4f4;
        }

        .hotel-nearby__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 360ms ease;
        }

        .hotel-nearby__card:hover .hotel-nearby__image {
          transform: scale(1.035);
        }

        .hotel-nearby__placeholder {
          display: flex;
          width: 100%;
          height: 100%;
          align-items: center;
          justify-content: center;
          color: #7f929f;
          font-size: 10px;
          font-weight: 600;
        }

        .hotel-nearby__category {
          position: absolute;
          top: 12px;
          left: 12px;
          max-width: calc(100% - 24px);
          overflow: hidden;
          padding: 5px 9px;
          border-radius: 999px;
          background: rgba(7, 143, 152, 0.92);
          color: #ffffff;
          font-size: 9px;
          line-height: 1.2;
          font-weight: 750;
          letter-spacing: 0.04em;
          text-overflow: ellipsis;
          text-transform: uppercase;
          white-space: nowrap;
          backdrop-filter: blur(8px);
        }

        .hotel-nearby__body {
          display: flex;
          min-height: 148px;
          flex-direction: column;
          padding: 15px 16px 16px;
        }

        .hotel-nearby__body h3 {
          margin: 0;
          color: #10233f;
          font-size: 15px;
          line-height: 1.35;
          font-weight: 700;
          letter-spacing: -0.015em;
        }

        .hotel-nearby__body p {
          display: -webkit-box;
          margin: 7px 0 0;
          overflow: hidden;
          color: #66768a;
          font-size: 11px;
          line-height: 1.55;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .hotel-nearby__distance {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: auto;
          padding-top: 13px;
          color: #078f98;
          font-size: 10px;
          line-height: 1.3;
          font-weight: 700;
        }

        @media (max-width: 900px) {
          .hotel-nearby__track {
            grid-auto-columns: calc((100% - 14px) / 2);
          }
        }

        @media (max-width: 620px) {
          .hotel-nearby {
            padding: 18px;
          }

          .hotel-nearby__header {
            align-items: flex-start;
          }

          .hotel-nearby__controls {
            display: none;
          }

          .hotel-nearby__track {
            grid-auto-columns: 86%;
          }

          .hotel-nearby__image-wrap {
            height: 190px;
          }
        }
      `}</style>
    </section>
  );
}