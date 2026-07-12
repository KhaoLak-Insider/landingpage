"use client";

import type { ReactNode } from "react";
import {
  Car,
  Check,
  Footprints,
  MapPin,
  MoonStar,
  Navigation,
  ShoppingBag,
  Sparkles,
  Sun,
  Waves,
} from "lucide-react";
import type { Language } from "@/src/lib/i18n";
import type {
  HotelLocationRecord,
  HotelProfileRecord,
} from "@/src/types/spot";

interface HotelLocationProps {
  location: HotelLocationRecord | null;
  hotelProfile: HotelProfileRecord;
  language: Language;
  userRole?: string | null;
}

interface DistanceItem {
  name_de?: string;
  name_en?: string;
  distance?: string;
  duration?: string;
  mode?: "walk" | "drive" | "transfer";
}

const labels = {
  de: {
    eyebrow: "Lage & Umgebung",
    title: "Wie liegt das Resort?",
    subtitle:
      "Lage, Erreichbarkeit und wichtige Ziele in der Umgebung kompakt zusammengefasst.",
    setting: "Lagecharakter",
    beachAccess: "Strandzugang",
    terrain: "Gelände",
    noise: "Umgebung",
    walkability: "Zu Fuß",
    transport: "Mobilität",
    swimming: "Baden im Meer",
    sunset: "Sonnenuntergang",
    sunsetValue: "Vom Resort aus erlebbar",
    nearby: "In der Nähe",
    distances: "Wichtige Entfernungen",
    draft: "Redaktionelle Vorschau",
    draftNotice:
      "Diese Lageinformationen sind noch nicht zur Veröffentlichung freigegeben.",
  },
  en: {
    eyebrow: "Location & surroundings",
    title: "Where is the resort located?",
    subtitle:
      "A compact overview of the setting, accessibility and important nearby destinations.",
    setting: "Setting",
    beachAccess: "Beach access",
    terrain: "Terrain",
    noise: "Surroundings",
    walkability: "Walkability",
    transport: "Getting around",
    swimming: "Sea conditions",
    sunset: "Sunset",
    sunsetValue: "Visible from the resort",
    nearby: "Nearby",
    distances: "Key distances",
    draft: "Editorial preview",
    draftNotice:
      "This location information has not yet been approved for publication.",
  },
} as const;

function localizedValue(
  location: HotelLocationRecord,
  language: Language,
  field:
    | "setting"
    | "editorial_summary"
    | "beach_access"
    | "terrain"
    | "noise_level"
    | "walkability"
    | "transport_recommendation"
    | "swimming_conditions"
): string {
  const primary =
    language === "en"
      ? location[`${field}_en`]
      : location[`${field}_de`];

  const fallback =
    language === "en"
      ? location[`${field}_de`]
      : location[`${field}_en`];

  if (typeof primary === "string" && primary.trim()) {
    return primary.trim();
  }

  if (typeof fallback === "string" && fallback.trim()) {
    return fallback.trim();
  }

  return "";
}

function localizedList(
  germanValue: unknown,
  englishValue: unknown,
  language: Language
): string[] {
  const primary = language === "en" ? englishValue : germanValue;
  const fallback = language === "en" ? germanValue : englishValue;

  const source = Array.isArray(primary)
    ? primary
    : Array.isArray(fallback)
      ? fallback
      : [];

  return source.filter(
    (item): item is string =>
      typeof item === "string" && item.trim() !== ""
  );
}

function getDistances(value: unknown): DistanceItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is DistanceItem =>
      typeof item === "object" &&
      item !== null
  );
}

function getDistanceName(
  item: DistanceItem,
  language: Language
): string {
  const primary =
    language === "en" ? item.name_en : item.name_de;

  const fallback =
    language === "en" ? item.name_de : item.name_en;

  return primary?.trim() || fallback?.trim() || "";
}

function getModeIcon(
  mode?: DistanceItem["mode"]
): ReactNode {
  if (mode === "walk") {
    return <Footprints size={16} />;
  }

  if (mode === "transfer") {
    return <Navigation size={16} />;
  }

  return <Car size={16} />;
}

export default function HotelLocation({
  location,
  hotelProfile,
  language,
  userRole,
}: HotelLocationProps) {
  const copy = labels[language];

  const normalizedRole = String(userRole || "")
    .trim()
    .toLowerCase();

  const isEditor =
    normalizedRole === "admin" ||
    normalizedRole === "editor";

  const isPublished =
    hotelProfile.status === "published";

  if (!isPublished && !isEditor) {
    return null;
  }

  if (!location) {
    return null;
  }

  const editorialSummary = localizedValue(
    location,
    language,
    "editorial_summary"
  );

  const facts = [
    {
      key: "setting",
      label: copy.setting,
      value: localizedValue(location, language, "setting"),
      icon: <MapPin size={18} />,
    },
    {
      key: "beach",
      label: copy.beachAccess,
      value: localizedValue(location, language, "beach_access"),
      icon: <Waves size={18} />,
    },
    {
      key: "terrain",
      label: copy.terrain,
      value: localizedValue(location, language, "terrain"),
      icon: <Navigation size={18} />,
    },
    {
      key: "noise",
      label: copy.noise,
      value: localizedValue(location, language, "noise_level"),
      icon: <MoonStar size={18} />,
    },
    {
      key: "walkability",
      label: copy.walkability,
      value: localizedValue(location, language, "walkability"),
      icon: <Footprints size={18} />,
    },
    {
      key: "transport",
      label: copy.transport,
      value: localizedValue(
        location,
        language,
        "transport_recommendation"
      ),
      icon: <Car size={18} />,
    },
    {
      key: "swimming",
      label: copy.swimming,
      value: localizedValue(
        location,
        language,
        "swimming_conditions"
      ),
      icon: <Waves size={18} />,
    },
  ].filter((fact) => fact.value);

  if (location.sunset_view) {
    facts.push({
      key: "sunset",
      label: copy.sunset,
      value: copy.sunsetValue,
      icon: <Sun size={18} />,
    });
  }

  const nearbyServices = localizedList(
    location.nearby_services_de,
    location.nearby_services_en,
    language
  );

  const distances = getDistances(location.distances);

  if (
    !editorialSummary &&
    facts.length === 0 &&
    nearbyServices.length === 0 &&
    distances.length === 0
  ) {
    return null;
  }

  return (
    <section
      style={{
        maxWidth: 1180,
        margin: "0 auto 48px",
        padding: "0 28px",
      }}
    >
      <div
        style={{
          marginBottom: 26,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div style={{ maxWidth: 760 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
              color: "#0f766e",
              fontSize: 11,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.13em",
            }}
          >
            <MapPin size={17} />
            {copy.eyebrow}
          </div>

          <h2
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "clamp(28px, 4vw, 42px)",
              lineHeight: 1.12,
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            {copy.title}
          </h2>

          <p
            style={{
              margin: "12px 0 0",
              maxWidth: 720,
              color: "#64748b",
              fontSize: 15,
              lineHeight: 1.75,
            }}
          >
            {copy.subtitle}
          </p>
        </div>

        {!isPublished && isEditor && (
          <div
            style={{
              maxWidth: 290,
              padding: "12px 14px",
              borderRadius: 16,
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              color: "#9a3412",
            }}
          >
            <div
              style={{
                marginBottom: 4,
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {copy.draft}
            </div>

            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                lineHeight: 1.5,
              }}
            >
              {copy.draftNotice}
            </div>
          </div>
        )}
      </div>

      {editorialSummary && (
        <div
          style={{
            marginBottom: 18,
            padding: "22px 24px",
            borderRadius: 22,
            background:
              "linear-gradient(135deg, #0f172a 0%, #164e63 100%)",
            color: "#ffffff",
            boxShadow:
              "0 16px 40px rgba(15,23,42,0.14)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 9,
              color: "#99f6e4",
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.09em",
            }}
          >
            <Sparkles size={16} />
            Khao Lak Insider
          </div>

          <p
            style={{
              margin: 0,
              fontSize: 15,
              lineHeight: 1.75,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            {editorialSummary}
          </p>
        </div>
      )}

      {facts.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
            marginBottom:
              nearbyServices.length > 0 ||
              distances.length > 0
                ? 18
                : 0,
          }}
        >
          {facts.map((fact) => (
            <div
              key={fact.key}
              style={{
                padding: 18,
                borderRadius: 18,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 10px 24px rgba(15,23,42,0.06)",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  marginBottom: 13,
                  borderRadius: 13,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#f0fdfa",
                  color: "#0f766e",
                }}
              >
                {fact.icon}
              </div>

              <div
                style={{
                  marginBottom: 6,
                  color: "#64748b",
                  fontSize: 9,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {fact.label}
              </div>

              <div
                style={{
                  color: "#334155",
                  fontSize: 12,
                  fontWeight: 700,
                  lineHeight: 1.55,
                }}
              >
                {fact.value}
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 18,
        }}
      >
        {nearbyServices.length > 0 && (
          <div
            style={{
              padding: 22,
              borderRadius: 22,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 15,
                color: "#0f172a",
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              <ShoppingBag size={18} color="#0f766e" />
              {copy.nearby}
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {nearbyServices.map((service) => (
                <span
                  key={service}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 11px",
                    borderRadius: 999,
                    background: "#f0fdfa",
                    color: "#115e59",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  <Check size={13} />
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {distances.length > 0 && (
          <div
            style={{
              padding: 22,
              borderRadius: 22,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 15,
                color: "#0f172a",
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              <Navigation size={18} color="#0f766e" />
              {copy.distances}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {distances.map((item, index) => {
                const name = getDistanceName(item, language);

                if (!name) {
                  return null;
                }

                return (
                  <div
                    key={`${name}-${index}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 14,
                      padding: "11px 12px",
                      borderRadius: 14,
                      background: "#f8fafc",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          flexShrink: 0,
                          color: "#0f766e",
                        }}
                      >
                        {getModeIcon(item.mode)}
                      </span>

                      <span
                        style={{
                          color: "#334155",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {name}
                      </span>
                    </div>

                    <span
                      style={{
                        flexShrink: 0,
                        color: "#64748b",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {[item.distance, item.duration]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
