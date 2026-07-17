"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ImageIcon, Loader2, Plus, Sparkles, Trash2, Upload } from "lucide-react";
import { uploadRoomImage } from "@/src/lib/r2-images";
import { generateImageAltTexts } from "@/src/lib/admin/image-alt";
import type { RoomImage } from "../types";

interface ImageEditorProps {
  images: RoomImage[];
  hotelSlug: string;
  roomSlug: string;
  onChange: (images: RoomImage[]) => void;
}

export default function ImageEditor({
  images,
  hotelSlug,
  roomSlug,
  onChange,
}: ImageEditorProps) {
  const [draftUrl, setDraftUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [generatingAltIndex, setGeneratingAltIndex] = useState<number | null>(null);
  const [altMessage, setAltMessage] = useState<{ index: number; type: "success" | "error"; text: string } | null>(null);

  async function generateAlt(index: number) {
    const image = images[index];
    if (!image?.url) return;
    setGeneratingAltIndex(index);
    setUploadError(null);
    setAltMessage(null);
    try {
      const alt = await generateImageAltTexts(image.url, roomSlug);
      updateImage(index, { alt_de: alt.de, alt_en: alt.en });
      setAltMessage({ index, type: "success", text: "Beide Alt-Texte wurden übernommen. Bitte Zimmer speichern." });
    } catch (error) {
      setAltMessage({ index, type: "error", text: error instanceof Error ? error.message : "Alt-Texte konnten nicht erstellt werden." });
    } finally {
      setGeneratingAltIndex(null);
    }
  }

  async function uploadImages(files: FileList) {
    if (!hotelSlug.trim() || !roomSlug.trim()) {
      setUploadError("Hotel- und Zimmer-Slug werden für den Upload benötigt.");
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    try {
      const urls = await Promise.all(
        Array.from(files).map((file) => uploadRoomImage(file, hotelSlug, roomSlug, "gallery")),
      );
      onChange([...images, ...urls.map((url) => ({ url, alt_de: "", alt_en: "" }))]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Galeriebilder konnten nicht hochgeladen werden.");
    } finally {
      setIsUploading(false);
    }
  }

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

      <label className="admin-hotel-upload">
        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        <span>{isUploading ? "Bilder werden in R2 geladen …" : "Galeriebilder hochladen"}</span>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          disabled={isUploading}
          hidden
          onChange={(event) => {
            if (event.target.files?.length) void uploadImages(event.target.files);
            event.target.value = "";
          }}
        />
      </label>
      {uploadError && <small>{uploadError}</small>}

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
            <button
              type="button"
              className="admin-hotel-upload"
              disabled={generatingAltIndex === index}
              onClick={() => void generateAlt(index)}
            >
              {generatingAltIndex === index ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              KI-Alt-Texte DE + EN
            </button>
            {altMessage?.index === index && (
              <small className={`admin-ai-message admin-ai-message--${altMessage.type}`}>{altMessage.text}</small>
            )}
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
