"use client";

import { Users } from "lucide-react";
import type { RoomForm } from "../types";

interface Props {
  room: RoomForm;
  setRoom: React.Dispatch<React.SetStateAction<RoomForm>>;
}

export default function RoomCapacity({ room, setRoom }: Props) {
  return (
    <section className="admin-room-card">
      <div className="admin-room-card__header">
        <div>
          <span>Eckdaten</span>
          <h2>Größe und Belegung</h2>
        </div>
        <Users size={20} />
      </div>

      <div className="admin-room-grid admin-room-grid--four">
        {[
          ["size_sqm", "Größe in m²", "0.1"],
          ["max_adults", "Max. Erwachsene", "1"],
          ["max_children", "Max. Kinder", "1"],
          ["max_occupancy", "Max. Gesamtbelegung", "1"],
        ].map(([key, label, step]) => (
          <label className="admin-room-field" key={key}>
            <span>{label}</span>
            <input
              type="number"
              min="0"
              step={step}
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
      </div>
      <p className="admin-room-capacity-hint">
        Die Gesamtbelegung bitte ausdrücklich eintragen. Erwachsene und Kinder werden nicht addiert, da es sich um alternative Belegungsvarianten handeln kann.
      </p>
    </section>
  );
}
