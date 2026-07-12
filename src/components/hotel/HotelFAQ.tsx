"use client";

import { useState } from "react";
import {
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import type { Language } from "@/src/lib/i18n";
import type {
  HotelFaqRecord,
  HotelProfileRecord,
} from "@/src/types/spot";

interface HotelFAQProps {
  faqs: HotelFaqRecord[];
  hotelProfile: HotelProfileRecord;
  language: Language;
  userRole?: string | null;
}

const labels = {
  de: {
    eyebrow: "Insider-FAQ",
    title: "Häufige Fragen vor der Buchung",
    subtitle:
      "Antworten auf praktische Fragen, die für die Auswahl des Resorts wirklich wichtig sind.",
    draft: "Redaktionelle Vorschau",
    draftNotice:
      "Diese Antworten sind noch nicht zur Veröffentlichung freigegeben.",
  },
  en: {
    eyebrow: "Insider FAQ",
    title: "Frequently asked questions before booking",
    subtitle:
      "Answers to practical questions that genuinely matter when choosing the resort.",
    draft: "Editorial preview",
    draftNotice:
      "These answers have not yet been approved for publication.",
  },
} as const;

function localizedValue(
  faq: HotelFaqRecord,
  language: Language,
  field: "question" | "answer"
): string {
  const primary =
    language === "en"
      ? faq[`${field}_en`]
      : faq[`${field}_de`];

  const fallback =
    language === "en"
      ? faq[`${field}_de`]
      : faq[`${field}_en`];

  if (typeof primary === "string" && primary.trim()) {
    return primary.trim();
  }

  if (typeof fallback === "string" && fallback.trim()) {
    return fallback.trim();
  }

  return "";
}

export default function HotelFAQ({
  faqs,
  hotelProfile,
  language,
  userRole,
}: HotelFAQProps) {
  const copy = labels[language];

  const normalizedRole = String(userRole || "")
    .trim()
    .toLowerCase();

  const isEditor =
    normalizedRole === "admin" ||
    normalizedRole === "editor";

  const isPublished =
    hotelProfile.status === "published";

  const [openId, setOpenId] = useState<string | null>(
    faqs[0]?.id || null
  );

  if (!isPublished && !isEditor) {
    return null;
  }

  if (faqs.length === 0) {
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
            <HelpCircle size={17} />
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
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {faqs.map((faq) => {
          const question = localizedValue(
            faq,
            language,
            "question"
          );

          const answer = localizedValue(
            faq,
            language,
            "answer"
          );

          if (!question || !answer) {
            return null;
          }

          const isOpen = openId === faq.id;

          return (
            <article
              key={faq.id}
              style={{
                overflow: "hidden",
                borderRadius: 18,
                background: "#ffffff",
                border: isOpen
                  ? "1px solid #99f6e4"
                  : "1px solid #e2e8f0",
                boxShadow: isOpen
                  ? "0 12px 28px rgba(15,118,110,0.08)"
                  : "none",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setOpenId(isOpen ? null : faq.id)
                }
                aria-expanded={isOpen}
                style={{
                  width: "100%",
                  padding: "18px 20px",
                  border: "none",
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 18,
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div>
                  <div
                    style={{
                      marginBottom: 5,
                      color: "#0f766e",
                      fontSize: 9,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {faq.category}
                  </div>

                  <div
                    style={{
                      color: "#0f172a",
                      fontSize: 14,
                      lineHeight: 1.45,
                      fontWeight: 800,
                    }}
                  >
                    {question}
                  </div>
                </div>

                <ChevronDown
                  size={19}
                  color="#0f766e"
                  style={{
                    flexShrink: 0,
                    transform: isOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 180ms ease",
                  }}
                />
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: "0 20px 19px",
                    color: "#64748b",
                    fontSize: 12,
                    lineHeight: 1.75,
                  }}
                >
                  {answer}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
