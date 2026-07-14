"use client";

import { ImageIcon } from "lucide-react";
import type { RoomForm } from "../types";
import ImageEditor from "./ImageEditor";

interface Props {
  room: RoomForm;
  setRoom: React.Dispatch<React.SetStateAction<RoomForm>>;
}

export default function RoomGallery({ room, setRoom }: Props) {
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
          onChange={(images) =>
            setRoom((current) => ({ ...current, images }))
          }
        />
      </section>
    </>
  );
}
