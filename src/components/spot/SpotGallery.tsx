"use client";

import { Images } from "lucide-react";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { t } from "@/src/lib/translations";
import type { Language } from "@/src/lib/i18n";

interface SpotGalleryProps { gallery: string[]; title: string; language: Language }

export default function SpotGallery({ gallery, title, language }: SpotGalleryProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  if (gallery.length === 0) return null;
  const openImage = (imageIndex: number) => { setIndex(imageIndex); setOpen(true); };

  return (
    <>
      <section className="spot-gallery">
        <div className="spot-gallery__heading"><div><span>Impressionen</span><h2>{language === "en" ? "Discover this place" : "Diesen Ort entdecken"}</h2></div><small>{gallery.length} Bilder</small></div>
        <div className="spot-gallery__grid">
          {gallery.slice(0, 5).map((url, imageIndex) => (
            <button key={`${url}-${imageIndex}`} type="button" className={imageIndex === 0 ? "is-main" : ""} onClick={() => openImage(imageIndex)} aria-label={`${title} ${imageIndex + 1}`}>
              <img src={url} alt={`${title} ${imageIndex + 1}`} />
              {imageIndex === Math.min(gallery.length, 5) - 1 && gallery.length > 5 && <span><Images size={17} />+{gallery.length - 5} {t(language, "moreImages")}</span>}
            </button>
          ))}
        </div>
      </section>
      <Lightbox open={open} close={() => setOpen(false)} slides={gallery.map((src) => ({ src }))} index={index} on={{ view: ({ index: current }) => setIndex(current) }} />
      <style jsx>{`
        .spot-gallery{padding:20px;border:1px solid #e3eaed;border-radius:18px;background:#fff;box-shadow:0 10px 30px rgba(15,35,62,.045)}.spot-gallery__heading{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:15px}.spot-gallery__heading span{display:block;margin-bottom:4px;color:#079ca5;font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.spot-gallery__heading h2{margin:0;color:#10233f;font-size:19px;letter-spacing:-.025em}.spot-gallery__heading small{color:#8996a5;font-size:9px}.spot-gallery__grid{display:grid;height:390px;grid-template-columns:1.45fr 1fr 1fr;grid-template-rows:1fr 1fr;gap:8px}.spot-gallery button{position:relative;overflow:hidden;border:0;border-radius:11px;background:#edf2f3;cursor:pointer}.spot-gallery button.is-main{grid-row:1/3}.spot-gallery img{width:100%;height:100%;object-fit:cover;transition:transform .35s ease}.spot-gallery button:hover img{transform:scale(1.035)}.spot-gallery button>span{position:absolute;right:9px;bottom:9px;display:flex;align-items:center;gap:6px;padding:8px 10px;border-radius:9px;background:rgba(16,35,63,.86);color:#fff;font-size:9px;font-weight:750;backdrop-filter:blur(8px)}@media(max-width:720px){.spot-gallery{padding:13px}.spot-gallery__grid{height:420px;grid-template-columns:1fr 1fr;grid-template-rows:1.6fr 1fr 1fr}.spot-gallery button.is-main{grid-column:1/3;grid-row:auto}.spot-gallery__grid button:nth-child(5){display:none}}@media(max-width:460px){.spot-gallery__grid{height:360px}}
      `}</style>
    </>
  );
}
