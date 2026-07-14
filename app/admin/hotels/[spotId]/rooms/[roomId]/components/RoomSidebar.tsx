"use client";

import { Loader2, Save } from "lucide-react";
import type {
  ContentStatus,
  HotelReference,
  RoomForm,
  SpotReference,
} from "../types";

interface Props {
  room: RoomForm;
  hotel: HotelReference | null;
  spot: SpotReference | null;
  isSaving: boolean;
  setRoom: React.Dispatch<React.SetStateAction<RoomForm>>;
}

export default function RoomSidebar({
  room,
  hotel,
  spot,
  isSaving,
  setRoom,
}: Props) {
  return (
    <aside className="admin-room-editor__sidebar">
      <section className="admin-room-sidecard">
        <span className="admin-room-sidecard__label">Status</span>

        <label className="admin-room-field">
          <select
            value={room.status}
            onChange={(event) =>
              setRoom((current) => ({
                ...current,
                status: event.target.value as ContentStatus,
              }))
            }
          >
            <option value="draft">Entwurf</option>
            <option value="published">Veröffentlicht</option>
            <option value="archived">Archiviert</option>
          </select>
        </label>

        <div
          className={`admin-room-status admin-room-status--${room.status}`}
        >
          <span />
          {room.status === "published"
            ? "Zimmer ist veröffentlicht"
            : room.status === "archived"
              ? "Zimmer ist archiviert"
              : "Zimmer ist ein Entwurf"}
        </div>
      </section>

      <section className="admin-room-sidecard">
        <span className="admin-room-sidecard__label">Vollständigkeit</span>

        <dl className="admin-room-meta">
          <div>
            <dt>Highlights DE</dt>
            <dd>{room.highlights_de.length}</dd>
          </div>
          <div>
            <dt>Highlights EN</dt>
            <dd>{room.highlights_en.length}</dd>
          </div>
          <div>
            <dt>Ausstattung DE</dt>
            <dd>{room.amenities_de.length}</dd>
          </div>
          <div>
            <dt>Galeriebilder</dt>
            <dd>{room.images.length}</dd>
          </div>
        </dl>
      </section>

      <section className="admin-room-sidecard">
        <span className="admin-room-sidecard__label">Datensatz</span>

        <dl className="admin-room-meta">
          <div>
            <dt>Zimmer-ID</dt>
            <dd>{room.id}</dd>
          </div>
          <div>
            <dt>Hotel-ID</dt>
            <dd>{hotel?.id || "–"}</dd>
          </div>
          <div>
            <dt>Spot-ID</dt>
            <dd>{spot?.id || "–"}</dd>
          </div>
        </dl>
      </section>

      <button
        type="submit"
        className="admin-room-editor__save admin-room-editor__save--wide"
        disabled={isSaving}
      >
        {isSaving ? (
          <Loader2 size={16} className="admin-room-editor__spinner" />
        ) : (
          <Save size={16} />
        )}
        {isSaving ? "Wird gespeichert …" : "Alles speichern"}
      </button>
    </aside>
  );
}
