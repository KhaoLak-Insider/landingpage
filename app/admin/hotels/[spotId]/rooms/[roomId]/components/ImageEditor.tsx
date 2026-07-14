"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ImageIcon, Plus, Trash2 } from "lucide-react";
import type { RoomImage } from "../types";

interface ImageEditorProps {
  images: RoomImage[];
  onChange: (images: RoomImage[]) => void;
}

export default function ImageEditor({
  images,
  onChange,
}: ImageEditorProps) {
  const [draftUrl, setDraftUrl] = useState("");

  function addImage() {
    const url = draftUrl.trim();
    if (!url) return;

    onChange([...images, { url, alt_de: "", alt_en: "" }]);
    setDraftUrl("");
  }

  function updateImage(index: number, patch: Partial<RoomImage>) {
    onChange(
      images.map((image, currentIndex) =>
        currentIndex === index ? { ...image, ...patch } : image,
      ),
    );
  }

  function removeImage(index: number) {
    onChange(images.filter((_, currentIndex) => currentIndex !== index));
  }

  function moveImage(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const nextImages = [...images];
    [nextImages[index], nextImages[targetIndex]] = [
      nextImages[targetIndex],
      nextImages[index],
    ];

    onChange(nextImages);
  }

  return (
    <div className="image-editor">
      <div className="image-editor__add">
        <input
          type="url"
          value={draftUrl}
          onChange={(event) => setDraftUrl(event.target.value)}
          placeholder="Neue Bild-URL einfügen"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addImage();
            }
          }}
        />

        <button type="button" onClick={addImage}>
          <Plus size={14} />
          Bild hinzufügen
        </button>
      </div>

      <div className="image-editor__grid">
        {images.map((image, index) => (
          <article className="image-editor__item" key={`${image.url}-${index}`}>
            <div className="image-editor__preview">
              <img src={image.url} alt={image.alt_de || "Zimmerbild"} />
              <span>{index + 1}</span>
            </div>

            <label>
              <span>Bild-URL</span>
              <input
                type="url"
                value={image.url}
                onChange={(event) =>
                  updateImage(index, { url: event.target.value })
                }
              />
            </label>

            <label>
              <span>Alternativtext Deutsch</span>
              <input
                value={image.alt_de || ""}
                onChange={(event) =>
                  updateImage(index, { alt_de: event.target.value })
                }
              />
            </label>

            <label>
              <span>Alternativtext Englisch</span>
              <input
                value={image.alt_en || ""}
                onChange={(event) =>
                  updateImage(index, { alt_en: event.target.value })
                }
              />
            </label>

            <div className="image-editor__actions">
              <button
                type="button"
                onClick={() => moveImage(index, -1)}
                disabled={index === 0}
              >
                <ArrowUp size={14} />
                Hoch
              </button>

              <button
                type="button"
                onClick={() => moveImage(index, 1)}
                disabled={index === images.length - 1}
              >
                <ArrowDown size={14} />
                Runter
              </button>

              <button
                type="button"
                onClick={() => removeImage(index)}
                className="image-editor__delete"
              >
                <Trash2 size={14} />
                Löschen
              </button>
            </div>
          </article>
        ))}
      </div>

      {images.length === 0 && (
        <div className="image-editor__empty">
          <ImageIcon size={30} />
          <span>Noch keine Galeriebilder hinterlegt.</span>
        </div>
      )}
    </div>
  );
}
