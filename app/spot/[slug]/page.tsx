"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import MapBoxMini from "@/src/components/MapBoxMini";
import { MapPin, Tag, Star, Navigation, Camera, Sunset, Sparkles, Palmtree, Utensils, Waves } from "lucide-react";
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
    <main style={{ background: "#f6f7fb", minHeight: "100vh", fontFamily: "'Poppins', sans-serif", paddingBottom: 60, color: "#1e293b" }}>
      
      <div style={{ maxWidth: "1280px", margin: "0 auto", background: "#ffffff", minHeight: "100vh", boxShadow: "0 0 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>

        {/* HERO */}
        <div style={{ position: "relative", width: "100%", height: "450px" }}>
          <img src={spot.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          
          <Link href="/entdecken" style={{ position: "absolute", top: "30px", left: "30px", zIndex: 20, display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.9)", padding: "10px 20px", borderRadius: "50px", fontSize: "14px", fontWeight: 600, color: "#333", textDecoration: "none", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Zurück zu allen Spots
          </Link>

          <div style={{ position: "absolute", bottom: "130px", left: "40px", zIndex: 10, background: "#14b8a6", color: "#fff", padding: "6px 16px", borderRadius: "50px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
            {spot.category}
          </div>

          <div style={{ position: "absolute", bottom: "40px", left: "40px", zIndex: 10 }}>
            <h1 style={{ color: "#fff", fontSize: 48, fontWeight: 800, letterSpacing: "-0.02em", margin: 0, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{spot.title}</h1>
            <p style={{ color: "#fff", fontSize: 16, fontWeight: 300, margin: "5px 0 0 0", opacity: 0.9, textShadow: "0 1px 5px rgba(0,0,0,0.5)" }}>{spot.long_description || spot.description}</p>
          </div>
        </div>

        <div style={{ padding: "40px" }}>
          {/* DETAILS BOX */}
          <aside style={{ position: "absolute", top: "200px", right: "calc((100% - 1280px) / 2 + 40px)", width: 280, background: "#fff", borderRadius: 20, padding: "40px 30px 60px 30px", boxShadow: "0 15px 30px rgba(0,0,0,0.1)", zIndex: 50 }}>
             <h3 style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 30, color: "#94a3b8", textTransform: "uppercase" }}>Details</h3>
             <div style={{ display: "flex", flexDirection: "column", gap: 28, marginBottom: 50 }}>
               <InfoItem icon={<Tag size={16} />} label="Kategorie" value={spot.category} />
               <InfoItem icon={<MapPin size={16} />} label="Koordinaten" value={`${spot.latitude?.toFixed(2)}, ${spot.longitude?.toFixed(2)}`} />
               <InfoItem icon={<Star size={16} />} label="Insider Level" value="Geheimtipp" />
             </div>
             <button style={{ width: "100%", padding: 14, background: "#14b8a6", color: "#fff", borderRadius: 12, border: "none", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
               <Navigation size={16} /> Route starten
             </button>
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginTop: "60px", paddingBottom: "60px", maxWidth: "1200px", alignItems: "start" }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: "20px" }}>Über {spot.title}</h2>
              <p style={{ color: "#475569", lineHeight: 1.8, marginBottom: "30px", fontSize: "15px" }}>{spot.details_config?.description}</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "40px" }}>
                {spot.details_config?.features?.map((f: any, i: number) => (
                  <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center", background: "#f9fafb", padding: "12px", borderRadius: "12px", border: "1px solid #e5e5e5" }}>
                    <div style={{ color: "#14b8a6" }}>{getIcon(f.icon)}</div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8" }}>{f.label.toUpperCase()}</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{f.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: "#fff", padding: "24px", borderRadius: "20px", border: "1px solid #f1f5f9" }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: "15px" }}>Beste Reisezeit</h3>
                <div style={{ display: "flex", gap: "6px" }}>
                  {["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"].map((monat, i) => {
                    const istAktiv = spot.best_months?.includes(i);
                    return (
                      <div key={monat} style={{ 
                        padding: "8px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 800,
                        background: istAktiv ? "#14b8a6" : "#f1f5f9", color: istAktiv ? "#fff" : "#94a3b8" 
                      }}>
                        {monat}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 24, padding: "20px", border: "1px solid #f1f5f9", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <MapPin size={22} color="#14b8a6" />
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Lage</h2>
              </div>
              <div style={{ height: 230, borderRadius: 16, overflow: "hidden" }}>
                 <MapBoxMini lat={spot.latitude} lng={spot.longitude} />
              </div>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {icon}
        {label}
      </div>
      <div style={{ color: "#1e293b", fontSize: 14, fontWeight: 700, paddingLeft: 24 }}>
        {value}
      </div>
    </div>
  );
}

function getIcon(name: string) {
  const size = 18;
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