"use client";

import { BedDouble } from "lucide-react";
import type { RoomForm } from "../types";

interface Props {
  room: RoomForm;
  setRoom: React.Dispatch<React.SetStateAction<RoomForm>>;
}

export default function RoomGeneral({ room, setRoom }: Props) {
  return (
    <section className="admin-room-card">
      <div className="admin-room-card__header">
        <div>
          <span>Grunddaten</span>
          <h2>Zimmerbezeichnung</h2>
        </div>
        <BedDouble size={20} />
      </div>

      <div className="admin-room-grid admin-room-grid--two">
        <label className="admin-room-field">
          <span>Name Deutsch</span>
          <input
            value={room.name_de}
            onChange={(event) =>
              setRoom((current) => ({ ...current, name_de: event.target.value }))
            }
            required
          />
        </label>

        <label className="admin-room-field">
          <span>Name Englisch</span>
          <input
            value={room.name_en}
            onChange={(event) =>
              setRoom((current) => ({ ...current, name_en: event.target.value }))
            }
          />
        </label>

        <label className="admin-room-field">
          <span>Slug</span>
          <input
            value={room.slug}
            onChange={(event) =>
              setRoom((current) => ({ ...current, slug: event.target.value }))
            }
          />
        </label>

        <label className="admin-room-field">
          <span>Sortierung</span>
          <input
            type="number"
            min="0"
            value={room.sort_order}
            onChange={(event) =>
              setRoom((current) => ({
                ...current,
                sort_order: event.target.value,
              }))
            }
          />
        </label>
      </div>
    </section>
  );
}
