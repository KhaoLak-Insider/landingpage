"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import MapBoxMini from "@/src/components/MapBoxMini";
import { MapPin, Tag, Star, Navigation, Heart, Camera, Sunset, Sparkles, Palmtree, Utensils, Waves } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export default function SpotPage({ params }: { params: Promise<{ slug: string }> }) {
  const [spot, setSpot] = useState<any>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const slug = (await params).slug;
      const decodedSlug = decodeURIComponent(slug.trim());
      const { data } = await supabase.from("spots").select("*").eq("slug", decodedSlug).maybeSingle();
      
      if (data) {
        setSpot(data);
        let parsedGallery = [];
        if (data.gallery_urls) {
          if (Array.isArray(data.gallery_urls)) parsedGallery = data.gallery_urls;
          else if (typeof data.gallery_urls === 'string') {
            try { parsedGallery = JSON.parse(data.gallery_urls); } catch (e) { parsedGallery = []; }
          }
        }
        setGallery(parsedGallery);
      }
    }
    fetchData();
  }, [params]);

  if (!spot) return <main style={{ padding: 40, textAlign: "center", minHeight: "100vh" }}>Lade...</main>;

  const slides = gallery.map((url: string) => ({ src: url }));

  return (
    <main style={{ background: "#f6f7fb", minHeight: "100vh", fontFamily: "'Poppins', sans-serif", paddingBottom: 60 }}>
      
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 80px", background: "#fff" }}>
        <Link href="/"><Image src="/images/logo.svg" alt="Logo" width={110} height={30} /></Link>
      </nav>

      <div style={{ position: "relative", maxWidth: 1200, margin: "20px auto", padding: "0 20px" }}>
        
        {/* HERO */}
        <div style={{ position: "relative", width: "100%", height: "450px", borderRadius: "40px", overflow: "hidden" }}>
          <img src={spot.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: "40px", left: "40px", zIndex: 10 }}>
            <h1 style={{ color: "#fff", fontSize: 48, fontWeight: 800, margin: 0, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{spot.title}</h1>
            <p style={{ color: "#fff", fontSize: 16, fontWeight: 300, margin: "5px 0 0 0", opacity: 0.9, textShadow: "0 1px 5px rgba(0,0,0,0.5)" }}>
              {spot.long_description || spot.description}
            </p>
          </div>
        </div>

        {/* DETAILS BOX */}
        <aside style={{ 
          position: "absolute", top: "100px", right: "80px", width: 280, 
          background: "#fff", borderRadius: 20, padding: "40px 30px 60px 30px", 
          boxShadow: "0 15px 30px rgba(0,0,0,0.1)", zIndex: 50 
        }}>
           <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 30, color: "#666" }}>DETAILS</h3>
           <div style={{ display: "flex", flexDirection: "column", gap: 28, marginBottom: 50 }}>
             <InfoItem icon={<Tag size={16} />} label="Kategorie" value={spot.category} />
             <InfoItem icon={<MapPin size={16} />} label="Koordinaten" value={`${spot.latitude?.toFixed(2)}, ${spot.longitude?.toFixed(2)}`} />
             <InfoItem icon={<Star size={16} />} label="Insider Level" value="Geheimtipp" />
           </div>

           <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
             <button style={{ width: "100%", padding: 14, background: "#14b8a6", color: "#fff", borderRadius: 12, border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
               <Navigation size={16} /> Route starten
             </button>
             <button style={{ width: "100%", padding: 12, background: "#f3f4f6", color: "#374151", borderRadius: 12, border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
               <Heart size={16} /> Zu Favoriten hinzufügen
             </button>
           </div>
        </aside>

        {/* GALERIE */}
        {gallery.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginTop: "20px", maxWidth: "800px" }}>
            {gallery.slice(0, 3).map((url: string, i: number) => (
              <div key={i} onClick={() => { setIndex(i); setOpen(true); }} style={{ height: "120px", borderRadius: "12px", overflow: "hidden", cursor: "pointer" }}>
                <img src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
            <div onClick={() => { setIndex(3); setOpen(true); }} style={{ height: "120px", borderRadius: "12px", background: "#1f2937", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", cursor: "pointer" }}>
              <span style={{ fontSize: "14px", fontWeight: "bold" }}>{gallery.length > 3 ? `+${gallery.length - 3}` : "Mehr"}</span>
            </div>
          </div>
        )}

        {/* BESCHREIBUNG & LAGE */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginTop: "60px" }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: "20px" }}>Über {spot.title}</h2>
            <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: "30px", fontSize: "15px" }}>
              {spot.details_config?.description}
            </p>
            
            {/* 3x2 Grid für Features */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              {spot.details_config?.features?.map((f: any, i: number) => (
                <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center", background: "#fff", padding: "12px", borderRadius: "12px", border: "1px solid #e5e5e5" }}>
                  <div style={{ color: "#14b8a6" }}>{getIcon(f.icon)}</div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700 }}>{f.label}</div>
                    <div style={{ fontSize: 9, color: "#666" }}>{f.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: "20px" }}>Lage</h2>
            <div style={{ height: 220, borderRadius: 24, overflow: "hidden", border: "1px solid #e5e5e5", background: "#fff" }}>
              <MapBoxMini lat={spot.latitude} lng={spot.longitude} />
            </div>
          </div>
        </div>
      </div>

      <Lightbox open={open} close={() => setOpen(false)} slides={slides} index={index} on={{ view: ({ index: i }) => setIndex(i) }} />
    </main>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#14b8a6", fontSize: 11, fontWeight: 700 }}>
        {icon}
        {label.toUpperCase()}
      </div>
      <div style={{ color: "#000", fontSize: 14, fontWeight: 600, paddingLeft: 24 }}>
        {value}
      </div>
    </div>
  );
}

function getIcon(name: string) {
  const size = 18;
  // Ändere JSX.Element zu React.ReactNode
  const icons: { [key: string]: React.ReactNode } = {
    Beach: <Palmtree size={size} />,
    Utensils: <Utensils size={size} />,
    Waves: <Waves size={size} />,
    Camera: <Camera size={size} />,
    Sunset: <Sunset size={size} />,
    Sparkles: <Sparkles size={size} />
  };
  return icons[name] || <Sparkles size={size} />;
}