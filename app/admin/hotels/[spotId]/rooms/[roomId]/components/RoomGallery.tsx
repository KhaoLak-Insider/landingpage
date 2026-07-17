"use client";

import { useState } from "react";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { uploadRoomImage } from "@/src/lib/r2-images";
import type { RoomForm } from "../types";
import ImageEditor from "./ImageEditor";

interface Props {
  room: RoomForm;
  hotelSlug: string;
  setRoom: React.Dispatch<React.SetStateAction<RoomForm>>;
}

export default function RoomGallery({ room, hotelSlug, setRoom }: Props) {
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function uploadCover(file: File) {
    if (!hotelSlug.trim() || !room.slug.trim()) {
      setUploadError("Hotel- und Zimmer-Slug werden für den Upload benötigt.");
      return;
    }
    setIsUploadingCover(true);
    setUploadError(null);
    try {
      const url = await uploadRoomImage(file, hotelSlug, room.slug, "cover");
      setRoom((current) => ({ ...current, cover_image_url: url }));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload fehlgeschlagen.");
    } finally {
      setIsUploadingCover(false);
    }
  }

  return (
    <>
      <section className="admin-room-card">
        <div className="admin-room-card__header">
          <div>
            <span>Medien</span>
            <h2>Titelbild</h2>
          </div>
          <ImageIcon size={20} />
        </div>

        <label className="admin-room-field">
          <span>Titelbild-URL</span>
          <input
            type="url"
            value={room.cover_image_url}
            onChange={(event) =>
              setRoom((current) => ({
                ...current,
                cover_image_url: event.target.value,
              }))
            }
          />
        </label>

        <label className="admin-hotel-upload">
          {isUploadingCover ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          <span>{isUploadingCover ? "Wird in R2 geladen …" : "Titelbild hochladen"}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            disabled={isUploadingCover}
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadCover(file);
              event.target.value = "";
            }}
          />
        </label>
        {uploadError && <small>{uploadError}</small>}

        <div className="admin-room-cover">
          {room.cover_image_url ? (
            <img src={room.cover_image_url} alt={room.name_de || "Zimmerbild"} />
          ) : (
            <div>
              <ImageIcon size={34} />
              <span>Noch kein Titelbild hinterlegt.</span>
            </div>
          )}
        </div>
      </section>

      <section className="admin-room-card">
        <div className="admin-room-card__header">
          <div>
            <span>Medien</span>
            <h2>Bildergalerie</h2>
          </div>
          <span className="admin-room-card__count">
            {room.images.length} Bilder
          </span>
        </div>

        <ImageEditor
          images={room.images}
          hotelSlug={hotelSlug}
          roomSlug={room.slug}
          onChange={(images) =>
            setRoom((current) => ({ ...current, images }))
          }
        />
      </section>
    </>
  );
}
