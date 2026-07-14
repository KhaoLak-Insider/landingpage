"use client";

import type { HotelForm } from "../types";
import FaqEditor from "./FaqEditor";

interface Props {
  hotel: HotelForm;
  setHotel: React.Dispatch<React.SetStateAction<HotelForm>>;
}

export default function HotelFaq({ hotel, setHotel }: Props) {
  return (
    <section className="admin-hotel-card">
      <div className="admin-hotel-card__header">
        <div>
          <span>Häufige Fragen</span>
          <h2>FAQ</h2>
        </div>
        <p>{hotel.faq_items.length} Einträge</p>
      </div>

      <FaqEditor
        items={hotel.faq_items}
        onChange={(items) =>
          setHotel((current) => ({
            ...current,
            faq_items: items,
          }))
        }
      />
    </section>
  );
}
