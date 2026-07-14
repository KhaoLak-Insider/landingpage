"use client";

import type { ReactNode } from "react";
import {
  BedDouble,
  GlassWater,
  Users,
  Utensils,
  Waves,
} from "lucide-react";
import type { Language } from "@/src/lib/i18n";
import type { PremiumHotelRecord } from "@/src/types/spot";

interface HotelHighlightsProps {
  premiumHotel: PremiumHotelRecord;
  language: Language;
  userRole?: string | null;
}

interface HighlightCard {
  key: string;
  title: string;
  description: string;
  icon: ReactNode;
}

const copy = {
  de: {
    title: "Highlights",
    pools: "Swimmingpools",
    rooms: "Zimmer & Villen",
    restaurants: "Restaurants",
    bars: "Bars",
    familyFriendly: "Familienfreundlich",
    adultsOnly: "Adults only",
    yes: "Ja",
    no: "Nein",
    noData: "Keine Angabe",
    draft: "Redaktionelle Vorschau",
    draftNotice:
      "Dieses Hotelprofil ist noch nicht zur Veröffentlichung freigegeben.",
  },
  en: {
    title: "Highlights",
    pools: "Swimming pools",
    rooms: "Rooms & villas",
    restaurants: "Restaurants",
    bars: "Bars",
    familyFriendly: "Family friendly",
    adultsOnly: "Adults only",
    yes: "Yes",
    no: "No",
    noData: "Not specified",
    draft: "Editorial preview",
    draftNotice:
      "This hotel profile has not yet been approved for publication.",
  },
} as const;

function formatCount(
  value: number | null | undefined,
  singular: string,
  plural: string,
  fallback: string,
): string {
  if (value === null || value === undefined) return fallback;
  return `${value} ${value === 1 ? singular : plural}`;
}

export default function HotelHighlights({
  premiumHotel,
  language,
  userRole,
}: HotelHighlightsProps) {
  const text = copy[language];
  const role = String(userRole || "").trim().toLowerCase();
  const isEditor = role === "admin" || role === "editor";
  const isPublished = premiumHotel.status === "published";

  if (!isPublished && !isEditor) return null;

  const familyFriendly = premiumHotel.suitable_for_families === true;

  const highlights: HighlightCard[] = [
    {
      key: "pools",
      title: text.pools,
      description: formatCount(
        premiumHotel.pool_count,
        language === "en" ? "pool" : "Pool",
        language === "en" ? "pools" : "Pools",
        text.noData,
      ),
      icon: <Waves size={25} strokeWidth={1.7} />,
    },
    {
      key: "rooms",
      title: text.rooms,
      description: formatCount(
        premiumHotel.room_count,
        language === "en" ? "room" : "Zimmer",
        language === "en" ? "rooms" : "Zimmer",
        text.noData,
      ),
      icon: <BedDouble size={25} strokeWidth={1.7} />,
    },
    {
      key: "restaurants",
      title: text.restaurants,
      description: formatCount(
        premiumHotel.restaurant_count,
        "Restaurant",
        language === "en" ? "restaurants" : "Restaurants",
        text.noData,
      ),
      icon: <Utensils size={25} strokeWidth={1.7} />,
    },
    {
      key: "bars",
      title: text.bars,
      description: formatCount(
        premiumHotel.bar_count,
        "Bar",
        "Bars",
        text.noData,
      ),
      icon: <GlassWater size={25} strokeWidth={1.7} />,
    },
    {
      key: "guest-profile",
      title: text.familyFriendly,
      description: familyFriendly ? text.yes : text.adultsOnly,
      icon: <Users size={25} strokeWidth={1.7} />,
    },
  ];

  return (
    <section className="hotel-highlights-compact">
      <div className="hotel-highlights-compact__heading">
        <h2>{text.title}</h2>

        {!isPublished && isEditor && (
          <div className="hotel-highlights-compact__draft">
            <strong>{text.draft}</strong>
            <span>{text.draftNotice}</span>
          </div>
        )}
      </div>

      <div className="hotel-highlights-compact__grid">
        {highlights.map((highlight) => (
          <article key={highlight.key} className="hotel-highlights-compact__card">
            <div className="hotel-highlights-compact__icon" aria-hidden="true">
              {highlight.icon}
            </div>
            <h3>{highlight.title}</h3>
            <p>{highlight.description}</p>
          </article>
        ))}
      </div>

      <style jsx>{`
        .hotel-highlights-compact {
          width: 100%;
        }

        .hotel-highlights-compact__heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 12px;
        }

        .hotel-highlights-compact h2 {
          margin: 0;
          color: #10233f;
          font-size: 18px;
          line-height: 1.3;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .hotel-highlights-compact__draft {
          display: flex;
          flex-direction: column;
          gap: 2px;
          max-width: 280px;
          padding: 8px 10px;
          border: 1px solid #fed7aa;
          border-radius: 10px;
          background: #fff7ed;
          color: #9a3412;
          font-size: 9px;
          line-height: 1.35;
        }

        .hotel-highlights-compact__draft strong {
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .hotel-highlights-compact__grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
        }

        .hotel-highlights-compact__card {
          display: flex;
          min-width: 0;
          min-height: 126px;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 14px 8px 12px;
          border: 1px solid #eef2f5;
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 4px 14px rgba(15, 35, 62, 0.025);
          text-align: center;
        }

        .hotel-highlights-compact__icon {
          display: flex;
          width: 46px;
          height: 46px;
          align-items: center;
          justify-content: center;
          margin-bottom: 9px;
          border-radius: 999px;
          background: #eafafa;
          color: #0aa7ad;
        }

        .hotel-highlights-compact h3 {
          margin: 0;
          color: #64748b;
          font-size: 10px;
          line-height: 1.35;
          font-weight: 600;
        }

        .hotel-highlights-compact p {
          margin: 4px 0 0;
          color: #10233f;
          font-size: 11px;
          line-height: 1.4;
          font-weight: 700;
        }

        @media (max-width: 980px) {
          .hotel-highlights-compact__grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 620px) {
          .hotel-highlights-compact__grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .hotel-highlights-compact__card:last-child {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </section>
  );
}