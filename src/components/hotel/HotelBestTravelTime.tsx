"use client";

import Link from "next/link";
import {
  CalendarDays,
  CloudRain,
  Sparkles,
  Sun,
  WalletCards,
} from "lucide-react";
import type { Language } from "@/src/lib/i18n";
import { localizePath } from "@/src/lib/i18n-routing";

interface HotelBestTravelTimeProps {
  language: Language;
}

const content = {
  de: {
    title: "Beste Reisezeit",
    intro: "Khao Lak hat das ganze Jahr über viel zu bieten.",
    drySeason: "Trockenzeit",
    dryMonths: "Nov – Apr",
    dryText: "Sonnig, wenig Regen und ideales Strandwetter.",
    rainySeason: "Regenzeit",
    rainyMonths: "Mai – Okt",
    rainyText: "Kurze Schauer, üppige Natur und weniger Touristen.",
    recommendation: "Unsere Empfehlung",
    bestMonthsLabel: "Beste Monate",
    bestMonthsValue: "Dezember – März",
    valueLabel: "Ruhiger & günstiger",
    valueMonths: "Mai, Juni, September & Oktober",
    linkText: "Kompletter Monatsguide zur Reisezeit",
  },
  en: {
    title: "Best time to visit",
    intro: "Khao Lak has plenty to offer throughout the year.",
    drySeason: "Dry season",
    dryMonths: "Nov – Apr",
    dryText: "Sunny, little rain and ideal beach weather.",
    rainySeason: "Rainy season",
    rainyMonths: "May – Oct",
    rainyText: "Short showers, lush nature and fewer visitors.",
    recommendation: "Our recommendation",
    bestMonthsLabel: "Best months",
    bestMonthsValue: "December – March",
    valueLabel: "Quieter & better value",
    valueMonths: "May, June, September & October",
    linkText: "View the complete month-by-month guide",
  },
} as const;

const BLOG_PATH =
  "/blog/beste-reisezeit-khao-lak-wetter-regenzeit-insider-tipps-f-r-jeden-monat";

export default function HotelBestTravelTime({
  language,
}: HotelBestTravelTimeProps) {
  const copy = content[language];
  const blogHref = localizePath(BLOG_PATH, language);

  return (
    <section className="hotel-best-travel-time">
      <div className="hotel-best-travel-time__header">
        <h2>{copy.title}</h2>
        <p>{copy.intro}</p>
      </div>

      <div className="hotel-best-travel-time__seasons">
        <div className="hotel-best-travel-time__season">
          <span className="hotel-best-travel-time__icon hotel-best-travel-time__icon--sun">
            <Sun size={22} strokeWidth={1.9} />
          </span>

          <div>
            <span className="hotel-best-travel-time__label">
              {copy.drySeason}
            </span>
            <strong>{copy.dryMonths}</strong>
            <p>{copy.dryText}</p>
          </div>
        </div>

        <div className="hotel-best-travel-time__season">
          <span className="hotel-best-travel-time__icon hotel-best-travel-time__icon--rain">
            <CloudRain size={22} strokeWidth={1.9} />
          </span>

          <div>
            <span className="hotel-best-travel-time__label">
              {copy.rainySeason}
            </span>
            <strong>{copy.rainyMonths}</strong>
            <p>{copy.rainyText}</p>
          </div>
        </div>
      </div>

      <div className="hotel-best-travel-time__recommendation">
        <div className="hotel-best-travel-time__recommendation-title">
          <Sparkles size={14} strokeWidth={2} />
          <span>{copy.recommendation}</span>
        </div>

        <div className="hotel-best-travel-time__recommendation-grid">
          <div className="hotel-best-travel-time__recommendation-card">
            <CalendarDays size={15} strokeWidth={1.9} />
            <span>{copy.bestMonthsLabel}</span>
            <strong>{copy.bestMonthsValue}</strong>
          </div>

          <div className="hotel-best-travel-time__recommendation-card">
            <WalletCards size={15} strokeWidth={1.9} />
            <span>{copy.valueLabel}</span>
            <strong>{copy.valueMonths}</strong>
          </div>
        </div>

        <Link
          href={blogHref}
          className="hotel-best-travel-time__link"
        >
          {copy.linkText}
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <style jsx>{`
        .hotel-best-travel-time {
          display: flex;
          width: 100%;
          height: 100%;
          flex-direction: column;
          padding: 18px;
        }

        .hotel-best-travel-time__header {
  margin-top: 10px;
  margin-left: 10px;
  margin-bottom: 18px;
}

        h2 {
          margin: 0;
          color: #10233f;
          font-size: 18px;
          line-height: 1.3;
          font-weight: 700;
          letter-spacing: -0.025em;
        }

        .hotel-best-travel-time__header p {
          margin: 5px 0 0;
          color: #66768a;
          font-size: 12px;
          line-height: 1.55;
        }

        .hotel-best-travel-time__seasons {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .hotel-best-travel-time__season {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px 14px 12px 0;
        }

        .hotel-best-travel-time__season
          + .hotel-best-travel-time__season {
          padding-right: 0;
          padding-left: 14px;
          border-left: 1px solid #e8edf2;
        }

        .hotel-best-travel-time__icon {
          display: inline-flex;
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
        }

        .hotel-best-travel-time__icon--sun {
          background: #fff7df;
          color: #f5a800;
        }

        .hotel-best-travel-time__icon--rain {
          background: #eaf8fc;
          color: #079ca5;
        }

        .hotel-best-travel-time__label {
          display: block;
          color: #526276;
          font-size: 10px;
          line-height: 1.3;
          font-weight: 700;
        }

        .hotel-best-travel-time__season strong {
          display: block;
          margin-top: 2px;
          color: #10233f;
          font-size: 16px;
          line-height: 1.25;
          font-weight: 800;
        }

        .hotel-best-travel-time__season p {
          margin: 6px 0 0;
          color: #66768a;
          font-size: 10px;
          line-height: 1.55;
        }

        .hotel-best-travel-time__recommendation {
          margin-top: auto;
          padding-top: 14px;
          border-top: 1px solid #e8edf2;
        }

        .hotel-best-travel-time__recommendation-title {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-left: 10px;
  margin-bottom: 10px;

  color: #10233f;
  font-size: 11px;
  line-height: 1.4;
  font-weight: 800;
}

        .hotel-best-travel-time__recommendation-title :global(svg) {
          color: #079ca5;
        }

        .hotel-best-travel-time__recommendation-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .hotel-best-travel-time__recommendation-card {
          display: grid;
          grid-template-columns: 18px minmax(0, 1fr);
          gap: 2px 7px;
          padding: 9px 10px;
          border: 1px solid #edf1f4;
          border-radius: 10px;
          background: #f8fafc;
        }

        .hotel-best-travel-time__recommendation-card :global(svg) {
          grid-row: 1 / 3;
          align-self: center;
          color: #0f8f91;
        }

        .hotel-best-travel-time__recommendation-card span {
          color: #7a8898;
          font-size: 9px;
          line-height: 1.35;
          font-weight: 600;
        }

        .hotel-best-travel-time__recommendation-card strong {
          color: #10233f;
          font-size: 10px;
          line-height: 1.4;
          font-weight: 800;
        }

        :global(.hotel-best-travel-time__link) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 15px;

  /* HIER */
  margin-left: 15px;

  color: #079ca5;
  font-size: 10px;
  line-height: 1.4;
  font-weight: 700;
  text-decoration: none;
}

        :global(.hotel-best-travel-time__link:hover) {
          text-decoration: underline;
        }

        @media (max-width: 560px) {
          .hotel-best-travel-time {
            padding: 14px;
          }

          .hotel-best-travel-time__seasons,
          .hotel-best-travel-time__recommendation-grid {
            grid-template-columns: 1fr;
          }

          .hotel-best-travel-time__season {
            padding: 8px 0 14px;
          }

          .hotel-best-travel-time__season
            + .hotel-best-travel-time__season {
            padding: 14px 0 8px;
            border-top: 1px solid #e8edf2;
            border-left: 0;
          }
        }
      `}</style>
    </section>
  );
}
