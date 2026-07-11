"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { t } from "@/src/lib/translations";
import type { Language } from "@/src/lib/i18n";

interface SpotGalleryProps {
  gallery: string[];
  title: string;
  language: Language;
}

export default function SpotGallery({
  gallery,
  title,
  language,
}: SpotGalleryProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (gallery.length === 0) {
    return null;
  }

  const slides = gallery.map((url) => ({ src: url }));

  const openImage = (imageIndex: number) => {
    setIndex(Math.min(imageIndex, gallery.length - 1));
    setOpen(true);
  };

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
          marginBottom: "40px",
        }}
      >
        {gallery.slice(0, 3).map((url, imageIndex) => (
          <button
            key={`${url}-${imageIndex}`}
            type="button"
            onClick={() => openImage(imageIndex)}
            aria-label={`${title} ${imageIndex + 1}`}
            style={{
              height: "120px",
              borderRadius: "12px",
              overflow: "hidden",
              cursor: "pointer",
              position: "relative",
              border: "none",
              padding: 0,
              background: "transparent",
            }}
          >
            <img
              src={url}
              alt={`${title} ${imageIndex + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            {url.includes("google") && (
              <span
                style={{
                  position: "absolute",
                  bottom: "4px",
                  right: "4px",
                  fontSize: "8px",
                  color: "white",
                  background: "rgba(0,0,0,0.5)",
                  padding: "1px 4px",
                  borderRadius: "2px",
                }}
              >
                Google
              </span>
            )}
          </button>
        ))}

        <button
          type="button"
          onClick={() => openImage(gallery.length > 3 ? 3 : 0)}
          aria-label={t(language, "moreImages")}
          style={{
            height: "120px",
            borderRadius: "12px",
            background: "#1f2937",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            cursor: "pointer",
            border: "none",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: "bold" }}>
            {gallery.length > 3
              ? `+${gallery.length - 3}`
              : t(language, "moreImages")}
          </span>
        </button>
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        index={index}
        on={{ view: ({ index: currentIndex }) => setIndex(currentIndex) }}
      />
    </>
  );
}
