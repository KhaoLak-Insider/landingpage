"use client";

import {
  ArrowRight,
  BedDouble,
  Check,
  Maximize2,
  Mountain,
  Users,
} from "lucide-react";
import type { Language } from "@/src/lib/i18n";
import type {
  HotelProfileRecord,
  HotelRoomRecord,
} from "@/src/types/spot";

interface HotelRoomsProps {
  rooms: HotelRoomRecord[];
  hotelProfile: HotelProfileRecord;
  language: Language;
  userRole?: string | null;
}

const labels = {
  de: {
    eyebrow: "Zimmer & Villen",
    title: "Unterkünfte für unterschiedliche Reisewünsche",
    subtitle:
      "Die verfügbaren Zimmerkategorien mit ihren wichtigsten Merkmalen im Überblick.",
    size: "Größe",
    guests: "Belegung",
    adults: "Erwachsene",
    children: "Kinder",
    bed: "Bett",
    view: "Ausblick",
    from: "ab",
    perNight: "pro Nacht",
    details: "Zimmer ansehen",
    draft: "Redaktionelle Vorschau",
    draftNotice:
      "Diese Zimmerinformationen sind noch nicht zur Veröffentlichung freigegeben.",
  },
  en: {
    eyebrow: "Rooms & villas",
    title: "Accommodation for different travel styles",
    subtitle:
      "An overview of the available room categories and their key features.",
    size: "Size",
    guests: "Occupancy",
    adults: "adults",
    children: "children",
    bed: "Bed",
    view: "View",
    from: "from",
    perNight: "per night",
    details: "View room",
    draft: "Editorial preview",
    draftNotice:
      "This room information has not yet been approved for publication.",
  },
} as const;

function localizedValue(
  room: HotelRoomRecord,
  language: Language,
  field:
    | "name"
    | "description"
    | "bed_type"
    | "view"
): string {
  const primary =
    language === "en"
      ? room[`${field}_en`]
      : room[`${field}_de`];

  const fallback =
    language === "en"
      ? room[`${field}_de`]
      : room[`${field}_en`];

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
  room: HotelRoomRecord,
  language: Language
): string[] {
  const primary =
    language === "en"
      ? room.highlights_en
      : room.highlights_de;

  const fallback =
    language === "en"
      ? room.highlights_de
      : room.highlights_en;

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

function formatPrice(
  price: number,
  currency?: string | null
): string {
  const normalizedCurrency =
    currency?.trim().toUpperCase() || "EUR";

  try {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: normalizedCurrency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${price} ${normalizedCurrency}`;
  }
}

export default function HotelRooms({
  rooms,
  hotelProfile,
  language,
  userRole,
}: HotelRoomsProps) {
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

  if (rooms.length === 0) {
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
            <BedDouble size={17} />
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
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 18,
        }}
      >
        {rooms.map((room) => {
          const name =
            localizedValue(room, language, "name");

          const description =
            localizedValue(
              room,
              language,
              "description"
            );

          const bedType =
            localizedValue(
              room,
              language,
              "bed_type"
            );

          const view =
            localizedValue(room, language, "view");

          const highlights =
            localizedHighlights(room, language);

          const totalGuests =
            (room.max_adults || 0) +
            (room.max_children || 0);

          return (
            <article
              key={room.id}
              style={{
                overflow: "hidden",
                borderRadius: 24,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 16px 40px rgba(15,23,42,0.08)",
              }}
            >
              {room.image_url && (
                <div
                  style={{
                    height: 210,
                    overflow: "hidden",
                    background: "#e2e8f0",
                  }}
                >
                  <img
                    src={room.image_url}
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

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(2, minmax(0, 1fr))",
                    gap: 10,
                    marginTop: 20,
                  }}
                >
                  {room.size_sqm && (
                    <RoomFact
                      icon={<Maximize2 size={16} />}
                      label={copy.size}
                      value={`${room.size_sqm} m²`}
                    />
                  )}

                  {totalGuests > 0 && (
                    <RoomFact
                      icon={<Users size={16} />}
                      label={copy.guests}
                      value={[
                        room.max_adults
                          ? `${room.max_adults} ${copy.adults}`
                          : "",
                        room.max_children
                          ? `${room.max_children} ${copy.children}`
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    />
                  )}

                  {bedType && (
                    <RoomFact
                      icon={<BedDouble size={16} />}
                      label={copy.bed}
                      value={bedType}
                    />
                  )}

                  {view && (
                    <RoomFact
                      icon={<Mountain size={16} />}
                      label={copy.view}
                      value={view}
                    />
                  )}
                </div>

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

                {(room.price_from ||
                  room.booking_url) && (
                  <div
                    style={{
                      marginTop: 22,
                      paddingTop: 18,
                      borderTop: "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                    }}
                  >
                    {room.price_from ? (
                      <div>
                        <div
                          style={{
                            color: "#64748b",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          {copy.from}
                        </div>

                        <div
                          style={{
                            color: "#0f172a",
                            fontSize: 19,
                            fontWeight: 800,
                          }}
                        >
                          {formatPrice(
                            room.price_from,
                            room.currency
                          )}
                        </div>

                        <div
                          style={{
                            color: "#94a3b8",
                            fontSize: 9,
                          }}
                        >
                          {copy.perNight}
                        </div>
                      </div>
                    ) : (
                      <div />
                    )}

                    {room.booking_url && (
                      <a
                        href={room.booking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                          padding: "10px 13px",
                          borderRadius: 12,
                          background: "#0f766e",
                          color: "#ffffff",
                          textDecoration: "none",
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        {copy.details}
                        <ArrowRight size={15} />
                      </a>
                    )}
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

function RoomFact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "11px 12px",
        borderRadius: 14,
        background: "#f8fafc",
        border: "1px solid #f1f5f9",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "#0f766e",
          marginBottom: 5,
        }}
      >
        {icon}
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}
        >
          {label}
        </span>
      </div>

      <div
        style={{
          color: "#334155",
          fontSize: 11,
          fontWeight: 700,
          lineHeight: 1.4,
        }}
      >
        {value}
      </div>
    </div>
  );
}
