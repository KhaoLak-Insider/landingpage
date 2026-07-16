"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { deleteR2Image, uploadR2Image } from "@/src/lib/r2-images";

type Props = {
  category: string;
  slug: string;
  heroUrl: string;
  galleryUrls: string[];
  onHeroChange: (url: string) => void;
  onGalleryChange: (urls: string[]) => void;
};

export default function SpotImageManager({
  category,
  slug,
  heroUrl,
  galleryUrls,
  onHeroChange,
  onGalleryChange,
}: Props) {
  const heroInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canUpload = Boolean(category.trim() && slug.trim());

  async function uploadHero(file: File) {
    setBusy("hero-upload");
    setError(null);
    try {
      onHeroChange(await uploadR2Image(file, category, slug, "hero"));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload fehlgeschlagen.");
    } finally {
      setBusy(null);
    }
  }

  async function uploadGallery(files: File[]) {
    setBusy("gallery-upload");
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        uploaded.push(await uploadR2Image(file, category, slug, "gallery"));
      }
      onGalleryChange([...galleryUrls, ...uploaded]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload fehlgeschlagen.");
    } finally {
      setBusy(null);
    }
  }

  async function removeHero() {
    if (!heroUrl || !window.confirm("Herobild wirklich entfernen?")) return;
    setBusy("hero-delete");
    setError(null);
    try {
      await deleteR2Image(heroUrl);
      onHeroChange("");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Löschen fehlgeschlagen.");
    } finally {
      setBusy(null);
    }
  }

  async function removeGalleryImage(index: number) {
    const url = galleryUrls[index];
    if (!url || !window.confirm("Galeriebild wirklich entfernen?")) return;
    setBusy(`gallery-delete-${index}`);
    setError(null);
    try {
      await deleteR2Image(url);
      onGalleryChange(galleryUrls.filter((_, itemIndex) => itemIndex !== index));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Löschen fehlgeschlagen.");
    } finally {
      setBusy(null);
    }
  }

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= galleryUrls.length) return;
    const reordered = [...galleryUrls];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    onGalleryChange(reordered);
  }

  return (
    <section className="spot-image-manager">
      <div className="spot-image-manager__heading">
        <div>
          <span>Cloudflare R2</span>
          <h2>Bilder verwalten</h2>
          <p>Speicherpfad: spots/{category || "kategorie"}/{slug || "slug"}</p>
        </div>
        {!canUpload && <small>Bitte zuerst Titel und Kategorie wählen.</small>}
      </div>

      {error && <div className="spot-image-manager__error">{error}</div>}

      <div className="spot-image-manager__hero">
        <h3>Herobild</h3>
        {heroUrl ? (
          <div className="spot-image-manager__hero-preview">
            <Image src={heroUrl} alt="Herobild" fill sizes="(max-width: 800px) 100vw, 700px" unoptimized />
          </div>
        ) : (
          <div className="spot-image-manager__empty"><ImagePlus size={24} />Noch kein Herobild</div>
        )}
        <div className="spot-image-manager__buttons">
          <button type="button" disabled={!canUpload || busy !== null} onClick={() => heroInputRef.current?.click()}>
            {busy === "hero-upload" ? <Loader2 size={15} className="spin" /> : <ImagePlus size={15} />}
            {heroUrl ? "Bild ersetzen" : "Herobild hochladen"}
          </button>
          {heroUrl && (
            <button type="button" className="danger" disabled={busy !== null} onClick={removeHero}>
              {busy === "hero-delete" ? <Loader2 size={15} className="spin" /> : <Trash2 size={15} />}Entfernen
            </button>
          )}
        </div>
        <input ref={heroInputRef} hidden type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadHero(file);
          event.target.value = "";
        }} />
      </div>

      <div className="spot-image-manager__gallery">
        <div className="spot-image-manager__gallery-heading">
          <h3>Galerie</h3>
          <button type="button" disabled={!canUpload || busy !== null} onClick={() => galleryInputRef.current?.click()}>
            {busy === "gallery-upload" ? <Loader2 size={15} className="spin" /> : <ImagePlus size={15} />}Bilder hinzufügen
          </button>
        </div>
        <input ref={galleryInputRef} hidden multiple type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={(event) => {
          const files = Array.from(event.target.files || []);
          if (files.length) void uploadGallery(files);
          event.target.value = "";
        }} />

        {galleryUrls.length ? (
          <div className="spot-image-manager__grid">
            {galleryUrls.map((url, index) => (
              <article key={`${url}-${index}`}>
                <div className="spot-image-manager__preview">
                  <Image src={url} alt={`Galeriebild ${index + 1}`} fill sizes="(max-width: 760px) 100vw, 260px" unoptimized />
                  <span>{index + 1}</span>
                </div>
                <div className="spot-image-manager__order">
                  <button type="button" disabled={index === 0 || busy !== null} onClick={() => moveImage(index, -1)}><ArrowUp size={14} />Nach vorn</button>
                  <button type="button" disabled={index === galleryUrls.length - 1 || busy !== null} onClick={() => moveImage(index, 1)}><ArrowDown size={14} />Nach hinten</button>
                  <button type="button" className="danger" disabled={busy !== null} onClick={() => void removeGalleryImage(index)}>
                    {busy === `gallery-delete-${index}` ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}Löschen
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : <div className="spot-image-manager__empty">Noch keine Galeriebilder</div>}
      </div>

      <style jsx>{`
        .spot-image-manager{padding:22px;border:1px solid #e4eaee;border-radius:17px;background:#fff;box-shadow:0 9px 26px rgba(15,35,62,.035)}
        .spot-image-manager__heading,.spot-image-manager__gallery-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.spot-image-manager__heading{padding-bottom:17px;border-bottom:1px solid #edf1f3}.spot-image-manager__heading span{display:block;margin-bottom:5px;color:#079ca5;font-size:9px;font-weight:800;letter-spacing:.11em;text-transform:uppercase}.spot-image-manager h2,.spot-image-manager h3{margin:0;color:#24364d}.spot-image-manager h2{font-size:19px}.spot-image-manager h3{font-size:12px}.spot-image-manager__heading p,.spot-image-manager__heading small{margin:6px 0 0;color:#7b8798;font-size:9px}.spot-image-manager__error{margin-top:14px;padding:10px 12px;border:1px solid #fecaca;border-radius:10px;background:#fff1f2;color:#be123c;font-size:10px;font-weight:700}.spot-image-manager__hero,.spot-image-manager__gallery{margin-top:18px}.spot-image-manager__hero-preview{position:relative;overflow:hidden;height:300px;margin-top:11px;border-radius:13px;background:#eef3f4}.spot-image-manager__hero-preview :global(img),.spot-image-manager__preview :global(img){object-fit:cover}.spot-image-manager__empty{display:flex;min-height:100px;align-items:center;justify-content:center;flex-direction:column;gap:8px;margin-top:11px;border:1px dashed #d9e1e6;border-radius:11px;color:#8c98a6;font-size:10px}.spot-image-manager__buttons,.spot-image-manager__order{display:flex;gap:7px;margin-top:10px}.spot-image-manager button{display:inline-flex;min-height:36px;align-items:center;justify-content:center;gap:6px;padding:0 11px;border:1px solid #dfe6eb;border-radius:9px;background:#fff;color:#526174;font:inherit;font-size:9px;font-weight:750;cursor:pointer}.spot-image-manager__gallery-heading>button,.spot-image-manager__buttons>button:first-child{border:0;background:#079ca5;color:#fff}.spot-image-manager button.danger{color:#c2415a}.spot-image-manager button:disabled{cursor:not-allowed;opacity:.4}.spot-image-manager__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px;margin-top:13px}.spot-image-manager__grid article{padding:9px;border:1px solid #e3e9ed;border-radius:12px;background:#fafcfc}.spot-image-manager__preview{position:relative;overflow:hidden;height:150px;border-radius:9px;background:#edf2f4}.spot-image-manager__preview span{position:absolute;top:7px;left:7px;display:flex;width:23px;height:23px;align-items:center;justify-content:center;border-radius:999px;background:rgba(16,35,63,.82);color:#fff;font-size:9px;font-weight:800}.spot-image-manager__order{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}.spot-image-manager__order button{padding:0 5px}.spin{animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:800px){.spot-image-manager__grid{grid-template-columns:1fr}.spot-image-manager__heading{flex-direction:column}.spot-image-manager__order{grid-template-columns:1fr}}
      `}</style>
    </section>
  );
}
