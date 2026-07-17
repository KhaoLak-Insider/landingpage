"use client";

import { useState } from "react";
import { Languages, Loader2 } from "lucide-react";
import { translateTexts } from "@/src/lib/admin/deepl";
import type { RoomForm } from "../types";

interface Props {
  room: RoomForm;
  setRoom: React.Dispatch<React.SetStateAction<RoomForm>>;
}

export default function RoomDescriptions({ room, setRoom }: Props) {
  const [isTranslating, setIsTranslating] = useState<"short-de-en" | "short-en-de" | "long-de-en" | "long-en-de" | null>(null);
  const [translationMessage, setTranslationMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function translateDescription(direction: "de-en" | "en-de") {
    const source = direction === "de-en" ? room.description_de.trim() : room.description_en.trim();
    if (!source) {
      setTranslationMessage({
        type: "error",
        text: direction === "de-en" ? "Keine deutsche Langbeschreibung vorhanden." : "Keine englische Langbeschreibung vorhanden.",
      });
      return;
    }

    setIsTranslating(direction === "de-en" ? "long-de-en" : "long-en-de");
    setTranslationMessage(null);
    try {
      const [translation] = await translateTexts([source], direction === "de-en"
        ? { sourceLang: "DE", targetLang: "EN-GB" }
        : { sourceLang: "EN", targetLang: "DE" });

      setRoom((current) => direction === "de-en"
        ? { ...current, description_en: translation }
        : { ...current, description_de: translation });
      setTranslationMessage({ type: "success", text: "Langbeschreibung übersetzt. Bitte Zimmer speichern." });
    } catch (error) {
      setTranslationMessage({ type: "error", text: error instanceof Error ? error.message : "Übersetzung fehlgeschlagen." });
    } finally {
      setIsTranslating(null);
    }
  }

  async function translateShortDescription(direction: "de-en" | "en-de") {
    const source = direction === "de-en" ? room.short_description_de.trim() : room.short_description_en.trim();
    if (!source) {
      setTranslationMessage({
        type: "error",
        text: direction === "de-en" ? "Keine deutsche Kurzbeschreibung vorhanden." : "Keine englische Kurzbeschreibung vorhanden.",
      });
      return;
    }

    setIsTranslating(direction === "de-en" ? "short-de-en" : "short-en-de");
    setTranslationMessage(null);
    try {
      const [translation] = await translateTexts([source], direction === "de-en"
        ? { sourceLang: "DE", targetLang: "EN-GB" }
        : { sourceLang: "EN", targetLang: "DE" });
      setRoom((current) => direction === "de-en"
        ? { ...current, short_description_en: translation }
        : { ...current, short_description_de: translation });
      setTranslationMessage({ type: "success", text: "Kurzbeschreibung übersetzt. Bitte Zimmer speichern." });
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
          <span>Beschreibung</span>
          <h2>Texte</h2>
        </div>
      </div>

      <div className="admin-room-translation-actions">
        <button type="button" disabled={isTranslating !== null} onClick={() => void translateShortDescription("de-en")}>
          {isTranslating === "short-de-en" ? <Loader2 size={14} className="admin-room-editor__spinner" /> : <Languages size={14} />}
          Kurzbeschreibung DE → EN
        </button>
        <button type="button" disabled={isTranslating !== null} onClick={() => void translateShortDescription("en-de")}>
          {isTranslating === "short-en-de" ? <Loader2 size={14} className="admin-room-editor__spinner" /> : <Languages size={14} />}
          Kurzbeschreibung EN → DE
        </button>
      </div>

      <div className="admin-room-translation-actions">
        <button type="button" disabled={isTranslating !== null} onClick={() => void translateDescription("de-en")}>
          {isTranslating === "long-de-en" ? <Loader2 size={14} className="admin-room-editor__spinner" /> : <Languages size={14} />}
          Langbeschreibung DE → EN
        </button>
        <button type="button" disabled={isTranslating !== null} onClick={() => void translateDescription("en-de")}>
          {isTranslating === "long-en-de" ? <Loader2 size={14} className="admin-room-editor__spinner" /> : <Languages size={14} />}
          Langbeschreibung EN → DE
        </button>
      </div>
      {translationMessage && (
        <small className={`admin-ai-message admin-ai-message--${translationMessage.type}`}>{translationMessage.text}</small>
      )}

      <div className="admin-room-grid admin-room-grid--two">
        <label className="admin-room-field">
          <span>Kurzbeschreibung Deutsch</span>
          <textarea
            rows={6}
            value={room.short_description_de}
            onChange={(event) =>
              setRoom((current) => ({
                ...current,
                short_description_de: event.target.value,
              }))
            }
          />
        </label>

        <label className="admin-room-field">
          <span>Kurzbeschreibung Englisch</span>
          <textarea
            rows={6}
            value={room.short_description_en}
            onChange={(event) =>
              setRoom((current) => ({
                ...current,
                short_description_en: event.target.value,
              }))
            }
          />
        </label>

        <label className="admin-room-field">
          <span>Langbeschreibung Deutsch</span>
          <textarea
            rows={10}
            value={room.description_de}
            onChange={(event) =>
              setRoom((current) => ({
                ...current,
                description_de: event.target.value,
              }))
            }
          />
        </label>

        <label className="admin-room-field">
          <span>Langbeschreibung Englisch</span>
          <textarea
            rows={10}
            value={room.description_en}
            onChange={(event) =>
              setRoom((current) => ({
                ...current,
                description_en: event.target.value,
              }))
            }
          />
        </label>
      </div>
    </section>
  );
}
