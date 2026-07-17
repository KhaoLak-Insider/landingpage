"use client";

import { useState } from "react";
import { Languages, Loader2 } from "lucide-react";
import { translateTexts } from "@/src/lib/admin/deepl";
import type { RoomForm } from "../types";
import ArrayEditor from "./ArrayEditor";

interface Props {
  room: RoomForm;
  setRoom: React.Dispatch<React.SetStateAction<RoomForm>>;
}

export default function RoomAmenities({ room, setRoom }: Props) {
  const [isTranslating, setIsTranslating] = useState<"de-en" | "en-de" | null>(null);
  const [translationMessage, setTranslationMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function translateAmenities(direction: "de-en" | "en-de") {
    const source = direction === "de-en" ? room.amenities_de : room.amenities_en;
    const texts = source.map((text) => text.trim()).filter(Boolean);
    if (!texts.length) {
      setTranslationMessage({
        type: "error",
        text: direction === "de-en" ? "Keine deutsche Ausstattung vorhanden." : "Keine englische Ausstattung vorhanden.",
      });
      return;
    }

    setIsTranslating(direction);
    setTranslationMessage(null);
    try {
      const translations = await translateTexts(texts, direction === "de-en"
        ? { sourceLang: "DE", targetLang: "EN-GB" }
        : { sourceLang: "EN", targetLang: "DE" });
      setRoom((current) => direction === "de-en"
        ? { ...current, amenities_en: translations }
        : { ...current, amenities_de: translations });
      setTranslationMessage({ type: "success", text: "Ausstattung übersetzt. Bitte Zimmer speichern." });
    } catch (error) {
      setTranslationMessage({ type: "error", text: error instanceof Error ? error.message : "Übersetzung fehlgeschlagen." });
    } finally {
      setIsTranslating(null);
    }
  }

  return (
    <section className="admin-room-card">
      <div className="admin-room-card__header">
        <div>
          <span>Komfort</span>
          <h2>Ausstattung</h2>
        </div>
      </div>

      <div className="admin-room-translation-actions">
        <button type="button" disabled={isTranslating !== null} onClick={() => void translateAmenities("de-en")}>
          {isTranslating === "de-en" ? <Loader2 size={14} className="admin-room-editor__spinner" /> : <Languages size={14} />}
          Ausstattung DE → EN
        </button>
        <button type="button" disabled={isTranslating !== null} onClick={() => void translateAmenities("en-de")}>
          {isTranslating === "en-de" ? <Loader2 size={14} className="admin-room-editor__spinner" /> : <Languages size={14} />}
          Ausstattung EN → DE
        </button>
      </div>
      {translationMessage && (
        <small className={`admin-ai-message admin-ai-message--${translationMessage.type}`}>{translationMessage.text}</small>
      )}

      <div className="admin-room-grid admin-room-grid--two">
        <ArrayEditor
          title="Ausstattung Deutsch"
          description="Alle verfügbaren Ausstattungsmerkmale."
          values={room.amenities_de}
          placeholder="z. B. Klimaanlage"
          onChange={(values) =>
            setRoom((current) => ({ ...current, amenities_de: values }))
          }
        />

        <ArrayEditor
          title="Ausstattung Englisch"
          description="Englische Version in gleicher Reihenfolge."
          values={room.amenities_en}
          placeholder="e.g. Air conditioning"
          onChange={(values) =>
            setRoom((current) => ({ ...current, amenities_en: values }))
          }
        />
      </div>
    </section>
  );
}
