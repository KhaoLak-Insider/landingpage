"use client";

import type { HotelForm, SpotForm } from "../types";

interface Props {
  spot: SpotForm;
  hotel: HotelForm;
  setSpot: React.Dispatch<React.SetStateAction<SpotForm>>;
  setHotel: React.Dispatch<React.SetStateAction<HotelForm>>;
}

export default function HotelGeneral({
  spot,
  hotel,
  setSpot,
  setHotel,
}: Props) {
  return (
    <section className="admin-hotel-card">
      <div className="admin-hotel-card__header">
        <div>
          <span>Grunddaten</span>
          <h2>Allgemein</h2>
        </div>
        <p>Daten aus „spots“ und „premium_hotels“.</p>
      </div>

      <div className="admin-hotel-grid admin-hotel-grid--two">
        <label className="admin-hotel-field">
          <span>Hotelname Deutsch</span>
          <input
            value={spot.title}
            onChange={(event) =>
              setSpot((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            required
          />
        </label>

        <label className="admin-hotel-field">
          <span>Hotelname Englisch</span>
          <input
            value={spot.title_en}
            onChange={(event) =>
              setSpot((current) => ({
                ...current,
                title_en: event.target.value,
              }))
            }
          />
        </label>

        <label className="admin-hotel-field">
          <span>Slug</span>
          <input
            value={spot.slug}
            onChange={(event) =>
              setSpot((current) => ({
                ...current,
                slug: event.target.value,
              }))
            }
            required
          />
        </label>

        <label className="admin-hotel-field">
          <span>Hauptbild-URL</span>
          <input
            type="url"
            value={spot.image_url}
            onChange={(event) =>
              setSpot((current) => ({
                ...current,
                image_url: event.target.value,
              }))
            }
          />
        </label>

        <label className="admin-hotel-field">
          <span>Quellen-URL</span>
          <input
            type="url"
            value={hotel.source_url}
            onChange={(event) =>
              setHotel((current) => ({
                ...current,
                source_url: event.target.value,
              }))
            }
          />
        </label>

        <label className="admin-hotel-field">
          <span>Verifiziert am</span>
          <input
            type="datetime-local"
            value={hotel.verified_at}
            onChange={(event) =>
              setHotel((current) => ({
                ...current,
                verified_at: event.target.value,
              }))
            }
          />
        </label>
      </div>

      <div className="admin-hotel-grid admin-hotel-grid--two admin-hotel-grid--spaced">
        <label className="admin-hotel-field">
          <span>Hero-Kurzbeschreibung Deutsch</span>
          <textarea
            rows={3}
            maxLength={320}
            placeholder="Kurzer emotionaler Einstieg für den Hero-Bereich."
            value={hotel.hero_summary_de}
            onChange={(event) =>
              setHotel((current) => ({
                ...current,
                hero_summary_de: event.target.value,
              }))
            }
          />
        </label>

        <label className="admin-hotel-field">
          <span>Hero-Kurzbeschreibung Englisch</span>
          <textarea
            rows={3}
            maxLength={320}
            placeholder="Short introduction for the hero section."
            value={hotel.hero_summary_en}
            onChange={(event) =>
              setHotel((current) => ({
                ...current,
                hero_summary_en: event.target.value,
              }))
            }
          />
        </label>
      </div>

      <div className="admin-hotel-grid admin-hotel-grid--two admin-hotel-grid--spaced">
        <label className="admin-hotel-field">
          <span>Kurzbeschreibung Deutsch</span>
          <textarea
            rows={5}
            value={spot.description}
            onChange={(event) =>
              setSpot((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />
        </label>

        <label className="admin-hotel-field">
          <span>Kurzbeschreibung Englisch</span>
          <textarea
            rows={5}
            value={spot.description_en}
            onChange={(event) =>
              setSpot((current) => ({
                ...current,
                description_en: event.target.value,
              }))
            }
          />
        </label>

        <label className="admin-hotel-field">
          <span>Langbeschreibung Deutsch</span>
          <textarea
            rows={9}
            value={spot.long_description}
            onChange={(event) =>
              setSpot((current) => ({
                ...current,
                long_description: event.target.value,
              }))
            }
          />
        </label>

        <label className="admin-hotel-field">
          <span>Langbeschreibung Englisch</span>
          <textarea
            rows={9}
            value={spot.long_description_en}
            onChange={(event) =>
              setSpot((current) => ({
                ...current,
                long_description_en: event.target.value,
              }))
            }
          />
        </label>
      </div>
    </section>
  );
}