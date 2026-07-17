"use client";

import { useState } from "react";
import { Languages, Loader2, Sparkles } from "lucide-react";
import { translateTexts } from "@/src/lib/admin/deepl";
import type { RoomForm } from "../types";
import ArrayEditor from "./ArrayEditor";

interface Props {
  room: RoomForm;
  setRoom: React.Dispatch<React.SetStateAction<RoomForm>>;
}

export default function RoomHighlights({ room, setRoom }: Props) {
  const [isTranslating, setIsTranslating] = useState<"de-en" | "en-de" | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);

  async function translate(direction: "de-en" | "en-de") {
    const source = direction === "de-en" ? room.highlights_de : room.highlights_en;
    const texts = source.map((text) => text.trim()).filter(Boolean);
    if (!texts.length) {
      setTranslationError(direction === "de-en" ? "Keine deutschen Highlights vorhanden." : "Keine englischen Highlights vorhanden.");
      return;
    }
    setIsTranslating(direction);
    setTranslationError(null);
    try {
      const translations = await translateTexts(texts, direction === "de-en"
        ? { sourceLang: "DE", targetLang: "EN-GB" }
        : { sourceLang: "EN", targetLang: "DE" });
      setRoom((current) => direction === "de-en"
        ? { ...current, highlights_en: translations }
        : { ...current, highlights_de: translations });
    } catch (error) {
      setTranslationError(error instanceof Error ? error.message : "Übersetzung fehlgeschlagen.");
    } finally {
      setIsTranslating(null);
    }
  }

  return (
    <section className="admin-room-card">
      <div className="admin-room-card__header">
        <div>
          <span>Besondere Merkmale</span>
          <h2>Highlights</h2>
        </div>
        <Sparkles size={20} />
      </div>

      <div className="admin-room-translation-actions">
        <button type="button" disabled={isTranslating !== null} onClick={() => void translate("de-en")}>
          {isTranslating === "de-en" ? <Loader2 size={14} className="admin-room-editor__spinner" /> : <Languages size={14} />}
          Deutsch → Englisch
        </button>
        <button type="button" disabled={isTranslating !== null} onClick={() => void translate("en-de")}>
          {isTranslating === "en-de" ? <Loader2 size={14} className="admin-room-editor__spinner" /> : <Languages size={14} />}
          Englisch → Deutsch
        </button>
      </div>
      {translationError && <small>{translationError}</small>}

      <div className="admin-room-grid admin-room-grid--two">
        <ArrayEditor
          title="Highlights Deutsch"
          description="Die wichtigsten Besonderheiten des Zimmers."
          values={room.highlights_de}
          placeholder="z. B. Direkter Poolzugang"
          onChange={(values) =>
            setRoom((current) => ({ ...current, highlights_de: values }))
          }
        />

        <ArrayEditor
          title="Highlights Englisch"
          description="Englische Version in gleicher Reihenfolge."
          values={room.highlights_en}
          placeholder="e.g. Direct pool access"
          onChange={(values) =>
            setRoom((current) => ({ ...current, highlights_en: values }))
          }
        />
      </div>
    </section>
  );
}
