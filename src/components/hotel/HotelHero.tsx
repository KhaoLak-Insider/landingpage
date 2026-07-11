"use client";

import Link from "next/link";
import {
  ChevronLeft,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react";
import type { Language } from "@/src/lib/i18n";
import { t } from "@/src/lib/translations";

interface HotelHeroProps {
  spot: any;
  language: Language;
  title: string;
  description: string;
  category: string;
  backHref: string;
}

export default function HotelHero({
  spot,
  language,
  title,
  description,
  category,
  backHref,
}: HotelHeroProps) {
  const stars = Number(spot.stars) || 0;
  const location =
    spot.address ||
    spot.location ||
    "Khao Lak, Phang Nga";

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        minHeight: 580,
        overflow: "hidden",
        background: "#0f172a",
      }}
    >
      <img
        src={spot.image_url}
        alt={title}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(15,23,42,0.96) 0%, rgba(15,23,42,0.82) 34%, rgba(15,23,42,0.30) 68%, rgba(15,23,42,0.08) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1280,
          minHeight: 580,
          margin: "0 auto",
          padding: "34px 48px 54px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Link
          href={backHref}
          style={{
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.92)",
            color: "#0f172a",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 700,
            boxShadow: "0 8px 24px rgba(15,23,42,0.18)",
          }}
        >
          <ChevronLeft size={17} />
          {t(language, "backToAllSpots")}
        </Link>

        <div
          style={{
            maxWidth: 680,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 14px",
                borderRadius: 999,
                background: "#14b8a6",
                color: "#fff",
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              <Sparkles size={14} />
              Premium Hotel
            </span>

            {category && (
              <span
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  backdropFilter: "blur(8px)",
                }}
              >
                {category}
              </span>
            )}
          </div>

          {stars > 0 && (
            <div
              aria-label={`${stars} ${t(language, "stars")}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {Array.from({ length: stars }).map((_, index) => (
                <Star
                  key={index}
                  size={18}
                  fill="#facc15"
                  color="#facc15"
                />
              ))}
            </div>
          )}

          <h1
            style={{
              margin: 0,
              color: "#fff",
              fontSize: "clamp(42px, 6vw, 72px)",
              lineHeight: 1.02,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              textShadow: "0 4px 24px rgba(0,0,0,0.34)",
            }}
          >
            {title}
          </h1>

          {description && (
            <p
              style={{
                margin: 0,
                maxWidth: 620,
                color: "rgba(255,255,255,0.88)",
                fontSize: 17,
                lineHeight: 1.7,
                fontWeight: 400,
                textShadow: "0 2px 12px rgba(0,0,0,0.28)",
              }}
            >
              {description}
            </p>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              color: "rgba(255,255,255,0.92)",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <MapPin size={18} color="#2dd4bf" />
            {location}
          </div>
        </div>
      </div>

      {spot.image_url?.includes("google") && (
        <div
          style={{
            position: "absolute",
            right: 14,
            bottom: 12,
            zIndex: 3,
            padding: "3px 7px",
            borderRadius: 4,
            background: "rgba(0,0,0,0.42)",
            color: "rgba(255,255,255,0.82)",
            fontSize: 9,
          }}
        >
          Powered by Google
        </div>
      )}
    </section>
  );
}
