"use client";

import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  Coffee,
  GlassWater,
  MapPin,
  Soup,
  UtensilsCrossed,
} from "lucide-react";
import type { Language } from "@/src/lib/i18n";
import type {
  HotelProfileRecord,
  HotelRestaurantRecord,
} from "@/src/types/spot";

interface HotelRestaurantsProps {
  restaurants: HotelRestaurantRecord[];
  hotelProfile: HotelProfileRecord;
  language: Language;
  userRole?: string | null;
}

const labels = {
  de: {
    eyebrow: "Restaurants & Bars",
    title: "Kulinarik innerhalb des Resorts",
    subtitle:
      "Restaurants, Bars und Cafés mit ihren wichtigsten Informationen im Überblick.",
    restaurant: "Restaurant",
    bar: "Bar",
    cafe: "Café",
    beachBar: "Strandbar",
    other: "Gastronomie",
    cuisine: "Küche",
    location: "Lage",
    openingHours: "Öffnungszeiten",
    reservation: "Mehr erfahren",
    draft: "Redaktionelle Vorschau",
    draftNotice:
      "Diese Gastronomieinformationen sind noch nicht zur Veröffentlichung freigegeben.",
  },
  en: {
    eyebrow: "Restaurants & bars",
    title: "Dining within the resort",
    subtitle:
      "An overview of the resort's restaurants, bars and cafés.",
    restaurant: "Restaurant",
    bar: "Bar",
    cafe: "Café",
    beachBar: "Beach bar",
    other: "Dining venue",
    cuisine: "Cuisine",
    location: "Location",
    openingHours: "Opening hours",
    reservation: "Learn more",
    draft: "Editorial preview",
    draftNotice:
      "This dining information has not yet been approved for publication.",
  },
} as const;

function localizedValue(
  restaurant: HotelRestaurantRecord,
  language: Language,
  field:
    | "description"
    | "cuisine"
    | "location"
    | "opening_hours"
): string {
  const primary =
    language === "en"
      ? restaurant[`${field}_en`]
      : restaurant[`${field}_de`];

  const fallback =
    language === "en"
      ? restaurant[`${field}_de`]
      : restaurant[`${field}_en`];

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
  restaurant: HotelRestaurantRecord,
  language: Language
): string[] {
  const primary =
    language === "en"
      ? restaurant.highlights_en
      : restaurant.highlights_de;

  const fallback =
    language === "en"
      ? restaurant.highlights_de
      : restaurant.highlights_en;

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

function getVenueMeta(
  type: HotelRestaurantRecord["venue_type"],
  language: Language
): {
  label: string;
  icon: ReactNode;
} {
  const copy = labels[language];

  switch (type) {
    case "bar":
      return {
        label: copy.bar,
        icon: <GlassWater size={17} />,
      };

    case "cafe":
      return {
        label: copy.cafe,
        icon: <Coffee size={17} />,
      };

    case "beach_bar":
      return {
        label: copy.beachBar,
        icon: <GlassWater size={17} />,
      };

    case "restaurant":
      return {
        label: copy.restaurant,
        icon: <UtensilsCrossed size={17} />,
      };

    default:
      return {
        label: copy.other,
        icon: <Soup size={17} />,
      };
  }
}

export default function HotelRestaurants({
  restaurants,
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

  if (restaurants.length === 0) {
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
        {restaurants.map((restaurant) => {
          const venue = getVenueMeta(
            restaurant.venue_type,
            language
          );

          const description = localizedValue(
            restaurant,
            language,
            "description"
          );

          const cuisine = localizedValue(
            restaurant,
            language,
            "cuisine"
          );

          const location = localizedValue(
            restaurant,
            language,
            "location"
          );

          const openingHours = localizedValue(
            restaurant,
            language,
            "opening_hours"
          );

          const highlights = localizedHighlights(
            restaurant,
            language
          );

          return (
            <article
              key={restaurant.id}
              style={{
                overflow: "hidden",
                borderRadius: 24,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 16px 40px rgba(15,23,42,0.08)",
              }}
            >
              {restaurant.image_url && (
                <div
                  style={{
                    height: 210,
                    overflow: "hidden",
                    background: "#e2e8f0",
                  }}
                >
                  <img
                    src={restaurant.image_url}
                    alt={restaurant.name}
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
                  {venue.icon}
                  {venue.label}
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
                  {restaurant.name}
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

                {(cuisine ||
                  location ||
                  openingHours) && (
                  <div
                    style={{
                      display: "grid",
                      gap: 10,
                      marginTop: 20,
                    }}
                  >
                    {cuisine && (
                      <RestaurantFact
                        icon={<UtensilsCrossed size={16} />}
                        label={copy.cuisine}
                        value={cuisine}
                      />
                    )}

                    {location && (
                      <RestaurantFact
                        icon={<MapPin size={16} />}
                        label={copy.location}
                        value={location}
                      />
                    )}

                    {openingHours && (
                      <RestaurantFact
                        icon={<Clock3 size={16} />}
                        label={copy.openingHours}
                        value={openingHours}
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

                {restaurant.reservation_url && (
                  <div
                    style={{
                      marginTop: 22,
                      paddingTop: 18,
                      borderTop: "1px solid #e2e8f0",
                    }}
                  >
                    <a
                      href={restaurant.reservation_url}
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
                      {copy.reservation}
                      <ArrowRight size={15} />
                    </a>
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

function RestaurantFact({
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
