"use client";

import type { ReactNode } from "react";
import {
  Baby,
  Check,
  Clock3,
  Droplets,
  GlassWater,
  MapPin,
  ThermometerSun,
  Waves,
} from "lucide-react";
import type { Language } from "@/src/lib/i18n";
import type {
  HotelPoolRecord,
  HotelProfileRecord,
} from "@/src/types/spot";

interface HotelPoolsProps {
  pools: HotelPoolRecord[];
  hotelProfile: HotelProfileRecord;
  language: Language;
  userRole?: string | null;
}

const labels = {
  de: {
    eyebrow: "Pools & Wasserwelten",
    title: "Entspannung und Erfrischung im Resort",
    subtitle:
      "Die Poolbereiche des Resorts mit ihren wichtigsten Eigenschaften im Überblick.",
    mainPool: "Hauptpool",
    infinityPool: "Infinity Pool",
    familyPool: "Familienpool",
    childrenPool: "Kinderpool",
    privatePool: "Privatpool",
    other: "Pool",
    location: "Lage",
    openingHours: "Öffnungszeiten",
    depth: "Tiefe",
    childrenArea: "Kinderbereich",
    poolBar: "Poolbar",
    heated: "Beheizt",
    saltwater: "Salzwasser",
    yes: "Ja",
    draft: "Redaktionelle Vorschau",
    draftNotice:
      "Diese Poolinformationen sind noch nicht zur Veröffentlichung freigegeben.",
  },
  en: {
    eyebrow: "Pools & water experiences",
    title: "Relaxation and refreshment at the resort",
    subtitle:
      "An overview of the resort's pool areas and their key features.",
    mainPool: "Main pool",
    infinityPool: "Infinity pool",
    familyPool: "Family pool",
    childrenPool: "Children's pool",
    privatePool: "Private pool",
    other: "Pool",
    location: "Location",
    openingHours: "Opening hours",
    depth: "Depth",
    childrenArea: "Children's area",
    poolBar: "Pool bar",
    heated: "Heated",
    saltwater: "Saltwater",
    yes: "Yes",
    draft: "Editorial preview",
    draftNotice:
      "This pool information has not yet been approved for publication.",
  },
} as const;

function localizedValue(
  pool: HotelPoolRecord,
  language: Language,
  field:
    | "name"
    | "description"
    | "location"
    | "opening_hours"
): string {
  const primary =
    language === "en"
      ? pool[`${field}_en`]
      : pool[`${field}_de`];

  const fallback =
    language === "en"
      ? pool[`${field}_de`]
      : pool[`${field}_en`];

  if (
    typeof primary === "string" &&
    primary.trim() !== ""
  ) {
    return primary.trim();
  }

  if (
    typeof fallback === "string" &&
    fallback.trim() !== ""
  ) {
    return fallback.trim();
  }

  return "";
}

function localizedHighlights(
  pool: HotelPoolRecord,
  language: Language
): string[] {
  const primary =
    language === "en"
      ? pool.highlights_en
      : pool.highlights_de;

  const fallback =
    language === "en"
      ? pool.highlights_de
      : pool.highlights_en;

  const source = Array.isArray(primary)
    ? primary
    : Array.isArray(fallback)
      ? fallback
      : [];

  return source.filter(
    (item): item is string =>
      typeof item === "string" &&
      item.trim() !== ""
  );
}

function getPoolMeta(
  type: HotelPoolRecord["pool_type"],
  language: Language
): {
  label: string;
  icon: ReactNode;
} {
  const copy = labels[language];

  switch (type) {
    case "main_pool":
      return {
        label: copy.mainPool,
        icon: <Waves size={17} />,
      };

    case "infinity_pool":
      return {
        label: copy.infinityPool,
        icon: <Waves size={17} />,
      };

    case "family_pool":
      return {
        label: copy.familyPool,
        icon: <Baby size={17} />,
      };

    case "children_pool":
      return {
        label: copy.childrenPool,
        icon: <Baby size={17} />,
      };

    case "private_pool":
      return {
        label: copy.privatePool,
        icon: <Droplets size={17} />,
      };

    default:
      return {
        label: copy.other,
        icon: <Droplets size={17} />,
      };
  }
}

function formatDepth(
  min?: number | null,
  max?: number | null
): string {
  if (
    min !== null &&
    min !== undefined &&
    max !== null &&
    max !== undefined
  ) {
    return `${min}–${max} m`;
  }

  if (min !== null && min !== undefined) {
    return `${min} m`;
  }

  if (max !== null && max !== undefined) {
    return `${max} m`;
  }

  return "";
}

export default function HotelPools({
  pools,
  hotelProfile,
  language,
  userRole,
}: HotelPoolsProps) {
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

  if (pools.length === 0) {
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
            <Waves size={17} />
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(290px, 1fr))",
          gap: 18,
        }}
      >
        {pools.map((pool) => {
          const meta = getPoolMeta(
            pool.pool_type,
            language
          );

          const name = localizedValue(
            pool,
            language,
            "name"
          );

          const description = localizedValue(
            pool,
            language,
            "description"
          );

          const location = localizedValue(
            pool,
            language,
            "location"
          );

          const openingHours = localizedValue(
            pool,
            language,
            "opening_hours"
          );

          const highlights = localizedHighlights(
            pool,
            language
          );

          const depth = formatDepth(
            pool.depth_min_m,
            pool.depth_max_m
          );

          return (
            <article
              key={pool.id}
              style={{
                overflow: "hidden",
                borderRadius: 24,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 16px 40px rgba(15,23,42,0.08)",
              }}
            >
              {pool.image_url && (
                <div
                  style={{
                    height: 210,
                    overflow: "hidden",
                    background: "#e2e8f0",
                  }}
                >
                  <img
                    src={pool.image_url}
                    alt={name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}

              <div style={{ padding: 24 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    marginBottom: 11,
                    color: "#0f766e",
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {meta.icon}
                  {meta.label}
                </div>

                <h3
                  style={{
                    margin: 0,
                    color: "#0f172a",
                    fontSize: 22,
                    lineHeight: 1.2,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {name}
                </h3>

                {description && (
                  <p
                    style={{
                      margin: "12px 0 0",
                      color: "#64748b",
                      fontSize: 13,
                      lineHeight: 1.7,
                    }}
                  >
                    {description}
                  </p>
                )}

                {(location ||
                  openingHours ||
                  depth) && (
                  <div
                    style={{
                      display: "grid",
                      gap: 10,
                      marginTop: 20,
                    }}
                  >
                    {location && (
                      <PoolFact
                        icon={<MapPin size={16} />}
                        label={copy.location}
                        value={location}
                      />
                    )}

                    {openingHours && (
                      <PoolFact
                        icon={<Clock3 size={16} />}
                        label={copy.openingHours}
                        value={openingHours}
                      />
                    )}

                    {depth && (
                      <PoolFact
                        icon={<Droplets size={16} />}
                        label={copy.depth}
                        value={depth}
                      />
                    )}
                  </div>
                )}

                {(pool.has_children_area ||
                  pool.has_pool_bar ||
                  pool.is_heated ||
                  pool.is_saltwater) && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(2, minmax(0, 1fr))",
                      gap: 10,
                      marginTop: 18,
                    }}
                  >
                    {pool.has_children_area && (
                      <PoolBadge
                        icon={<Baby size={16} />}
                        label={copy.childrenArea}
                      />
                    )}

                    {pool.has_pool_bar && (
                      <PoolBadge
                        icon={<GlassWater size={16} />}
                        label={copy.poolBar}
                      />
                    )}

                    {pool.is_heated && (
                      <PoolBadge
                        icon={<ThermometerSun size={16} />}
                        label={copy.heated}
                      />
                    )}

                    {pool.is_saltwater && (
                      <PoolBadge
                        icon={<Waves size={16} />}
                        label={copy.saltwater}
                      />
                    )}
                  </div>
                )}

                {highlights.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 18,
                    }}
                  >
                    {highlights.map((highlight) => (
                      <span
                        key={highlight}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "7px 10px",
                          borderRadius: 999,
                          background: "#f0fdfa",
                          color: "#115e59",
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        <Check size={13} />
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function PoolFact({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "11px 12px",
        borderRadius: 14,
        background: "#f8fafc",
        border: "1px solid #f1f5f9",
      }}
    >
      <div
        style={{
          color: "#0f766e",
          marginTop: 1,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            color: "#64748b",
            fontSize: 9,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            marginBottom: 3,
          }}
        >
          {label}
        </div>

        <div
          style={{
            color: "#334155",
            fontSize: 11,
            fontWeight: 700,
            lineHeight: 1.45,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function PoolBadge({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 11px",
        borderRadius: 14,
        background: "#ecfeff",
        color: "#155e75",
        border: "1px solid #cffafe",
        fontSize: 10,
        fontWeight: 800,
      }}
    >
      {icon}
      {label}
    </div>
  );
}
