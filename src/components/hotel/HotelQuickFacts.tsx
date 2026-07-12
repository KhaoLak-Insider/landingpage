"use client";

import type { ReactNode } from "react";
import {
  BedDouble,
  Check,
  Clock3,
  Coffee,
  GlassWater,
  Sparkles,
  Users,
  Waves,
  WalletCards,
} from "lucide-react";
import type { Language } from "@/src/lib/i18n";
import type { HotelProfileRecord } from "@/src/types/spot";

interface HotelQuickFactsProps {
  hotelProfile: HotelProfileRecord;
  language: Language;
  userRole?: string | null;
}

interface QuickFact {
  key: string;
  label: string;
  value: string;
  icon: ReactNode;
  emphasized?: boolean;
}

const labels = {
  de: {
    eyebrow: "Hotel auf einen Blick",
    title: "Was dieses Resort auszeichnet",
    subtitle:
      "Die wichtigsten bestätigten Fakten kompakt zusammengefasst.",
    rooms: "Zimmer",
    pools: "Pools",
    restaurants: "Restaurants",
    bars: "Bars",
    checkIn: "Check-in",
    checkOut: "Check-out",
    priceLevel: "Preisniveau",
    beachfront: "Direkte Strandlage",
    beachfrontValue: "Am Strand",
    bestFor: "Besonders geeignet für",
    couples: "Paare",
    families: "Familien",
    honeymoon: "Flitterwochen",
    relaxation: "Ruhesuchende",
    draftLabel: "Redaktionelle Vorschau",
    draftNotice:
      "Dieses Hotelprofil ist noch nicht zur Veröffentlichung freigegeben.",
  },
  en: {
    eyebrow: "Hotel at a glance",
    title: "What makes this resort special",
    subtitle:
      "The most important verified facts, clearly summarized.",
    rooms: "Rooms",
    pools: "Pools",
    restaurants: "Restaurants",
    bars: "Bars",
    checkIn: "Check-in",
    checkOut: "Check-out",
    priceLevel: "Price level",
    beachfront: "Direct beachfront location",
    beachfrontValue: "Beachfront",
    bestFor: "Especially suitable for",
    couples: "Couples",
    families: "Families",
    honeymoon: "Honeymooners",
    relaxation: "Relaxation seekers",
    draftLabel: "Editorial preview",
    draftNotice:
      "This hotel profile has not yet been approved for publication.",
  },
} as const;

function formatTime(value?: string | null): string | null {
  if (!value) return null;
  return value.slice(0, 5);
}

function getLocalizedList(
  hotelProfile: HotelProfileRecord,
  language: Language
): string[] {
  const value =
    language === "en"
      ? hotelProfile.best_for_en
      : hotelProfile.best_for_de;

  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim() !== ""
  );
}

export default function HotelQuickFacts({
  hotelProfile,
  language,
  userRole,
}: HotelQuickFactsProps) {
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

  const facts: QuickFact[] = [];

  if (hotelProfile.beachfront === true) {
    facts.push({
      key: "beachfront",
      label: copy.beachfront,
      value: copy.beachfrontValue,
      icon: <Waves size={25} strokeWidth={1.8} />,
      emphasized: true,
    });
  }

  if (
    hotelProfile.room_count !== null &&
    hotelProfile.room_count !== undefined
  ) {
    facts.push({
      key: "rooms",
      label: copy.rooms,
      value: String(hotelProfile.room_count),
      icon: <BedDouble size={24} strokeWidth={1.8} />,
    });
  }

  if (
    hotelProfile.pool_count !== null &&
    hotelProfile.pool_count !== undefined
  ) {
    facts.push({
      key: "pools",
      label: copy.pools,
      value: String(hotelProfile.pool_count),
      icon: <Waves size={24} strokeWidth={1.8} />,
    });
  }

  if (
    hotelProfile.restaurant_count !== null &&
    hotelProfile.restaurant_count !== undefined
  ) {
    facts.push({
      key: "restaurants",
      label: copy.restaurants,
      value: String(hotelProfile.restaurant_count),
      icon: <Coffee size={24} strokeWidth={1.8} />,
    });
  }

  if (
    hotelProfile.bar_count !== null &&
    hotelProfile.bar_count !== undefined
  ) {
    facts.push({
      key: "bars",
      label: copy.bars,
      value: String(hotelProfile.bar_count),
      icon: <GlassWater size={24} strokeWidth={1.8} />,
    });
  }

  const checkIn = formatTime(hotelProfile.check_in_time);

  if (checkIn) {
    facts.push({
      key: "check-in",
      label: copy.checkIn,
      value: checkIn,
      icon: <Clock3 size={24} strokeWidth={1.8} />,
    });
  }

  const checkOut = formatTime(hotelProfile.check_out_time);

  if (checkOut) {
    facts.push({
      key: "check-out",
      label: copy.checkOut,
      value: checkOut,
      icon: <Clock3 size={24} strokeWidth={1.8} />,
    });
  }

  if (
    hotelProfile.price_level !== null &&
    hotelProfile.price_level !== undefined
  ) {
    facts.push({
      key: "price-level",
      label: copy.priceLevel,
      value: "€".repeat(hotelProfile.price_level),
      icon: <WalletCards size={24} strokeWidth={1.8} />,
    });
  }

  const bestFor = getLocalizedList(
    hotelProfile,
    language
  );

  if (hotelProfile.suitable_for_couples === true) {
    bestFor.push(copy.couples);
  }

  if (hotelProfile.suitable_for_families === true) {
    bestFor.push(copy.families);
  }

  if (hotelProfile.suitable_for_honeymoon === true) {
    bestFor.push(copy.honeymoon);
  }

  if (hotelProfile.suitable_for_relaxation === true) {
    bestFor.push(copy.relaxation);
  }

  const uniqueBestFor = [...new Set(bestFor)];

  if (facts.length === 0 && uniqueBestFor.length === 0) {
    return null;
  }

  return (
    <section
      style={{
        position: "relative",
        zIndex: 6,
        maxWidth: 1220,
        margin: "42px auto 38px",
        padding: "0 28px",
      }}
    >
      <div
        style={{
          overflow: "hidden",
          borderRadius: 30,
          background: "#ffffff",
          border: "1px solid rgba(226,232,240,0.95)",
          boxShadow:
            "0 26px 70px rgba(15,23,42,0.16)",
        }}
      >
        <div
          style={{
            padding: "30px 32px 26px",
            background:
              "linear-gradient(135deg, #ffffff 0%, #f8fafc 55%, #ecfeff 100%)",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: 700 }}>
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
                  letterSpacing: "0.14em",
                }}
              >
                <Sparkles size={16} strokeWidth={2} />
                {copy.eyebrow}
              </div>

              <h2
                style={{
                  margin: 0,
                  color: "#0f172a",
                  fontSize: "clamp(24px, 3vw, 34px)",
                  lineHeight: 1.15,
                  fontWeight: 800,
                  letterSpacing: "-0.035em",
                }}
              >
                {copy.title}
              </h2>

              <p
                style={{
                  margin: "10px 0 0",
                  maxWidth: 620,
                  color: "#64748b",
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                {copy.subtitle}
              </p>
            </div>

            {!isPublished && isEditor && (
              <div
                style={{
                  maxWidth: 300,
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
                  {copy.draftLabel}
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
        </div>

        {facts.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 0,
              borderBottom:
                uniqueBestFor.length > 0
                  ? "1px solid #e2e8f0"
                  : "none",
            }}
          >
            {facts.map((fact, index) => (
              <div
                key={fact.key}
                style={{
                  minHeight: 160,
                  padding: "26px 24px",
                  background: fact.emphasized
                    ? "linear-gradient(145deg, #f0fdfa 0%, #ecfeff 100%)"
                    : "#ffffff",
                  borderRight:
                    index < facts.length - 1
                      ? "1px solid #e2e8f0"
                      : "none",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 24,
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#0f766e",
                    background: fact.emphasized
                      ? "#ccfbf1"
                      : "#f0fdfa",
                    boxShadow:
                      "inset 0 0 0 1px rgba(20,184,166,0.10)",
                  }}
                >
                  {fact.icon}
                </div>

                <div>
                  <div
                    style={{
                      marginBottom: 7,
                      color: "#64748b",
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {fact.label}
                  </div>

                  <div
                    style={{
                      color: "#0f172a",
                      fontSize: fact.emphasized ? 18 : 23,
                      lineHeight: 1.2,
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {fact.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {uniqueBestFor.length > 0 && (
          <div
            style={{
              padding: "25px 32px 30px",
              background:
                "linear-gradient(135deg, #f8fafc 0%, #f0fdfa 100%)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 17,
                color: "#334155",
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0f766e",
                  background: "#ffffff",
                  border: "1px solid #ccfbf1",
                }}
              >
                <Users size={18} strokeWidth={2} />
              </div>

              {copy.bestFor}
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 11,
              }}
            >
              {uniqueBestFor.map((item) => (
                <span
                  key={item}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 15px",
                    borderRadius: 999,
                    background: "#ffffff",
                    border: "1px solid #ccfbf1",
                    color: "#115e59",
                    fontSize: 12,
                    fontWeight: 700,
                    boxShadow:
                      "0 7px 18px rgba(15,118,110,0.07)",
                  }}
                >
                  <Check size={15} strokeWidth={2.5} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}