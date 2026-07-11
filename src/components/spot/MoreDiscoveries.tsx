"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { t } from "@/src/lib/translations";
import type { Language } from "@/src/lib/i18n";
import { getLocalizedField } from "@/src/lib/spot/localization";

interface MoreDiscoveriesProps {
  spots: any[];
  originLatitude: number;
  originLongitude: number;
  userProfile: any;
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

export default function MoreDiscoveries({
  spots,
  originLatitude,
  originLongitude,
  userProfile,
  language,
  localizedHref,
}: MoreDiscoveriesProps) {
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

  const hotelData = Array.isArray(userProfile?.hotels)
    ? userProfile.hotels[0]
    : userProfile?.hotels;

  const hotelLatitude = userProfile?.hotel_id
    ? hotelData?.lat
    : userProfile?.custom_hotel_lat;

  const hotelLongitude = userProfile?.hotel_id
    ? hotelData?.lng
    : userProfile?.custom_hotel_lng;

  return (
    <section
      style={{
        marginTop: 40,
        width: "100%",
        position: "relative",
      }}
    >
      <h2
        style={{
          fontSize: 24,
          fontWeight: 800,
          marginBottom: 20,
        }}
      >
        {t(language, "moreDiscoveries")}
      </h2>

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
            const distanceFromCurrentSpot =
              calculateDistance(
                originLatitude,
                originLongitude,
                spot.latitude,
                spot.longitude
              );

            const distanceFromHotel =
              hotelLatitude && hotelLongitude
                ? calculateDistance(
                    hotelLatitude,
                    hotelLongitude,
                    spot.latitude,
                    spot.longitude
                  )
                : null;

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
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <span>
                        {t(
                          language,
                          "kilometersFromHere"
                        ).replace(
                          "{distance}",
                          distanceFromCurrentSpot || "0"
                        )}
                      </span>

                      {distanceFromHotel && (
                        <span>
                          {t(
                            language,
                            "kilometersFromHotel"
                          ).replace(
                            "{distance}",
                            distanceFromHotel
                          )}
                        </span>
                      )}
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
