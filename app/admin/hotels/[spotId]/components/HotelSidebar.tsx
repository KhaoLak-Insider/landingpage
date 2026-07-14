"use client";

import { Loader2, Save } from "lucide-react";
import type { ContentStatus, HotelForm, SpotForm } from "../types";

interface Props {
  spot: SpotForm;
  hotel: HotelForm;
  isSaving: boolean;
  roomCount: number;
  setHotel: React.Dispatch<React.SetStateAction<HotelForm>>;
}

export default function HotelSidebar({
  spot,
  hotel,
  isSaving,
  roomCount,
  setHotel,
}: Props) {
  return (
    <aside className="admin-hotel-editor__sidebar">
      <section className="admin-hotel-sidecard">
        <span className="admin-hotel-sidecard__label">Status</span>

        <label className="admin-hotel-field">
          <select
            value={hotel.status}
            onChange={(event) =>
              setHotel((current) => ({
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
          className={`admin-hotel-status admin-hotel-status--${hotel.status}`}
        >
          <span />
          {hotel.status === "published"
            ? "Hotel ist veröffentlicht"
            : hotel.status === "archived"
              ? "Hotel ist archiviert"
              : "Hotel ist ein Entwurf"}
        </div>
      </section>

      <section className="admin-hotel-sidecard">
        <span className="admin-hotel-sidecard__label">Vollständigkeit</span>

        <dl className="admin-hotel-meta">
          <div>
            <dt>Intro-Features DE</dt>
            <dd>{hotel.intro_features_de.length}</dd>
          </div>
          <div>
            <dt>Galeriebilder</dt>
            <dd>{hotel.gallery_images.length}</dd>
          </div>
          <div>
            <dt>FAQ-Einträge</dt>
            <dd>{hotel.faq_items.length}</dd>
          </div>
          <div>
            <dt>Zimmertypen</dt>
            <dd>{roomCount}</dd>
          </div>
        </dl>
      </section>

      <section className="admin-hotel-sidecard">
        <span className="admin-hotel-sidecard__label">Datensatz</span>

        <dl className="admin-hotel-meta">
          <div>
            <dt>Spot-ID</dt>
            <dd>{spot.id}</dd>
          </div>
          <div>
            <dt>Hotel-ID</dt>
            <dd>{hotel.id}</dd>
          </div>
        </dl>
      </section>

      <button
        type="submit"
        className="admin-hotel-editor__save admin-hotel-editor__save--wide"
        disabled={isSaving}
      >
        {isSaving ? (
          <Loader2 size={16} className="admin-hotel-editor__spinner" />
        ) : (
          <Save size={16} />
        )}
        {isSaving ? "Wird gespeichert …" : "Alles speichern"}
      </button>
    </aside>
  );
}
