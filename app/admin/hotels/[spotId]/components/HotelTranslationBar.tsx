"use client";

import { useState } from "react";
import { Languages, Loader2, TriangleAlert, Check } from "lucide-react";
import { translateTexts } from "@/src/lib/admin/deepl";
import type { HotelForm, SpotForm } from "../types";

type TranslationMode = "empty" | "overwrite";

interface Props {
  spot: SpotForm;
  hotel: HotelForm;
  setSpot: React.Dispatch<React.SetStateAction<SpotForm>>;
  setHotel: React.Dispatch<React.SetStateAction<HotelForm>>;
}

interface TranslationEntry {
  source: string;
  shouldTranslate: boolean;
  apply: (translation: string) => void;
}

export default function HotelTranslationBar({
  spot,
  hotel,
  setSpot,
  setHotel,
}: Props) {
  const [mode, setMode] = useState<TranslationMode>("empty");
  const [isTranslating, setIsTranslating] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function translateAll() {
    setIsTranslating(true);
    setMessage(null);

    try {
      const entries: TranslationEntry[] = [];

      function addEntry(
        source: string,
        target: string | null | undefined,
        apply: (translation: string) => void,
      ) {
        const cleanedSource = source.trim();

        if (!cleanedSource) {
          return;
        }

        entries.push({
          source: cleanedSource,
          shouldTranslate:
            mode === "overwrite" || !String(target || "").trim(),
          apply,
        });
      }

      addEntry(spot.title, spot.title_en, (translation) =>
        setSpot((current) => ({ ...current, title_en: translation })),
      );

      addEntry(spot.description, spot.description_en, (translation) =>
        setSpot((current) => ({
          ...current,
          description_en: translation,
        })),
      );

      addEntry(
        spot.long_description,
        spot.long_description_en,
        (translation) =>
          setSpot((current) => ({
            ...current,
            long_description_en: translation,
          })),
      );

      addEntry(spot.seo_title, spot.seo_title_en, (translation) =>
        setSpot((current) => ({
          ...current,
          seo_title_en: translation,
        })),
      );

      addEntry(
        spot.seo_description,
        spot.seo_description_en,
        (translation) =>
          setSpot((current) => ({
            ...current,
            seo_description_en: translation,
          })),
      );

      addEntry(
        hotel.hero_summary_de,
        hotel.hero_summary_en,
        (translation) =>
          setHotel((current) => ({
            ...current,
            hero_summary_en: translation,
          })),
      );

      addEntry(
        hotel.editorial_summary_de,
        hotel.editorial_summary_en,
        (translation) =>
          setHotel((current) => ({
            ...current,
            editorial_summary_en: translation,
          })),
      );

      hotel.intro_features_de.forEach((source, index) => {
        addEntry(
          source,
          hotel.intro_features_en[index],
          (translation) =>
            setHotel((current) => {
              const next = [...current.intro_features_en];
              next[index] = translation;
              return { ...current, intro_features_en: next };
            }),
        );
      });

      hotel.gallery_images.forEach((image, index) => {
        addEntry(image.title_de, image.title_en, (translation) =>
          setHotel((current) => ({
            ...current,
            gallery_images: current.gallery_images.map(
              (currentImage, currentIndex) =>
                currentIndex === index
                  ? { ...currentImage, title_en: translation }
                  : currentImage,
            ),
          })),
        );

        addEntry(image.alt_de, image.alt_en, (translation) =>
          setHotel((current) => ({
            ...current,
            gallery_images: current.gallery_images.map(
              (currentImage, currentIndex) =>
                currentIndex === index
                  ? { ...currentImage, alt_en: translation }
                  : currentImage,
            ),
          })),
        );
      });

      hotel.faq_items.forEach((faq, index) => {
        addEntry(faq.question_de, faq.question_en, (translation) =>
          setHotel((current) => ({
            ...current,
            faq_items: current.faq_items.map((currentFaq, currentIndex) =>
              currentIndex === index
                ? { ...currentFaq, question_en: translation }
                : currentFaq,
            ),
          })),
        );

        addEntry(faq.answer_de, faq.answer_en, (translation) =>
          setHotel((current) => ({
            ...current,
            faq_items: current.faq_items.map((currentFaq, currentIndex) =>
              currentIndex === index
                ? { ...currentFaq, answer_en: translation }
                : currentFaq,
            ),
          })),
        );
      });

      const pendingEntries = entries.filter(
        (entry) => entry.shouldTranslate,
      );

      if (pendingEntries.length === 0) {
        setMessage({
          type: "success",
          text:
            mode === "empty"
              ? "Alle vorhandenen deutschen Texte besitzen bereits eine englische Version."
              : "Es sind keine deutschen Texte zum Übersetzen vorhanden.",
        });
        return;
      }

      const translations = await translateTexts(
        pendingEntries.map((entry) => entry.source),
        {
          sourceLang: "DE",
          targetLang: "EN-GB",
        },
      );

      pendingEntries.forEach((entry, index) => {
        entry.apply(translations[index]);
      });

      setMessage({
        type: "success",
        text: `${translations.length} Texte wurden übersetzt. Bitte anschließend das Hotel speichern.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Die Übersetzung ist fehlgeschlagen.",
      });
    } finally {
      setIsTranslating(false);
    }
  }

  return (
    <section className="hotel-translation-bar">
      <div className="hotel-translation-bar__content">
        <span className="hotel-translation-bar__icon">
          <Languages size={19} />
        </span>

        <div>
          <strong>Englische Inhalte mit DeepL erstellen</strong>
          <p>
            Übersetzt Hoteltexte, Intro-Features, Galerie-Texte und FAQ.
          </p>
        </div>
      </div>

      <div className="hotel-translation-bar__controls">
        <select
          value={mode}
          onChange={(event) =>
            setMode(event.target.value as TranslationMode)
          }
          disabled={isTranslating}
          aria-label="Übersetzungsmodus"
        >
          <option value="empty">Nur leere englische Felder</option>
          <option value="overwrite">
            Vorhandene englische Felder überschreiben
          </option>
        </select>

        <button
          type="button"
          onClick={() => void translateAll()}
          disabled={isTranslating}
        >
          {isTranslating ? (
            <Loader2 size={15} className="hotel-translation-bar__spinner" />
          ) : (
            <Languages size={15} />
          )}
          {isTranslating ? "Übersetzt …" : "Alle Texte übersetzen"}
        </button>
      </div>

      {message && (
        <div
          className={`hotel-translation-bar__message hotel-translation-bar__message--${message.type}`}
        >
          {message.type === "success" ? (
            <Check size={15} />
          ) : (
            <TriangleAlert size={15} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <style jsx>{`
        .hotel-translation-bar {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 16px;
          margin-top: 22px;
          padding: 15px 17px;
          border: 1px solid #cfe8e9;
          border-radius: 14px;
          background: linear-gradient(135deg, #f2fbfb, #ffffff);
          box-shadow: 0 8px 24px rgba(7, 156, 165, 0.06);
        }

        .hotel-translation-bar__content {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 12px;
        }

        .hotel-translation-bar__icon {
          display: inline-flex;
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: #dff7f6;
          color: #078f96;
        }

        .hotel-translation-bar strong {
          display: block;
          color: #17324b;
          font-size: 11px;
        }

        .hotel-translation-bar p {
          margin: 4px 0 0;
          color: #718096;
          font-size: 9px;
          line-height: 1.5;
        }

        .hotel-translation-bar__controls {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .hotel-translation-bar select {
          height: 39px;
          padding: 0 11px;
          border: 1px solid #d5e2e6;
          border-radius: 10px;
          outline: none;
          background: #fff;
          color: #435469;
          font: inherit;
          font-size: 9px;
        }

        .hotel-translation-bar button {
          display: inline-flex;
          min-height: 39px;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 13px;
          border: 0;
          border-radius: 10px;
          background: #079ca5;
          color: #fff;
          font: inherit;
          font-size: 9px;
          font-weight: 800;
          cursor: pointer;
        }

        .hotel-translation-bar button:disabled,
        .hotel-translation-bar select:disabled {
          cursor: wait;
          opacity: 0.65;
        }

        .hotel-translation-bar__message {
          display: flex;
          grid-column: 1 / -1;
          align-items: center;
          gap: 7px;
          padding-top: 10px;
          border-top: 1px solid #dcecee;
          font-size: 9px;
          font-weight: 700;
        }

        .hotel-translation-bar__message--success {
          color: #087b58;
        }

        .hotel-translation-bar__message--error {
          color: #be123c;
        }

        .hotel-translation-bar__spinner {
          animation: hotelTranslationSpin 0.8s linear infinite;
        }

        @keyframes hotelTranslationSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 850px) {
          .hotel-translation-bar {
            grid-template-columns: 1fr;
          }

          .hotel-translation-bar__controls {
            align-items: stretch;
            flex-direction: column;
          }

          .hotel-translation-bar select,
          .hotel-translation-bar button {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
