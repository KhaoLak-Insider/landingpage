"use client";

import {
  ArrowRight,
  Beer,
  Check,
  Clock3,
  Coffee,
  MapPin,
  UtensilsCrossed,
} from "lucide-react";
import type { Language } from "@/src/lib/i18n";
import type {
  HotelProfileRecord,
  HotelRestaurantRecord,
} from "@/src/types/spot";

interface HotelRestaurantsProps {
  venues: HotelRestaurantRecord[];
  hotelProfile: HotelProfileRecord;
  language: Language;
  userRole?: string | null;
}

const labels = {
  de: {
    eyebrow: "Restaurants & Bars",
    title: "Kulinarik innerhalb des Resorts",
    subtitle:
      "Restaurants, Bars und Cafés mit ihren Konzepten, Öffnungszeiten und wichtigsten Angeboten.",
    restaurant: "Restaurant",
    bar: "Bar",
    cafe: "Café",
    cuisine: "Küche & Konzept",
    location: "Lage",
    openingHours: "Öffnungszeiten",
    breakfast: "Frühstück",
    lunch: "Mittagessen",
    dinner: "Abendessen",
    drinks: "Getränke",
    menu: "Menü ansehen",
    reservation: "Reservieren",
    draft: "Redaktionelle Vorschau",
    draftNotice:
      "Diese Gastronomieinformationen sind noch nicht zur Veröffentlichung freigegeben.",
  },
  en: {
    eyebrow: "Restaurants & bars",
    title: "Dining within the resort",
    subtitle:
      "Restaurants, bars and cafés with their concepts, opening hours and key offerings.",
    restaurant: "Restaurant",
    bar: "Bar",
    cafe: "Café",
    cuisine: "Cuisine & concept",
    location: "Location",
    openingHours: "Opening hours",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    drinks: "Drinks",
    menu: "View menu",
    reservation: "Reserve",
    draft: "Editorial preview",
    draftNotice:
      "This dining information has not yet been approved for publication.",
  },
} as const;

function localizedValue(
  venue: HotelRestaurantRecord,
  language: Language,
  field:
    | "name"
    | "description"
    | "cuisine"
    | "location"
    | "opening_hours"
): string {
  const primary =
    language === "en"
      ? venue[`${field}_en`]
      : venue[`${field}_de`];

  const fallback =
    language === "en"
      ? venue[`${field}_de`]
      : venue[`${field}_en`];

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
  venue: HotelRestaurantRecord,
  language: Language
): string[] {
  const primary =
    language === "en"
      ? venue.highlights_en
      : venue.highlights_de;

  const fallback =
    language === "en"
      ? venue.highlights_de
      : venue.highlights_en;

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

export default function HotelRestaurants({
  venues,
  hotelProfile,
  language,
  userRole,
}: HotelRestaurantsProps) {
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

  if (venues.length === 0) {
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
            <UtensilsCrossed size={17} />
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
        {venues.map((venue) => {
          const name =
            localizedValue(venue, language, "name");

          const description =
            localizedValue(
              venue,
              language,
              "description"
            );

          const cuisine =
            localizedValue(
              venue,
              language,
              "cuisine"
            );

          const location =
            localizedValue(
              venue,
              language,
              "location"
            );

          const openingHours =
            localizedValue(
              venue,
              language,
              "opening_hours"
            );

          const highlights =
            localizedHighlights(venue, language);

          const services = [
            venue.serves_breakfast
              ? copy.breakfast
              : "",
            venue.serves_lunch
              ? copy.lunch
              : "",
            venue.serves_dinner
              ? copy.dinner
              : "",
            venue.serves_drinks
              ? copy.drinks
              : "",
          ].filter(Boolean);

          const typeLabel =
            venue.venue_type === "bar"
              ? copy.bar
              : venue.venue_type === "cafe"
                ? copy.cafe
                : copy.restaurant;

          const TypeIcon =
            venue.venue_type === "bar"
              ? Beer
              : venue.venue_type === "cafe"
                ? Coffee
                : UtensilsCrossed;

          return (
            <article
              key={venue.id}
              style={{
                overflow: "hidden",
                borderRadius: 24,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 16px 40px rgba(15,23,42,0.08)",
              }}
            >
              {venue.image_url && (
                <div
                  style={{
                    position: "relative",
                    height: 215,
                    overflow: "hidden",
                    background: "#e2e8f0",
                  }}
                >
                  <img
                    src={venue.image_url}
                    alt={name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      left: 14,
                      top: 14,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "8px 11px",
                      borderRadius: 999,
                      background:
                        "rgba(15,23,42,0.82)",
                      color: "#ffffff",
                      fontSize: 10,
                      fontWeight: 800,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <TypeIcon size={14} />
                    {typeLabel}
                  </div>
                </div>
              )}

              <div style={{ padding: 24 }}>
                {!venue.image_url && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      marginBottom: 12,
                      color: "#0f766e",
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    <TypeIcon size={15} />
                    {typeLabel}
                  </div>
                )}

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
                  {cuisine && (
                    <VenueFact
                      icon={
                        <UtensilsCrossed size={16} />
                      }
                      label={copy.cuisine}
                      value={cuisine}
                    />
                  )}

                  {location && (
                    <VenueFact
                      icon={<MapPin size={16} />}
                      label={copy.location}
                      value={location}
                    />
                  )}

                  {openingHours && (
                    <VenueFact
                      icon={<Clock3 size={16} />}
                      label={copy.openingHours}
                      value={openingHours}
                    />
                  )}
                </div>

                {services.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 18,
                    }}
                  >
                    {services.map((service) => (
                      <span
                        key={service}
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
                        {service}
                      </span>
                    ))}
                  </div>
                )}

                {highlights.length > 0 && (
                  <ul
                    style={{
                      margin: "18px 0 0",
                      padding: 0,
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {highlights.map((highlight) => (
                      <li
                        key={highlight}
                        style={{
                          display: "flex",
                          gap: 8,
                          color: "#475569",
                          fontSize: 11,
                          lineHeight: 1.5,
                        }}
                      >
                        <Check
                          size={15}
                          color="#0f766e"
                          style={{ flexShrink: 0 }}
                        />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                )}

                {(venue.menu_url ||
                  venue.reservation_url) && (
                  <div
                    style={{
                      marginTop: 22,
                      paddingTop: 18,
                      borderTop: "1px solid #e2e8f0",
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    {venue.menu_url && (
                      <VenueLink
                        href={venue.menu_url}
                        label={copy.menu}
                        primary={false}
                      />
                    )}

                    {venue.reservation_url && (
                      <VenueLink
                        href={venue.reservation_url}
                        label={copy.reservation}
                        primary
                      />
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

function VenueFact({
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

function VenueLink({
  href,
  label,
  primary,
}: {
  href: string;
  label: string;
  primary: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "10px 13px",
        borderRadius: 12,
        background: primary
          ? "#0f766e"
          : "#f1f5f9",
        color: primary
          ? "#ffffff"
          : "#334155",
        textDecoration: "none",
        fontSize: 11,
        fontWeight: 800,
      }}
    >
      {label}
      <ArrowRight size={15} />
    </a>
  );
}
