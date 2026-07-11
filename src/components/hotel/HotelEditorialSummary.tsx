"use client";

import {
  BadgeCheck,
  Quote,
  Sparkles,
} from "lucide-react";
import type { Language } from "@/src/lib/i18n";
import type { HotelProfileRecord } from "@/src/types/spot";

interface HotelEditorialSummaryProps {
  hotelProfile: HotelProfileRecord;
  language: Language;
  userRole?: string | null;
}

const labels = {
  de: {
    eyebrow: "Unsere redaktionelle Einschätzung",
    title: "Warum dieses Resort besonders ist",
    verified: "Redaktionell geprüft",
    draft: "Vorschau",
    draftNotice:
      "Dieser Inhalt ist noch nicht zur Veröffentlichung freigegeben.",
  },
  en: {
    eyebrow: "Our editorial perspective",
    title: "Why this resort stands out",
    verified: "Editorially reviewed",
    draft: "Preview",
    draftNotice:
      "This content has not yet been approved for publication.",
  },
} as const;

function getLocalizedText(
  hotelProfile: HotelProfileRecord,
  language: Language,
  field: "summary" | "editorial_note"
): string {
  const primary =
    language === "en"
      ? hotelProfile[`${field}_en`]
      : hotelProfile[`${field}_de`];

  const fallback =
    language === "en"
      ? hotelProfile[`${field}_de`]
      : hotelProfile[`${field}_en`];

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

export default function HotelEditorialSummary({
  hotelProfile,
  language,
  userRole,
}: HotelEditorialSummaryProps) {
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

  const summary = getLocalizedText(
    hotelProfile,
    language,
    "summary"
  );

  const editorialNote = getLocalizedText(
    hotelProfile,
    language,
    "editorial_note"
  );

  if (!summary && !editorialNote) {
    return null;
  }

  return (
    <section
      style={{
        maxWidth: 1180,
        margin: "0 auto 42px",
        padding: "0 28px",
      }}
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 30,
          padding: "38px 40px",
          background:
            "linear-gradient(135deg, #0f172a 0%, #172554 58%, #0f766e 145%)",
          color: "#ffffff",
          boxShadow:
            "0 24px 60px rgba(15,23,42,0.18)",
        }}
      >
        <Quote
          size={150}
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 24,
            top: 16,
            color: "rgba(255,255,255,0.06)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1fr) minmax(220px, 320px)",
            gap: 42,
            alignItems: "start",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
                color: "#5eead4",
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
                maxWidth: 680,
                fontSize: "clamp(28px, 4vw, 42px)",
                lineHeight: 1.1,
                fontWeight: 800,
                letterSpacing: "-0.04em",
              }}
            >
              {copy.title}
            </h2>

            {summary && (
              <p
                style={{
                  margin: "22px 0 0",
                  maxWidth: 760,
                  color: "rgba(255,255,255,0.88)",
                  fontSize: 17,
                  lineHeight: 1.8,
                }}
              >
                {summary}
              </p>
            )}
          </div>

          <aside
            style={{
              padding: "20px",
              borderRadius: 20,
              background: "rgba(255,255,255,0.09)",
              border:
                "1px solid rgba(255,255,255,0.14)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginBottom: editorialNote ? 14 : 0,
                color: isPublished
                  ? "#99f6e4"
                  : "#fdba74",
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.09em",
              }}
            >
              <BadgeCheck size={18} />
              {isPublished
                ? copy.verified
                : copy.draft}
            </div>

            {editorialNote && (
              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,0.82)",
                  fontSize: 13,
                  lineHeight: 1.7,
                }}
              >
                {editorialNote}
              </p>
            )}

            {!isPublished && isEditor && (
              <p
                style={{
                  margin: editorialNote
                    ? "14px 0 0"
                    : "12px 0 0",
                  paddingTop: editorialNote
                    ? 14
                    : 0,
                  borderTop: editorialNote
                    ? "1px solid rgba(255,255,255,0.12)"
                    : "none",
                  color: "#fed7aa",
                  fontSize: 11,
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}
              >
                {copy.draftNotice}
              </p>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
