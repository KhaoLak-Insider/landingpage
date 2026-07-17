"use client";

import {
  ArrowDown,
  ArrowUp,
  Check,
  ImageIcon,
  Plus,
  Loader2,
  Trash2,
  Upload,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { deleteR2Image, uploadHotelImage, uploadHotelVideo } from "@/src/lib/r2-images";
import { generateImageAltTexts } from "@/src/lib/admin/image-alt";
import type {
  ContentStatus,
  HotelGalleryImage,
} from "../types";
import { createId } from "../utils";

interface Props {
  images: HotelGalleryImage[];
  hotelSlug: string;
  onChange: (images: HotelGalleryImage[]) => void;
}

interface GalleryProposal {
  image: HotelGalleryImage;
  category: string;
  quality: number;
  hero: number;
}

export default function GalleryEditor({ images, hotelSlug, onChange }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [generatingAltIndex, setGeneratingAltIndex] = useState<number | null>(null);
  const [altMessage, setAltMessage] = useState<{ index: number; type: "success" | "error"; text: string } | null>(null);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);
  const [sortProgress, setSortProgress] = useState<{ done: number; total: number } | null>(null);
  const [sortProposal, setSortProposal] = useState<GalleryProposal[] | null>(null);
  const [isGalleryExpanded, setIsGalleryExpanded] = useState(false);

  function buildDiverseOrder(items: GalleryProposal[]): GalleryProposal[] {
    const remaining = [...items];
    const ordered: GalleryProposal[] = [];
    while (remaining.length > 0) {
      let bestIndex = 0;
      let bestScore = -Infinity;
      remaining.forEach((item, index) => {
        const recentCategories = ordered.slice(-3).map((entry) => entry.category.toLowerCase());
        const category = item.category.toLowerCase();
        const base = ordered.length === 0 ? item.hero * 0.7 + item.quality * 0.3 : item.quality * 0.62 + item.hero * 0.38;
        const repetitionPenalty = recentCategories.at(-1) === category ? 28 : recentCategories.includes(category) ? 12 : 0;
        const score = base - repetitionPenalty;
        if (score > bestScore) { bestScore = score; bestIndex = index; }
      });
      ordered.push(remaining.splice(bestIndex, 1)[0]);
    }
    return ordered;
  }

  async function analyzeAndSortGallery() {
    const targets = images.filter((image) => image.media_type !== "video" && image.image_url.trim());
    if (targets.length < 2) {
      setUploadError("Für eine KI-Sortierung werden mindestens zwei Bilder benötigt.");
      return;
    }
    if (!window.confirm(`${targets.length} Bilder mit Gemini analysieren und eine neue Reihenfolge vorschlagen?`)) return;
    setSortProgress({ done: 0, total: targets.length });
    setSortProposal(null);
    setUploadError(null);
    const analyzed: GalleryProposal[] = [];
    let cursor = 0;
    let completed = 0;
    let failed = 0;
    async function worker() {
      while (cursor < targets.length) {
        const image = targets[cursor++];
        try {
          const result = await generateImageAltTexts(image.image_url, `${hotelSlug}; ${image.title_de || image.title_en || "Hotelgalerie"}`);
          analyzed.push({ image, category: result.category, quality: result.quality_score, hero: result.hero_score });
        } catch { failed += 1; }
        finally { completed += 1; setSortProgress({ done: completed, total: targets.length }); }
      }
    }
    await Promise.all(Array.from({ length: Math.min(3, targets.length) }, () => worker()));
    setSortProgress(null);
    if (analyzed.length < 2) {
      setUploadError("Die KI konnte nicht genügend Bilder bewerten.");
      return;
    }
    setSortProposal(buildDiverseOrder(analyzed));
    if (failed) setUploadError(`${failed} Bilder konnten nicht bewertet werden und sind nicht in der Vorschau enthalten.`);
  }

  function applySortProposal() {
    if (!sortProposal) return;
    const proposedIds = new Set(sortProposal.map((entry) => entry.image.id));
    const videos = images.filter((image) => image.media_type === "video");
    const unranked = images.filter((image) => image.media_type !== "video" && !proposedIds.has(image.id));
    const sorted = [...videos, ...sortProposal.map((entry) => entry.image), ...unranked].map((image, index) => ({
      ...image,
      sort_order: index + 1,
      is_cover: index === 0,
    }));
    onChange(sorted);
    setSortProposal(null);
    setAltMessage({ index: -1, type: "success", text: "KI-Reihenfolge und neues Titelbild übernommen. Bitte Hotel speichern." });
  }

  async function generateAllImageTexts() {
    const targets = images.map((image, index) => ({ image, index })).filter(({ image }) => image.media_type !== "video" && image.image_url.trim());
    if (!targets.length) {
      setUploadError("Es sind keine Bilder mit einer gültigen URL vorhanden.");
      return;
    }
    if (!window.confirm(`Für ${targets.length} Bilder Titel und Alt-Texte neu erstellen? Vorhandene Bildtexte werden überschrieben.`)) return;

    setBulkProgress({ done: 0, total: targets.length });
    setUploadError(null);
    setAltMessage(null);
    const nextImages = images.map((image) => ({ ...image }));
    let cursor = 0;
    let completed = 0;
    let failed = 0;

    async function worker() {
      while (cursor < targets.length) {
        const target = targets[cursor++];
        try {
          const generated = await generateImageAltTexts(target.image.image_url, `${hotelSlug}; ${target.image.title_de || target.image.title_en || "Hotelbild"}`);
          nextImages[target.index] = {
            ...nextImages[target.index],
            title_de: generated.title_de,
            title_en: generated.title_en,
            alt_de: generated.de,
            alt_en: generated.en,
          };
        } catch {
          failed += 1;
        } finally {
          completed += 1;
          setBulkProgress({ done: completed, total: targets.length });
        }
      }
    }

    await Promise.all(Array.from({ length: Math.min(3, targets.length) }, () => worker()));
    onChange(nextImages);
    setBulkProgress(null);
    setUploadError(failed > 0 ? `${targets.length - failed} Bilder bearbeitet, ${failed} fehlgeschlagen. Die erfolgreichen Texte wurden übernommen.` : null);
    if (failed === 0) setAltMessage({ index: -1, type: "success", text: `${targets.length} Bilder vollständig bearbeitet. Bitte Hotel speichern.` });
  }

  function publishAllDrafts() {
    const draftCount = images.filter((image) => image.status === "draft").length;
    if (draftCount === 0) {
      setUploadError("Es gibt keine Galeriebilder mit dem Status Entwurf.");
      return;
    }
    if (!window.confirm(`${draftCount} Galeriebilder von Entwurf auf Veröffentlicht setzen?`)) return;
    onChange(images.map((image) => image.status === "draft" ? { ...image, status: "published" as ContentStatus } : image));
    setUploadError(null);
    setAltMessage({ index: -1, type: "success", text: `${draftCount} Bilder wurden auf Veröffentlicht gesetzt. Bitte Hotel speichern.` });
  }

  async function generateAlt(index: number) {
    const image = images[index];
    if (!image?.image_url) return;
    setGeneratingAltIndex(index);
    setUploadError(null);
    setAltMessage(null);
    try {
      const alt = await generateImageAltTexts(image.image_url, image.title_de || image.title_en);
      updateImage(index, { alt_de: alt.de, alt_en: alt.en });
      setAltMessage({ index, type: "success", text: "Beide Alt-Texte wurden übernommen. Bitte Hotel speichern." });
    } catch (error) {
      setAltMessage({ index, type: "error", text: error instanceof Error ? error.message : "Alt-Texte konnten nicht erstellt werden." });
    } finally {
      setGeneratingAltIndex(null);
    }
  }

  async function uploadImages(files: FileList) {
    if (!hotelSlug.trim()) {
      setUploadError("Bitte zuerst einen Hotel-Slug eintragen.");
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    try {
      const urls = await Promise.all(
        Array.from(files).map((file) => uploadHotelImage(file, hotelSlug, "gallery")),
      );
      const startOrder = images.length;
      onChange([
        ...images,
        ...urls.map((image_url, index) => ({
          id: createId(),
          media_type: "image" as const,
          image_url,
          title_de: "",
          title_en: "",
          alt_de: "",
          alt_en: "",
          credit_name: "",
          credit_url: "",
          status: "draft" as ContentStatus,
          sort_order: startOrder + index + 1,
          is_cover: images.length === 0 && index === 0,
          is_featured: false,
        })),
      ]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Galeriebilder konnten nicht hochgeladen werden.");
    } finally {
      setIsUploading(false);
    }
  }

  async function uploadVideo(file: File) {
    if (!hotelSlug.trim()) { setUploadError("Bitte zuerst einen Hotel-Slug eintragen."); return; }
    setIsUploadingVideo(true);
    setUploadError(null);
    try {
      const image_url = await uploadHotelVideo(file, hotelSlug);
      const oldVideos = images.filter((image) => image.media_type === "video");
      const remaining = images.filter((image) => image.media_type !== "video");
      onChange([{
        id: createId(), media_type: "video", image_url,
        title_de: "Hotelvideo", title_en: "Hotel video", alt_de: "", alt_en: "",
        credit_name: "", credit_url: "", status: "published", sort_order: 1,
        is_cover: false, is_featured: true,
      }, ...remaining.map((image, index) => ({ ...image, sort_order: index + 2 }))]);
      await Promise.allSettled(oldVideos.map((video) => deleteR2Image(video.image_url)));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Video konnte nicht hochgeladen werden.");
    } finally { setIsUploadingVideo(false); }
  }

  function addImage() {
    const nextOrder =
      images.length > 0
        ? Math.max(...images.map((image) => image.sort_order)) + 1
        : 1;

    onChange([
      ...images,
      {
        id: createId(),
        media_type: "image",
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
        <label className="admin-hotel-upload">
          {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          <span>{isUploading ? "Upload läuft …" : "Bilder hochladen"}</span>
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
        <label className="admin-hotel-upload">
          {isUploadingVideo ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          <span>{isUploadingVideo ? "Video wird hochgeladen …" : "Video hochladen"}</span>
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            disabled={isUploadingVideo}
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadVideo(file);
              event.target.value = "";
            }}
          />
        </label>
        <button type="button" disabled={bulkProgress !== null || isUploading} onClick={() => void generateAllImageTexts()}>
          {bulkProgress ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {bulkProgress ? `${bulkProgress.done} / ${bulkProgress.total}` : "KI-Titel & Alt-Texte für alle"}
        </button>
        <button type="button" disabled={bulkProgress !== null || isUploading} onClick={publishAllDrafts}>
          <Check size={14} />
          Alle Entwürfe veröffentlichen
        </button>
        <button type="button" disabled={sortProgress !== null || bulkProgress !== null || isUploading} onClick={() => void analyzeAndSortGallery()}>
          {sortProgress ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {sortProgress ? `KI sortiert ${sortProgress.done} / ${sortProgress.total}` : "Galerie mit KI sortieren"}
        </button>
      </div>
      {uploadError && <small>{uploadError}</small>}
      {altMessage?.index === -1 && <small className="admin-ai-message admin-ai-message--success">{altMessage.text}</small>}

      {sortProposal && (
        <section className="hotel-gallery-sort-preview">
          <div><strong>Vorschau der KI-Reihenfolge</strong><span>Das erste Bild wird als Titelbild gesetzt.</span></div>
          <div className="hotel-gallery-sort-preview__grid">
            {sortProposal.map((entry, index) => (
              <article key={entry.image.id}>
                <div><img src={entry.image.image_url} alt={entry.image.alt_de || entry.category} /><b>{index + 1}</b></div>
                <span>{entry.category}</span><small>Qualität {entry.quality} · Titelbild {entry.hero}</small>
              </article>
            ))}
          </div>
          <div className="hotel-gallery-sort-preview__actions">
            <button type="button" onClick={() => setSortProposal(null)}>Abbrechen</button>
            <button type="button" onClick={applySortProposal}>Reihenfolge übernehmen</button>
          </div>
        </section>
      )}

      {images.length > 2 && (
        <div className="hotel-gallery-editor__collapse-bar">
          <span>
            {isGalleryExpanded
              ? `Alle ${images.length} Medien werden angezeigt.`
              : `2 von ${images.length} Medien werden angezeigt.`}
          </span>
          <button type="button" onClick={() => setIsGalleryExpanded((current) => !current)}>
            {isGalleryExpanded ? "Galerie einklappen" : `Alle ${images.length} Medien anzeigen`}
          </button>
        </div>
      )}

      <div className="hotel-gallery-editor__grid">
        {(isGalleryExpanded ? images : images.slice(0, 2)).map((image, index) => (
          <article className="hotel-gallery-editor__item" key={image.id}>
            <div className="hotel-gallery-editor__preview">
              {image.image_url && image.media_type === "video" ? (
                <video src={image.image_url} controls playsInline preload="metadata" />
              ) : image.image_url ? (
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

              <button
                type="button"
                className="admin-hotel-upload"
                disabled={image.media_type === "video" || !image.image_url || generatingAltIndex === index}
                onClick={() => void generateAlt(index)}
              >
                {generatingAltIndex === index ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                KI-Alt-Texte DE + EN
              </button>
              {altMessage?.index === index && (
                <small className={`admin-ai-message admin-ai-message--${altMessage.type}`}>{altMessage.text}</small>
              )}

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
                disabled={image.media_type === "video" || index === 0}
                onClick={() => moveImage(index, -1)}
              >
                <ArrowUp size={14} />
                Hoch
              </button>

              <button
                type="button"
                disabled={image.media_type === "video" || index === images.length - 1}
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
