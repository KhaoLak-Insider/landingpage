"use client";

import type { HotelForm } from "../types";
import ArrayEditor from "./ArrayEditor";

interface Props {
  hotel: HotelForm;
  setHotel: React.Dispatch<React.SetStateAction<HotelForm>>;
}

export default function HotelIntroFeatures({ hotel, setHotel }: Props) {
  return (
    <section className="admin-hotel-card">
      <div className="admin-hotel-card__header">
        <div>
          <span>Einleitung</span>
          <h2>Intro-Features</h2>
        </div>
      </div>

      <div className="admin-hotel-grid admin-hotel-grid--two">
        <ArrayEditor
          title="Intro-Features Deutsch"
          description="Kurze, besonders sichtbare Eigenschaften des Hotels."
          values={hotel.intro_features_de}
          placeholder="z. B. Direkter Strandzugang"
          onChange={(values) =>
            setHotel((current) => ({
              ...current,
              intro_features_de: values,
            }))
          }
        />

        <ArrayEditor
          title="Intro-Features Englisch"
          description="Englische Version in derselben Reihenfolge."
          values={hotel.intro_features_en}
          placeholder="e.g. Direct beach access"
          onChange={(values) =>
            setHotel((current) => ({
              ...current,
              intro_features_en: values,
            }))
          }
        />
      </div>
    </section>
  );
}
