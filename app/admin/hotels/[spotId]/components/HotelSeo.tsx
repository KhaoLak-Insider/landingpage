"use client";

import type { SpotForm } from "../types";

interface Props {
  spot: SpotForm;
  setSpot: React.Dispatch<React.SetStateAction<SpotForm>>;
}

export default function HotelSeo({ spot, setSpot }: Props) {
  return (
    <section className="admin-hotel-card">
      <div className="admin-hotel-card__header">
        <div>
          <span>Suchmaschinen</span>
          <h2>SEO</h2>
        </div>
      </div>

      <div className="admin-hotel-grid admin-hotel-grid--two">
        <label className="admin-hotel-field">
          <span>SEO-Titel Deutsch</span>
          <input
            value={spot.seo_title}
            onChange={(event) =>
              setSpot((current) => ({
                ...current,
                seo_title: event.target.value,
              }))
            }
          />
        </label>

        <label className="admin-hotel-field">
          <span>SEO-Titel Englisch</span>
          <input
            value={spot.seo_title_en}
            onChange={(event) =>
              setSpot((current) => ({
                ...current,
                seo_title_en: event.target.value,
              }))
            }
          />
        </label>

        <label className="admin-hotel-field">
          <span>SEO-Beschreibung Deutsch</span>
          <textarea
            rows={5}
            value={spot.seo_description}
            onChange={(event) =>
              setSpot((current) => ({
                ...current,
                seo_description: event.target.value,
              }))
            }
          />
        </label>

        <label className="admin-hotel-field">
          <span>SEO-Beschreibung Englisch</span>
          <textarea
            rows={5}
            value={spot.seo_description_en}
            onChange={(event) =>
              setSpot((current) => ({
                ...current,
                seo_description_en: event.target.value,
              }))
            }
          />
        </label>
      </div>
    </section>
  );
}
