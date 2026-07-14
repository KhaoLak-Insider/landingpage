"use client";

import {
  Landmark,
  MapPin,
  Palmtree,
  Plane,
  ShoppingBag,
  Store,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import MapBoxMini from "@/src/components/MapBoxMini";
import type { Language } from "@/src/lib/i18n";
import type {
  HotelLocationRecord,
  HotelProfileRecord,
} from "@/src/types/spot";

interface HotelLocationWithDistances extends HotelLocationRecord {
  distance_bang_niang_market_m?: number | string | null;
  distance_coconut_beach_m?: number | string | null;
  distance_memories_beach_m?: number | string | null;
  distance_nang_thong_center_m?: number | string | null;
  distance_nearest_exchange_m?: number | string | null;
  distance_nearest_7eleven_m?: number | string | null;
  distance_phuket_airport_m?: number | string | null;
}

interface HotelLocationProps {
  location: HotelLocationWithDistances | null;
  hotelProfile: HotelProfileRecord;
  language: Language;
  latitude?: number | null;
  longitude?: number | null;
  userRole?: string | null;
}

interface DistanceItem {
  key: string;
  label: string;
  distanceInMeters: number | null;
  icon: LucideIcon;
}

interface ResolvedDistanceItem
  extends Omit<DistanceItem, "distanceInMeters"> {
  distanceInMeters: number;
}

const labels = {
  de: {
    title: "Lage",
    bangNiangMarket: "Bang Niang Market",
    coconutBeach: "Coconut Beach",
    memoriesBeach: "Memories Beach",
    nangThongCenter: "Zentrum von Khao Lak",
    nearest7Eleven: "Nächster 7-Eleven",
    nearestExchange: "Nächste Wechselstube",
    phuketAirport: "Flughafen Phuket",
    showOnMap: "Auf Karte anzeigen",
    draft: "Redaktionelle Vorschau",
    draftNotice:
      "Diese Lageinformationen sind noch nicht zur Veröffentlichung freigegeben.",
  },
  en: {
    title: "Location",
    bangNiangMarket: "Bang Niang Market",
    coconutBeach: "Coconut Beach",
    memoriesBeach: "Memories Beach",
    nangThongCenter: "Khao Lak centre",
    nearest7Eleven: "Nearest 7-Eleven",
    nearestExchange: "Nearest currency exchange",
    phuketAirport: "Phuket Airport",
    showOnMap: "View on map",
    draft: "Editorial preview",
    draftNotice:
      "This location information has not yet been approved for publication.",
  },
} as const;

function getLocalizedSummary(
  location: HotelLocationWithDistances,
  language: Language,
): string {
  const primary =
    language === "en"
      ? location.editorial_summary_en
      : location.editorial_summary_de;

  const fallback =
    language === "en"
      ? location.editorial_summary_de
      : location.editorial_summary_en;

  if (typeof primary === "string" && primary.trim()) {
    return primary.trim();
  }

  if (typeof fallback === "string" && fallback.trim()) {
    return fallback.trim();
  }

  return "";
}

function normalizeDistance(value: unknown): number | null {
  const parsedValue =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return null;
  }

  return Math.round(parsedValue);
}

function formatDistance(
  distanceInMeters: number,
  language: Language,
): string {
  if (distanceInMeters < 1000) {
    return `${distanceInMeters.toLocaleString(
      language === "de" ? "de-DE" : "en-US",
    )} m`;
  }

  const distanceInKilometres = distanceInMeters / 1000;
  const hasDecimal = distanceInKilometres % 1 !== 0;

  return `${distanceInKilometres.toLocaleString(
    language === "de" ? "de-DE" : "en-US",
    {
      minimumFractionDigits: hasDecimal ? 1 : 0,
      maximumFractionDigits: 1,
    },
  )} km`;
}

export default function HotelLocation({
  location,
  hotelProfile,
  language,
  latitude,
  longitude,
  userRole,
}: HotelLocationProps) {
  const copy = labels[language];

  const normalizedRole = String(userRole || "")
    .trim()
    .toLowerCase();

  const isEditor =
    normalizedRole === "admin" || normalizedRole === "editor";

  const isPublished = hotelProfile.status === "published";

  if (!isPublished && !isEditor) {
    return null;
  }

  if (!location) {
    return null;
  }

  const summary = getLocalizedSummary(location, language);

  const distanceItems: DistanceItem[] = [
    {
      key: "nearest-7eleven",
      label: copy.nearest7Eleven,
      distanceInMeters: normalizeDistance(
        location.distance_nearest_7eleven_m,
      ),
      icon: MapPin,
    },
    {
      key: "bang-niang-market",
      label: copy.bangNiangMarket,
      distanceInMeters: normalizeDistance(
        location.distance_bang_niang_market_m,
      ),
      icon: ShoppingBag,
    },
    {
      key: "coconut-beach",
      label: copy.coconutBeach,
      distanceInMeters: normalizeDistance(
        location.distance_coconut_beach_m,
      ),
      icon: Palmtree,
    },
    {
      key: "memories-beach",
      label: copy.memoriesBeach,
      distanceInMeters: normalizeDistance(
        location.distance_memories_beach_m,
      ),
      icon: Waves,
    },
    {
      key: "nang-thong-center",
      label: copy.nangThongCenter,
      distanceInMeters: normalizeDistance(
        location.distance_nang_thong_center_m,
      ),
      icon: Landmark,
    },
    {
      key: "nearest-exchange",
      label: copy.nearestExchange,
      distanceInMeters: normalizeDistance(
        location.distance_nearest_exchange_m,
      ),
      icon: Store,
    },
    {
      key: "phuket-airport",
      label: copy.phuketAirport,
      distanceInMeters: normalizeDistance(
        location.distance_phuket_airport_m,
      ),
      icon: Plane,
    },
  ];

  const distances: ResolvedDistanceItem[] = distanceItems.filter(
    (item): item is ResolvedDistanceItem =>
      item.distanceInMeters !== null,
  );

  const hasCoordinates =
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    typeof longitude === "number" &&
    Number.isFinite(longitude);

  if (!summary && distances.length === 0 && !hasCoordinates) {
    return null;
  }

  const mapsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : null;

  return (
    <section className="hotel-location-card">
      <div className="hotel-location-card__heading">
        <h2>{copy.title}</h2>

        {!isPublished && isEditor && (
          <div className="hotel-location-card__draft">
            <strong>{copy.draft}</strong>
            <span>{copy.draftNotice}</span>
          </div>
        )}
      </div>

      <div
        className={`hotel-location-card__layout ${
          !hasCoordinates ? "hotel-location-card__layout--without-map" : ""
        }`}
      >
        <div className="hotel-location-card__content">
          {summary && (
            <p className="hotel-location-card__summary">{summary}</p>
          )}

          {distances.length > 0 && (
            <div className="hotel-location-card__distances">
              {distances.map((item) => {
                const Icon = item.icon;

                return (
                  <div className="hotel-location-card__distance" key={item.key}>
                    <span className="hotel-location-card__distance-name">
                      <Icon size={15} strokeWidth={1.8} />
                      <span>{item.label}</span>
                    </span>

                    <span className="hotel-location-card__dots" />

                    <strong>
                      {formatDistance(item.distanceInMeters, language)}
                    </strong>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {hasCoordinates && (
          <div className="hotel-location-card__map-column">
            <div className="hotel-location-card__map">
              <MapBoxMini lat={latitude} lng={longitude} route={null} />
            </div>

            {mapsUrl && (
              <a
                className="hotel-location-card__map-link"
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
              >
                {copy.showOnMap}
                <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .hotel-location-card {
          width: 100%;
          padding: 18px;
        }

        .hotel-location-card__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 8px 0 12px 8px;
}

        h2 {
          margin: 0;
          color: #10233f;
          font-size: 18px;
          line-height: 1.3;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .hotel-location-card__draft {
          display: flex;
          max-width: 265px;
          flex-direction: column;
          gap: 2px;
          padding: 8px 10px;
          border: 1px solid #fed7aa;
          border-radius: 10px;
          background: #fff7ed;
          color: #9a3412;
          font-size: 9px;
          line-height: 1.35;
        }

        .hotel-location-card__draft strong {
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .hotel-location-card__layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 220px;
          gap: 18px;
          align-items: stretch;
        }

        .hotel-location-card__layout--without-map {
          grid-template-columns: 1fr;
        }

        .hotel-location-card__content {
          min-width: 0;
        }

        .hotel-location-card__summary {
          margin: 0 0 13px;
          color: #526276;
          font-size: 12px;
          line-height: 1.65;
        }

        .hotel-location-card__distances {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .hotel-location-card__distance {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 8px;
          color: #415167;
          font-size: 11px;
          line-height: 1.35;
        }

        .hotel-location-card__distance-name {
          display: inline-flex;
          min-width: 0;
          align-items: center;
          gap: 8px;
        }

        .hotel-location-card__distance-name :global(svg) {
          flex: 0 0 auto;
          color: #0f8f91;
        }

        .hotel-location-card__distance-name span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .hotel-location-card__dots {
          min-width: 18px;
          flex: 1 1 auto;
          border-bottom: 1px dotted #cbd5df;
          transform: translateY(-1px);
        }

        .hotel-location-card__distance strong {
          flex: 0 0 auto;
          color: #10233f;
          font-size: 11px;
          font-weight: 700;
        }

        .hotel-location-card__map-column {
          display: flex;
          min-width: 0;
          overflow: hidden;
          flex-direction: column;
          border: 1px solid #e8edf2;
          border-radius: 12px;
          background: #ffffff;
        }

        .hotel-location-card__map {
          height: 196px;
          overflow: hidden;
          background: #eef5f4;
        }

        .hotel-location-card__map :global(.mapboxgl-map) {
          width: 100%;
          height: 100%;
        }

        .hotel-location-card__map-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 38px;
          padding: 8px 12px;
          border-top: 1px solid #edf1f4;
          color: #079ca5;
          font-size: 10px;
          line-height: 1.3;
          font-weight: 700;
          text-decoration: none;
          transition:
            background 180ms ease,
            color 180ms ease;
        }

        .hotel-location-card__map-link:hover {
          background: #f0fdfa;
          color: #087f86;
        }

        @media (max-width: 760px) {
          .hotel-location-card__layout {
            grid-template-columns: 1fr;
          }

          .hotel-location-card__map {
            height: 220px;
          }
        }

        @media (max-width: 560px) {
          .hotel-location-card {
            padding: 14px;
          }

          .hotel-location-card__heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .hotel-location-card__summary {
            font-size: 11px;
          }

          .hotel-location-card__distance {
            font-size: 10px;
          }

          .hotel-location-card__distance strong {
            font-size: 10px;
          }
        }
      `}</style>
    </section>
  );
}