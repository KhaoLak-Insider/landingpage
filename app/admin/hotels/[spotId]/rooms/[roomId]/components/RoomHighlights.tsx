"use client";

import { Sparkles } from "lucide-react";
import type { RoomForm } from "../types";
import ArrayEditor from "./ArrayEditor";

interface Props {
  room: RoomForm;
  setRoom: React.Dispatch<React.SetStateAction<RoomForm>>;
}

export default function RoomHighlights({ room, setRoom }: Props) {
  return (
    <section className="admin-room-card">
      <div className="admin-room-card__header">
        <div>
          <span>Besondere Merkmale</span>
          <h2>Highlights</h2>
        </div>
        <Sparkles size={20} />
      </div>

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
