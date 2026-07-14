"use client";

import type { RoomForm } from "../types";

interface Props {
  room: RoomForm;
  setRoom: React.Dispatch<React.SetStateAction<RoomForm>>;
}

export default function RoomDescriptions({ room, setRoom }: Props) {
  return (
    <section className="admin-room-card">
      <div className="admin-room-card__header">
        <div>
          <span>Beschreibung</span>
          <h2>Texte</h2>
        </div>
      </div>

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
