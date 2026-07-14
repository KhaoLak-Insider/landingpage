"use client";

import type { HotelForm } from "../types";

interface Props {
  hotel: HotelForm;
  setHotel: React.Dispatch<React.SetStateAction<HotelForm>>;
}

export default function HotelDistances({ hotel, setHotel }: Props) {
  const fields = [
    ["distance_bang_niang_market_m", "Bang Niang Market"],
    ["distance_coconut_beach_m", "Coconut Beach"],
    ["distance_memories_beach_m", "Memories Beach"],
    ["distance_nang_thong_center_m", "Zentrum Nang Thong"],
    ["distance_nearest_exchange_m", "Nächste Wechselstube"],
    ["distance_nearest_7eleven_m", "Nächster 7-Eleven"],
    ["distance_phuket_airport_m", "Flughafen Phuket"],
  ] as const;

  return (
    <section className="admin-hotel-card">
      <div className="admin-hotel-card__header">
        <div>
          <span>Lage</span>
          <h2>Entfernungen</h2>
        </div>
        <p>Alle Werte in Metern.</p>
      </div>

      <div className="admin-hotel-grid admin-hotel-grid--three">
        {fields.map(([key, label]) => (
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
    </section>
  );
}
