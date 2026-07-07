"use client";

import { useState, useRef, MouseEvent } from "react";

interface MagnifierProps {
  src: string;
  alt: string;
}

export default function BlogImageMagnifier({ src, alt }: MagnifierProps) {
  const [zoomStyle, setZoomStyle] = useState<{ display: string; backgroundPosition: string }>({
    display: "none",
    backgroundPosition: "0% 0%",
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    
    // Berechne die relative Position der Maus im Bild in Prozent
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      display: "block",
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      display: "none",
      backgroundPosition: "0% 0%",
    });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full rounded-2xl overflow-hidden border border-slate-200/60 mb-8 shadow-sm cursor-zoom-in group"
    >
      {/* Das normale, scharfe Basisbild */}
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-auto object-contain rounded-2xl group-hover:opacity-0 transition-opacity duration-150"
      />

      {/* Das Zoom-Overlay, das sich exakt am Mauszeiger ausrichtet (2,5-fache Vergrößerung) */}
      <div
        className="absolute inset-0 bg-no-repeat pointer-events-none rounded-2xl"
        style={{
          ...zoomStyle,
          backgroundImage: `url(${src})`,
          backgroundSize: "250%", // Zoom-Stärke hier anpassbar (z.B. 200% oder 300%)
        }}
      />
    </div>
  );
}