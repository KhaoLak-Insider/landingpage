"use client";

import { useState } from "react";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { uploadHotelImage } from "@/src/lib/r2-images";
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
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function uploadHero(file: File) {
    if (!spot.slug.trim()) {
      setUploadError("Bitte zuerst einen Hotel-Slug eintragen.");
      return;
    }

    setIsUploadingHero(true);
    setUploadError(null);
    try {
      const imageUrl = await uploadHotelImage(file, spot.slug, "hero");
      setSpot((current) => ({ ...current, image_url: imageUrl }));
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Hero-Bild konnte nicht hochgeladen werden.",
      );
    } finally {
      setIsUploadingHero(false);
    }
  }

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

        <div className="admin-hotel-field">
          <span>Hero-Bild hochladen</span>
          <label className="admin-hotel-upload">
            {isUploadingHero ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            <span>{isUploadingHero ? "Wird in R2 geladen …" : "Bild auswählen"}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              disabled={isUploadingHero}
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadHero(file);
                event.target.value = "";
              }}
            />
          </label>
          {uploadError && <small>{uploadError}</small>}
          {spot.image_url && (
            <div className="admin-hotel-hero-preview">
              <img src={spot.image_url} alt={spot.title || "Hotel Hero"} />
            </div>
          )}
          {!spot.image_url && <small><ImageIcon size={14} /> Noch kein Hero-Bild hinterlegt.</small>}
        </div>

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
