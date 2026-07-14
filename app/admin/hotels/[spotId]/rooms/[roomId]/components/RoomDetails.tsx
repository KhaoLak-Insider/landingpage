"use client";

import { Bath } from "lucide-react";
import type { RoomForm } from "../types";

interface Props {
  room: RoomForm;
  setRoom: React.Dispatch<React.SetStateAction<RoomForm>>;
}

export default function RoomDetails({ room, setRoom }: Props) {
  return (
    <section className="admin-room-card">
      <div className="admin-room-card__header">
        <div>
          <span>Ausstattungsdetails</span>
          <h2>Bett, Aussicht und Badezimmer</h2>
        </div>
        <Bath size={20} />
      </div>

      <div className="admin-room-grid admin-room-grid--two">
        {[
          ["bed_type_de", "Bettentyp Deutsch"],
          ["bed_type_en", "Bettentyp Englisch"],
          ["view_de", "Aussicht Deutsch"],
          ["view_en", "Aussicht Englisch"],
        ].map(([key, label]) => (
          <label className="admin-room-field" key={key}>
            <span>{label}</span>
            <input
              value={room[key as keyof RoomForm] as string}
              onChange={(event) =>
                setRoom((current) => ({
                  ...current,
                  [key]: event.target.value,
                }))
              }
            />
          </label>
        ))}

        <label className="admin-room-field">
          <span>Badezimmer Deutsch</span>
          <textarea
            rows={5}
            value={room.bathroom_de}
            onChange={(event) =>
              setRoom((current) => ({
                ...current,
                bathroom_de: event.target.value,
              }))
            }
          />
        </label>

        <label className="admin-room-field">
          <span>Badezimmer Englisch</span>
          <textarea
            rows={5}
            value={room.bathroom_en}
            onChange={(event) =>
              setRoom((current) => ({
                ...current,
                bathroom_en: event.target.value,
              }))
            }
          />
        </label>
      </div>
    </section>
  );
}
