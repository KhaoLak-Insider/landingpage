"use client";

import type { ReactNode } from "react";
import {
  BadgeCheck,
  Check,
  Leaf,
  Sparkles,
  Star,
  Waves,
} from "lucide-react";
import type { Language } from "@/src/lib/i18n";
import type { HotelProfileRecord } from "@/src/types/spot";

interface HotelHighlightsProps {
  hotelProfile: HotelProfileRecord;
  language: Language;
  userRole?: string | null;
}

interface HighlightItem {
  title: string;
  description?: string;
  icon?: string;
}

interface HighlightCard {
  title: string;
  description: string;
  icon: ReactNode;
}

const labels = {
  de: {
    eyebrow: "Die besonderen Stärken",
    title: "Warum dieses Resort eine besondere Wahl ist",
    subtitle:
      "Ausgewählte Eigenschaften, die den Aufenthalt prägen und das Resort von anderen Häusern unterscheiden.",
    draft: "Redaktionelle Vorschau",
    draftNotice:
      "Diese Highlights sind noch nicht zur Veröffentlichung freigegeben.",
  },
  en: {
    eyebrow: "The standout qualities",
    title: "Why this resort is a special choice",
    subtitle:
      "Selected qualities that shape the stay and distinguish the resort from other properties.",
    draft: "Editorial preview",
    draftNotice:
      "These highlights have not yet been approved for publication.",
  },
} as const;

function getIcon(icon?: string): ReactNode {
  const normalizedIcon = String(icon || "")
    .trim()
    .toLowerCase();

  if (
    normalizedIcon === "beach" ||
    normalizedIcon === "waves" ||
    normalizedIcon === "strand"
  ) {
    return <Waves size={28} strokeWidth={1.8} />;
  }

  if (
    normalizedIcon === "garden" ||
    normalizedIcon === "leaf" ||
    normalizedIcon === "nature" ||
    normalizedIcon === "garten"
  ) {
    return <Leaf size={28} strokeWidth={1.8} />;
  }

  if (
    normalizedIcon === "verified" ||
    normalizedIcon === "badge" ||
    normalizedIcon === "quality"
  ) {
    return <BadgeCheck size={28} strokeWidth={1.8} />;
  }

  if (
    normalizedIcon === "star" ||
    normalizedIcon === "special"
  ) {
    return <Star size={28} strokeWidth={1.8} />;
  }

  return <Sparkles size={28} strokeWidth={1.8} />;
}

function normalizeHighlights(
  value: unknown
): HighlightCard[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item): HighlightCard | null => {
      if (typeof item === "string") {
        const title = item.trim();

        if (!title) {
          return null;
        }

        return {
          title,
          description: "",
          icon: getIcon(),
        };
      }

      if (
        typeof item === "object" &&
        item !== null
      ) {
        const rawItem = item as Partial<HighlightItem>;

        const title =
          typeof rawItem.title === "string"
            ? rawItem.title.trim()
            : "";

        const description =
          typeof rawItem.description === "string"
            ? rawItem.description.trim()
            : "";

        if (!title) {
          return null;
        }

        return {
          title,
          description,
          icon: getIcon(rawItem.icon),
        };
      }

      return null;
    })
    .filter(
      (item): item is HighlightCard =>
        item !== null
    );
}

export default function HotelHighlights({
  hotelProfile,
  language,
  userRole,
}: HotelHighlightsProps) {
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

  const localizedHighlights =
    language === "en"
      ? hotelProfile.highlights_en
      : hotelProfile.highlights_de;

  const fallbackHighlights =
    language === "en"
      ? hotelProfile.highlights_de
      : hotelProfile.highlights_en;

  let highlights =
    normalizeHighlights(localizedHighlights);

  if (highlights.length === 0) {
    highlights =
      normalizeHighlights(fallbackHighlights);
  }

  if (highlights.length === 0) {
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
        <div
          style={{
            maxWidth: 760,
          }}
        >
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
            <Sparkles size={16} />
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
            "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 18,
        }}
      >
        {highlights.map(
          (highlight, index) => (
            <article
              key={`${highlight.title}-${index}`}
              style={{
                minHeight: 260,
                padding: "26px",
                borderRadius: 24,
                background:
                  index === 0
                    ? "linear-gradient(145deg, #0f172a 0%, #172554 100%)"
                    : "#ffffff",
                border:
                  index === 0
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1px solid #e2e8f0",
                color:
                  index === 0
                    ? "#ffffff"
                    : "#0f172a",
                boxShadow:
                  index === 0
                    ? "0 24px 55px rgba(15,23,42,0.22)"
                    : "0 16px 40px rgba(15,23,42,0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 28,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color:
                    index === 0
                      ? "#5eead4"
                      : "#0f766e",
                  background:
                    index === 0
                      ? "rgba(255,255,255,0.10)"
                      : "#f0fdfa",
                  border:
                    index === 0
                      ? "1px solid rgba(255,255,255,0.12)"
                      : "1px solid #ccfbf1",
                }}
              >
                {highlight.icon}
              </div>

              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 21,
                    lineHeight: 1.25,
                    fontWeight: 800,
                    letterSpacing: "-0.025em",
                  }}
                >
                  {highlight.title}
                </h3>

                {highlight.description && (
                  <p
                    style={{
                      margin: "12px 0 0",
                      color:
                        index === 0
                          ? "rgba(255,255,255,0.78)"
                          : "#64748b",
                      fontSize: 14,
                      lineHeight: 1.75,
                    }}
                  >
                    {highlight.description}
                  </p>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  color:
                    index === 0
                      ? "#99f6e4"
                      : "#0f766e",
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                <Check size={16} strokeWidth={2.5} />
                Khao Lak Insider
              </div>
            </article>
          )
        )}
      </div>
    </section>
  );
}
