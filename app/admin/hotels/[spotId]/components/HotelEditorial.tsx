"use client";

import type { HotelForm } from "../types";

interface Props {
  hotel: HotelForm;
  setHotel: React.Dispatch<React.SetStateAction<HotelForm>>;
}

export default function HotelEditorial({ hotel, setHotel }: Props) {
  return (
    <section className="admin-hotel-card">
      <div className="admin-hotel-card__header">
        <div>
          <span>Premium-Inhalt</span>
          <h2>Editorial</h2>
        </div>
      </div>

      <div className="admin-hotel-grid admin-hotel-grid--two">
        <label className="admin-hotel-field">
          <span>Editorial Deutsch</span>
          <textarea
            rows={9}
            value={hotel.editorial_summary_de}
            onChange={(event) =>
              setHotel((current) => ({
                ...current,
                editorial_summary_de: event.target.value,
              }))
            }
          />
        </label>

        <label className="admin-hotel-field">
          <span>Editorial Englisch</span>
          <textarea
            rows={9}
            value={hotel.editorial_summary_en}
            onChange={(event) =>
              setHotel((current) => ({
                ...current,
                editorial_summary_en: event.target.value,
              }))
            }
          />
        </label>
      </div>
    </section>
  );
}
