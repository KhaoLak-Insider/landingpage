"use client";

import type { HotelForm } from "../types";

interface Props {
  hotel: HotelForm;
  setHotel: React.Dispatch<React.SetStateAction<HotelForm>>;
}

export default function HotelHighlights({ hotel, setHotel }: Props) {
  const numberFields = [
    ["pool_count", "Swimmingpools"],
    ["room_count", "Zimmer und Villen"],
    ["restaurant_count", "Restaurants"],
    ["bar_count", "Bars"],
  ] as const;

  return (
    <section className="admin-hotel-card">
      <div className="admin-hotel-card__header">
        <div>
          <span>Kennzahlen</span>
          <h2>Highlights</h2>
        </div>
      </div>

      <div className="admin-hotel-grid admin-hotel-grid--four">
        {numberFields.map(([key, label]) => (
          <label className="admin-hotel-field" key={key}>
            <span>{label}</span>
            <input
              type="number"
              min="0"
              value={hotel[key]}
              onChange={(event) =>
                setHotel((current) => ({
                  ...current,
                  [key]: event.target.value,
                }))
              }
            />
          </label>
        ))}
      </div>

      <div className="admin-hotel-checks">
        <label>
          <input
            type="checkbox"
            checked={hotel.suitable_for_families}
            onChange={(event) =>
              setHotel((current) => ({
                ...current,
                suitable_for_families: event.target.checked,
              }))
            }
          />
          <span>
            <strong>Familienfreundlich</strong>
            <small>Hotel eignet sich für Familien.</small>
          </span>
        </label>

        <label>
          <input
            type="checkbox"
            checked={hotel.adults_only}
            onChange={(event) =>
              setHotel((current) => ({
                ...current,
                adults_only: event.target.checked,
              }))
            }
          />
          <span>
            <strong>Adults Only</strong>
            <small>Hotel richtet sich ausschließlich an Erwachsene.</small>
          </span>
        </label>
      </div>
    </section>
  );
}
