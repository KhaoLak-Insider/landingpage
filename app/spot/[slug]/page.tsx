"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import MapBoxMini from "@/src/components/MapBoxMini";
import { MapPin, Tag, Navigation, DollarSign, Clock, Car, Play, AlertCircle } from "lucide-react"; 
import { iconMap } from "@/src/components/IconLibrary";
import Link from "next/link";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export default function SpotPage({ params }: { params: Promise<{ slug: string }> }) {
  const [spot, setSpot] = useState<any>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [routeDist, setRouteDist] = useState<string | null>(null);
  const [routeTime, setRouteTime] = useState<number | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);

  // Distanz berechnen (Haversine-Formel)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  };

  const fetchDrivingDistance = async (start: {lat: number, lng: number}, end: {lat: number, lng: number}) => {
  setIsRouting(true);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  // WICHTIG: Hier &geometries=geojson anhängen
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?access_token=${token}&geometries=geojson&overview=full`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      setRouteDist((data.routes[0].distance / 1000).toFixed(1));
      setRouteTime(Math.round(data.routes[0].duration / 60));
      
      // HIER wird die GeoJSON-Geometrie in den State geladen
      setRouteGeoJSON(data.routes[0].geometry); 
    }
  } catch (e) { console.error("Routing Fehler:", e); }
  finally { setIsRouting(false); }
};

  useEffect(() => {
    async function initPage() {
      const resolvedParams = await params;
      const decodedSlug = decodeURIComponent(resolvedParams.slug.trim());
      
      // 1. Spot laden
      const { data: spotData } = await supabase
        .from("spots")
        .select("*")
        .ilike("slug", decodedSlug)
        .maybeSingle();

      if (spotData) {
        setSpot(spotData);
        let parsedGallery = [];
        if (spotData.gallery_urls) {
          try {
            parsedGallery = Array.isArray(spotData.gallery_urls) ? spotData.gallery_urls : JSON.parse(spotData.gallery_urls);
          } catch (e) { parsedGallery = []; }
        }
        setGallery(parsedGallery);

        // 2. Profil laden
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("hotel_id, custom_hotel_lat, custom_hotel_lng, hotels(lat, lng)")
            .eq("id", user.id)
            .maybeSingle();
          
          setUserProfile(profileData);

          // Wir behandeln 'hotels' explizit als Array, um TypeScript zufrieden zu stellen,
// aber wir prüfen zur Laufzeit auf das erste Element, um die Daten zu erhalten.
const hotelData = Array.isArray(profileData?.hotels) ? profileData.hotels[0] : (profileData?.hotels as any);

const hLat = profileData?.hotel_id ? hotelData?.lat : profileData?.custom_hotel_lat;
const hLng = profileData?.hotel_id ? hotelData?.lng : profileData?.custom_hotel_lng;
          
          if (hLat && hLng) {
            fetchDrivingDistance({lat: hLat, lng: hLng}, {lat: spotData.latitude, lng: spotData.longitude});
          }
        }
      }
    }
    initPage();
  }, [params]);

  if (!spot) return <main style={{ padding: 40, textAlign: "center", minHeight: "100vh" }}>Spot wird geladen....</main>;

  const slides = gallery.map((url: string) => ({ src: url }));

  return (
    <main style={{ background: "#f6f7fb", minHeight: "100vh", fontFamily: "'Poppins', sans-serif", paddingBottom: 60, color: "#1e293b" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", background: "#ffffff", minHeight: "100vh", boxShadow: "0 0 20px rgba(0,0,0,0.05)", overflow: "visible" }}>

        {/* HERO */}
        <div style={{ position: "relative", width: "100%", height: "450px" }}>
          <img src={spot.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          
          <Link href="/entdecken" style={{ position: "absolute", top: "30px", left: "30px", zIndex: 20, display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.9)", padding: "10px 20px", borderRadius: "50px", fontSize: "14px", fontWeight: 600, color: "#333", textDecoration: "none", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Zurück zu allen Spots
          </Link>

          <div style={{ position: "absolute", bottom: "40px", left: "40px", zIndex: 10, display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start", maxWidth: "calc(100% - 400px)" }}>
            <div style={{ background: "#14b8a6", color: "#fff", padding: "6px 16px", borderRadius: "50px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", width: "fit-content" }}>
              {spot.category}
            </div>
            <h1 style={{ color: "#fff", fontSize: 48, fontWeight: 800, letterSpacing: "-0.02em", margin: 0, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              {spot.title}
            </h1>
            <p style={{ color: "#fff", fontSize: 16, fontWeight: 300, margin: 0, opacity: 0.9, textShadow: "0 1px 5px rgba(0,0,0,0.5)" }}>
              {spot.description}
            </p>
          </div>
        </div>

        {/* CONTENT LAYOUT: FLEX COL */}
        <div style={{ display: "flex", gap: "40px", padding: "40px", alignItems: "start" }}>
          
          {/* MAIN COLUMN */}
          <div style={{ flex: 1 }}>
            
            {/* GALERIE */}
            {gallery.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "40px" }}>
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

            {/* FEATURES, REISEZEIT & KARTE */}
            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {spot.details_config?.features?.map((f: any, i: number) => (
                  <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center", background: "#f9fafb", padding: "10px", borderRadius: "12px", border: "1px solid #e5e5e5" }}>
                    <div style={{ color: "#14b8a6" }}>{getIcon(f.icon)}</div>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8" }}>{(f.label || "").toUpperCase()}</div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{f.value || "-"}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* LAGE KARTE */}
              <div style={{ background: "#fff", borderRadius: 24, padding: "20px", border: "1px solid #f1f5f9", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <MapPin size={22} color="#14b8a6" />
                  <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Lage</h2>
                </div>
                <div style={{ height: 300, borderRadius: 16, overflow: "hidden" }}>
                    <MapBoxMini lat={spot.latitude} lng={spot.longitude} route={routeGeoJSON} />
                </div>
              </div>

              {/* BESCHREIBUNG */}
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: "20px" }}>Über {spot.title}</h2>
                {(() => {
                  let descriptionData = spot.long_description;
                  if (typeof descriptionData === 'string' && descriptionData.startsWith('[')) {
                    try { descriptionData = JSON.parse(descriptionData); } catch (e) { }
                  }
                  if (Array.isArray(descriptionData)) {
                    return descriptionData.map((block: any, i: number) => {
                      if (block.type === 'heading') return <h3 key={i} style={{ fontSize: 20, fontWeight: 700, marginTop: "24px", marginBottom: "12px" }}>{block.content}</h3>;
                      if (block.type === 'paragraph') return <p key={i} style={{ color: "#475569", lineHeight: 1.8, fontSize: "15px", marginBottom: "16px" }}>{block.content}</p>;
                      return null;
                    });
                  }
                  return (descriptionData || "").split('\n').map((line: string, i: number) => {
                    if (line.trim().startsWith('###')) {
                      const cleanHeading = line.trim().replace(/###\s?/, '');
                      return <h3 key={i} style={{ fontSize: 20, fontWeight: 700, marginTop: "24px", marginBottom: "12px" }}>{cleanHeading}</h3>;
                    }
                    if (line.trim() === '') return null;
                    return <p key={i} style={{ color: "#475569", lineHeight: 1.8, fontSize: "15px", marginBottom: "16px" }}>{line}</p>;
                  });
                })()}
              </div>
            </div>
          </div>

          {/* SIDEBAR (Sticky) */}
          <aside style={{ width: 320, position: "sticky", top: "20px", marginTop: "-430px", alignSelf: "start" }}>
            <div style={{ background: "#ffffff", borderRadius: 24, padding: "32px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
              <h3 style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 32 }}>Spot Informationen</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 40 }}>
                <InfoItem icon={<Tag size={16} />} label="Kategorie" value={spot.category} />
                <InfoItem icon={<Navigation size={16} />} label="Fahrtweg" value={isRouting ? "..." : routeDist ? `${routeDist} km (${routeTime} Min.)` : "Eintragen"} />
                <InfoItem icon={<DollarSign size={16} />} label="Budget" value={spot.price_level || "Keine Angabe"} />
                <InfoItem icon={<Clock size={16} />} label="Öffnungszeiten" value={spot.opening_hours || "Keine Angabe"} />
                
                {/* Parkplatz-Infos */}
                {spot.parking_info?.name && (
                  <>
                    <InfoItem icon={<Car size={16} />} label="Parkplatz" value={spot.parking_info.name} />
                    <InfoItem icon={<DollarSign size={16} />} label="Parkkosten" value={spot.parking_info.price || "Keine Angabe"} />
                    <InfoItem icon={<MapPin size={16} />} label="Details" value={spot.parking_info.details || "-"} />
                  </>
                )}
              </div>

              <a 
  href={`https://www.google.com/maps/dir/?api=1&origin=${userProfile?.custom_hotel_lat || userProfile?.hotels?.lat},${userProfile?.custom_hotel_lng || userProfile?.hotels?.lng}&destination=${spot.parking_info?.lat || spot.latitude},${spot.parking_info?.lng || spot.longitude}&travelmode=driving`}
  target="_blank"
  rel="noopener noreferrer"
  style={{ width: "100%", padding: "14px", background: "#0f172a", color: "#fff", borderRadius: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none" }}
>
  <Navigation size={16} /> Route starten
</a>

<a 
  href={`mailto:info@khaolak.app?subject=Änderungsvorschlag für ${spot.title}`}
  style={{ marginTop: "12px", width: "100%", padding: "14px", background: "#f1f5f9", color: "#475569", borderRadius: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none" }}
>
  <AlertCircle size={16} /> Änderung melden
</a>

              {spot.youtube_url && (
                <a 
                  href={spot.youtube_url.includes('?') 
                    ? `${spot.youtube_url}&t=${spot.youtube_timestamp || 0}` 
                    : `${spot.youtube_url}?t=${spot.youtube_timestamp || 0}`
                  } 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ marginTop: "12px", width: "100%", padding: "14px", background: "#ef4444", color: "#fff", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", fontWeight: 600 }}
                >
                  <Play size={16} /> YouTube Video
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
      <Lightbox open={open} close={() => setOpen(false)} slides={slides} index={index} on={{ view: ({ index: i }) => setIndex(i) }} />
    </main>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ color: "#14b8a6", background: "#f0fdfa", padding: "8px", borderRadius: "8px" }}>{icon}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>{value}</span>
      </div>
    </div>
  );
}

function getIcon(name: string) {
  const IconComponent = iconMap[name as keyof typeof iconMap];
  return IconComponent ? <IconComponent size={18} /> : <MapPin size={18} />;
}