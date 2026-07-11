"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { t } from "@/src/lib/translations";
import type { Language } from "@/src/lib/i18n";
import { getLocalizedField } from "@/src/lib/spot/localization";

interface NearbySpotsProps {
  spots: any[];
  originLatitude: number;
  originLongitude: number;
  radiusKm: number;
  language: Language;
  localizedHref: (path: string) => string;
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string | null {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return null;
  }

  const earthRadiusKm = 6371;
  const latitudeDifference =
    (lat2 - lat1) * (Math.PI / 180);
  const longitudeDifference =
    (lon2 - lon1) * (Math.PI / 180);

  const value =
    Math.sin(latitudeDifference / 2) *
      Math.sin(latitudeDifference / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(longitudeDifference / 2) *
      Math.sin(longitudeDifference / 2);

  return (
    earthRadiusKm *
    2 *
    Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
  ).toFixed(1);
}

export default function NearbySpots({
  spots,
  originLatitude,
  originLongitude,
  radiusKm,
  language,
  localizedHref,
}: NearbySpotsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (spots.length === 0) {
    return null;
  }

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  return (
    <section
      style={{
        marginTop: 20,
        width: "100%",
        position: "relative",
      }}
    >
      <h2
        style={{
          fontSize: 24,
          fontWeight: 800,
          marginBottom: 4,
        }}
      >
        {t(language, "nearbyWithin").replace(
          "{distance}",
          String(Math.round(radiusKm * 1000))
        )}
      </h2>

      <p
        style={{
          fontSize: 13,
          color: "#64748b",
          margin: "0 0 20px 0",
        }}
      >
        {t(language, "nearbyDescription")}
      </p>

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          aria-label={t(language, "scrollLeft")}
          onClick={() => scroll("left")}
          style={{
            position: "absolute",
            left: -20,
            zIndex: 10,
            background: "white",
            padding: 10,
            borderRadius: "50%",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            cursor: "pointer",
            border: "none",
          }}
        >
          <ChevronLeft />
        </button>

        <div
          ref={scrollRef}
          style={{
            display: "flex",
            gap: 20,
            overflowX: "hidden",
            scrollBehavior: "smooth",
            width: "100%",
          }}
        >
          {spots.map((spot) => {
            const distance = calculateDistance(
              originLatitude,
              originLongitude,
              spot.latitude,
              spot.longitude
            );

            const localizedTitle =
              getLocalizedField(spot, "title", language) ||
              spot.title;

            const localizedCategory =
              getLocalizedField(spot, "category", language) ||
              spot.category;

            const localizedDescription =
              getLocalizedField(
                spot,
                "description",
                language
              ) || spot.description;

            return (
              <Link
                key={spot.id ?? spot.slug}
                href={localizedHref(`/spot/${spot.slug}`)}
                style={{
                  textDecoration: "none",
                  flex: "0 0 calc(33.333% - 14px)",
                  minWidth: "calc(33.333% - 14px)",
                }}
              >
                <article
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "1px solid #e5e5e5",
                  }}
                >
                  <div
                    style={{
                      height: 160,
                      position: "relative",
                    }}
                  >
                    <img
                      src={spot.image_url}
                      alt={localizedTitle}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />

                    <div
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        background:
                          "rgba(20, 184, 166, 0.9)",
                        color: "white",
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      {localizedCategory}
                    </div>
                  </div>

                  <div style={{ padding: 16 }}>
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#1e293b",
                        margin: "0 0 8px 0",
                      }}
                    >
                      {localizedTitle}
                    </h3>

                    <p
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                        margin: "0 0 12px 0",
                        height: 36,
                        overflow: "hidden",
                      }}
                    >
                      {localizedDescription}
                    </p>

                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#14b8a6",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <MapPin size={12} />
                      <span>
                        {t(language, "metersAway").replace(
                          "{distance}",
                          String(
                            Math.round(
                              parseFloat(distance || "0") *
                                1000
                            )
                          )
                        )}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          aria-label={t(language, "scrollRight")}
          onClick={() => scroll("right")}
          style={{
            position: "absolute",
            right: -20,
            zIndex: 10,
            background: "white",
            padding: 10,
            borderRadius: "50%",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            cursor: "pointer",
            border: "none",
          }}
        >
          <ChevronRight />
        </button>
      </div>
    </section>
  );
}
