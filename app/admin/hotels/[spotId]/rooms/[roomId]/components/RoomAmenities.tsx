"use client";

import type { RoomForm } from "../types";
import ArrayEditor from "./ArrayEditor";

interface Props {
  room: RoomForm;
  setRoom: React.Dispatch<React.SetStateAction<RoomForm>>;
}

export default function RoomAmenities({ room, setRoom }: Props) {
  return (
    <section className="admin-room-card">
      <div className="admin-room-card__header">
        <div>
          <span>Komfort</span>
          <h2>Ausstattung</h2>
        </div>
      </div>

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
