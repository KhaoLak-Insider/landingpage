"use client";

import { useMemo, useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
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
      "Antworten auf die häufigsten Fragen rund um deinen Aufenthalt im Hotel.",
    draft: "Redaktionelle Vorschau",
    draftNotice:
      "Diese Antworten sind noch nicht zur Veröffentlichung freigegeben.",
  },
  en: {
    eyebrow: "Insider FAQ",
    title: "Frequently asked questions before booking",
    subtitle:
      "Answers to the most common questions about your stay.",
    draft: "Editorial preview",
    draftNotice:
      "These answers have not yet been approved for publication.",
  },
} as const;

function localizedValue(
  faq: HotelFaqRecord,
  language: Language,
  field: "question" | "answer",
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

  const preparedFaqs = useMemo(
    () =>
      [...faqs]
        .sort((first, second) => {
          const firstOrder = Number(first.sort_order || 0);
          const secondOrder = Number(second.sort_order || 0);

          return firstOrder - secondOrder;
        })
        .map((faq) => ({
          faq,
          question: localizedValue(faq, language, "question"),
          answer: localizedValue(faq, language, "answer"),
        }))
        .filter(
          (item) =>
            item.question.length > 0 &&
            item.answer.length > 0,
        ),
    [faqs, language],
  );

  const [openId, setOpenId] = useState<string | null>(
    preparedFaqs[0]?.faq.id || null,
  );

  if (!isPublished && !isEditor) {
    return null;
  }

  if (preparedFaqs.length === 0) {
    return null;
  }

  return (
    <section className="hotel-faq">
      <header className="hotel-faq__header">
        <div className="hotel-faq__heading">
          <div className="hotel-faq__eyebrow">
            <HelpCircle size={15} />
            <span>{copy.eyebrow}</span>
          </div>

          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>

        {!isPublished && isEditor && (
          <div className="hotel-faq__draft">
            <strong>{copy.draft}</strong>
            <span>{copy.draftNotice}</span>
          </div>
        )}
      </header>

      <div className="hotel-faq__list">
        {preparedFaqs.map(({ faq, question, answer }) => {
          const isOpen = openId === faq.id;

          return (
            <article
              key={faq.id}
              className={`hotel-faq__item${
                isOpen ? " is-open" : ""
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  setOpenId(isOpen ? null : faq.id)
                }
                aria-expanded={isOpen}
                className="hotel-faq__button"
              >
                <span>{question}</span>

                <ChevronDown
                  size={18}
                  className="hotel-faq__icon"
                  aria-hidden="true"
                />
              </button>

              <div
                className="hotel-faq__answer-wrap"
                aria-hidden={!isOpen}
              >
                <div className="hotel-faq__answer-inner">
                  <p>{answer}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <style jsx>{`
        .hotel-faq {
          width: 100%;
          padding: 22px;
        }

        .hotel-faq__header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 20px;
        }

        .hotel-faq__heading {
          max-width: 720px;
        }

        .hotel-faq__eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 8px;
          color: #0f8f91;
          font-size: 10px;
          line-height: 1.3;
          font-weight: 800;
          letter-spacing: 0.11em;
          text-transform: uppercase;
        }

        .hotel-faq__heading h2 {
          margin: 0;
          color: #10233f;
          font-size: clamp(24px, 3vw, 30px);
          line-height: 1.2;
          font-weight: 750;
          letter-spacing: -0.035em;
        }

        .hotel-faq__heading p {
          max-width: 620px;
          margin: 9px 0 0;
          color: #66768a;
          font-size: 12.5px;
          line-height: 1.65;
        }

        .hotel-faq__draft {
          display: flex;
          max-width: 290px;
          flex-direction: column;
          gap: 4px;
          padding: 12px 14px;
          border: 1px solid #fed7aa;
          border-radius: 13px;
          background: #fff7ed;
          color: #9a3412;
        }

        .hotel-faq__draft strong {
          font-size: 9px;
          line-height: 1.3;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .hotel-faq__draft span {
          font-size: 10.5px;
          line-height: 1.5;
          font-weight: 600;
        }

        .hotel-faq__list {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .hotel-faq__item {
          overflow: hidden;
          border: 1px solid #e5ebef;
          border-radius: 14px;
          background: #ffffff;
          transition:
            border-color 180ms ease,
            box-shadow 180ms ease,
            background 180ms ease;
        }

        .hotel-faq__item.is-open {
          border-color: #cfe6e7;
          background: #fcfefe;
          box-shadow: 0 10px 24px rgba(15, 35, 62, 0.05);
        }

        .hotel-faq__button {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 17px 18px;
          border: 0;
          background: transparent;
          color: #10233f;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.45;
          font-weight: 700;
          text-align: left;
          cursor: pointer;
        }

        .hotel-faq__button span {
          min-width: 0;
        }

        .hotel-faq__icon {
          flex: 0 0 auto;
          color: #0f8f91;
          transition: transform 200ms ease;
        }

        .hotel-faq__item.is-open .hotel-faq__icon {
          transform: rotate(180deg);
        }

        .hotel-faq__answer-wrap {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          transition:
            grid-template-rows 220ms ease,
            opacity 180ms ease;
        }

        .hotel-faq__item.is-open .hotel-faq__answer-wrap {
          grid-template-rows: 1fr;
          opacity: 1;
        }

        .hotel-faq__answer-inner {
          min-height: 0;
          overflow: hidden;
        }

        .hotel-faq__answer-inner p {
          margin: 0;
          padding: 0 18px 18px;
          color: #5f6f82;
          font-size: 13px;
          line-height: 1.75;
        }

        @media (max-width: 720px) {
          .hotel-faq {
            padding: 18px;
          }

          .hotel-faq__header {
            align-items: stretch;
            flex-direction: column;
            gap: 16px;
          }

          .hotel-faq__draft {
            max-width: none;
          }

          .hotel-faq__button {
            padding: 16px;
            font-size: 13.5px;
          }

          .hotel-faq__answer-inner p {
            padding: 0 16px 16px;
            font-size: 12.5px;
          }
        }
      `}</style>
    </section>
  );
}