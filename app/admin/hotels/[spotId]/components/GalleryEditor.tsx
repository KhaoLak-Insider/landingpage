"use client";

import {
  ArrowDown,
  ArrowUp,
  ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
import type {
  ContentStatus,
  HotelGalleryImage,
} from "../types";
import { createId } from "../utils";

interface Props {
  images: HotelGalleryImage[];
  onChange: (images: HotelGalleryImage[]) => void;
}

export default function GalleryEditor({ images, onChange }: Props) {
  function addImage() {
    const nextOrder =
      images.length > 0
        ? Math.max(...images.map((image) => image.sort_order)) + 1
        : 1;

    onChange([
      ...images,
      {
        id: createId(),
        image_url: "",
        title_de: "",
        title_en: "",
        alt_de: "",
        alt_en: "",
        credit_name: "",
        credit_url: "",
        status: "draft",
        sort_order: nextOrder,
        is_cover: images.length === 0,
        is_featured: false,
      },
    ]);
  }

  function updateImage(
    index: number,
    patch: Partial<HotelGalleryImage>,
  ) {
    let next = images.map((image, itemIndex) =>
      itemIndex === index ? { ...image, ...patch } : image,
    );

    if (patch.is_cover === true) {
      next = next.map((image, itemIndex) => ({
        ...image,
        is_cover: itemIndex === index,
      }));
    }

    onChange(next);
  }

  function removeImage(index: number) {
    const removedWasCover = images[index]?.is_cover;
    const next = images.filter((_, itemIndex) => itemIndex !== index);

    if (removedWasCover && next.length > 0) {
      next[0] = { ...next[0], is_cover: true };
    }

    onChange(
      next.map((image, itemIndex) => ({
        ...image,
        sort_order: itemIndex + 1,
      })),
    );
  }

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;

    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];

    onChange(
      next.map((image, itemIndex) => ({
        ...image,
        sort_order: itemIndex + 1,
      })),
    );
  }

  return (
    <div className="hotel-gallery-editor">
      <div className="hotel-gallery-editor__toolbar">
        <p>
          Titelbild, Featured-Bilder, Status und Bildnachweise verwalten.
        </p>
        <button type="button" onClick={addImage}>
          <Plus size={14} />
          Bild hinzufügen
        </button>
      </div>

      <div className="hotel-gallery-editor__grid">
        {images.map((image, index) => (
          <article className="hotel-gallery-editor__item" key={image.id}>
            <div className="hotel-gallery-editor__preview">
              {image.image_url ? (
                <img
                  src={image.image_url}
                  alt={image.alt_de || image.title_de || "Hotelbild"}
                />
              ) : (
                <div>
                  <ImageIcon size={30} />
                  <span>Bild-URL fehlt</span>
                </div>
              )}

              <span>{index + 1}</span>
            </div>

            <div className="admin-hotel-grid admin-hotel-grid--two">
              <label className="admin-hotel-field admin-hotel-field--full">
                <span>Bild-URL</span>
                <input
                  type="url"
                  value={image.image_url}
                  onChange={(event) =>
                    updateImage(index, {
                      image_url: event.target.value,
                    })
                  }
                />
              </label>

              <label className="admin-hotel-field">
                <span>Titel Deutsch</span>
                <input
                  value={image.title_de}
                  onChange={(event) =>
                    updateImage(index, { title_de: event.target.value })
                  }
                />
              </label>

              <label className="admin-hotel-field">
                <span>Titel Englisch</span>
                <input
                  value={image.title_en}
                  onChange={(event) =>
                    updateImage(index, { title_en: event.target.value })
                  }
                />
              </label>

              <label className="admin-hotel-field">
                <span>Alt-Text Deutsch</span>
                <input
                  value={image.alt_de}
                  onChange={(event) =>
                    updateImage(index, { alt_de: event.target.value })
                  }
                />
              </label>

              <label className="admin-hotel-field">
                <span>Alt-Text Englisch</span>
                <input
                  value={image.alt_en}
                  onChange={(event) =>
                    updateImage(index, { alt_en: event.target.value })
                  }
                />
              </label>

              <label className="admin-hotel-field">
                <span>Bildnachweis</span>
                <input
                  value={image.credit_name}
                  onChange={(event) =>
                    updateImage(index, {
                      credit_name: event.target.value,
                    })
                  }
                />
              </label>

              <label className="admin-hotel-field">
                <span>Nachweis-URL</span>
                <input
                  type="url"
                  value={image.credit_url}
                  onChange={(event) =>
                    updateImage(index, {
                      credit_url: event.target.value,
                    })
                  }
                />
              </label>

              <label className="admin-hotel-field">
                <span>Status</span>
                <select
                  value={image.status}
                  onChange={(event) =>
                    updateImage(index, {
                      status: event.target.value as ContentStatus,
                    })
                  }
                >
                  <option value="draft">Entwurf</option>
                  <option value="published">Veröffentlicht</option>
                  <option value="archived">Archiviert</option>
                </select>
              </label>
            </div>

            <div className="hotel-gallery-editor__checks">
              <label>
                <input
                  type="checkbox"
                  checked={image.is_cover}
                  onChange={(event) =>
                    updateImage(index, { is_cover: event.target.checked })
                  }
                />
                Titelbild
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={image.is_featured}
                  onChange={(event) =>
                    updateImage(index, {
                      is_featured: event.target.checked,
                    })
                  }
                />
                Featured
              </label>
            </div>

            <div className="hotel-gallery-editor__actions">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => moveImage(index, -1)}
              >
                <ArrowUp size={14} />
                Hoch
              </button>

              <button
                type="button"
                disabled={index === images.length - 1}
                onClick={() => moveImage(index, 1)}
              >
                <ArrowDown size={14} />
                Runter
              </button>

              <button
                type="button"
                className="hotel-gallery-editor__delete"
                onClick={() => removeImage(index)}
              >
                <Trash2 size={14} />
                Löschen
              </button>
            </div>
          </article>
        ))}
      </div>

      {images.length === 0 && (
        <div className="hotel-gallery-editor__empty">
          <ImageIcon size={32} />
          <span>Noch keine Hotelbilder hinterlegt.</span>
        </div>
      )}
    </div>
  );
}
