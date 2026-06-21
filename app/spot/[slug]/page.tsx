import { supabase } from "@/src/lib/supabase";
import MapBoxMini from "@/src/components/MapBoxMini";

export default async function SpotPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: spot } = await supabase.from("spots").select("*").eq("slug", decodeURIComponent(slug.trim())).maybeSingle();

  if (!spot) return <div style={{ padding: 40, textAlign: "center" }}>Ort nicht gefunden</div>;

  // Seiten-Konfiguration
  const borderColor = "#e5e5e5"; // Farbe für die vertikalen Linien

  return (
    <main style={{ 
      background: "#f6f7fb", 
      minHeight: "100vh", 
      display: "flex", 
      justifyContent: "center" 
    }}>
      
      {/* Linke graue Linie */}
      <div style={{ width: "1px", background: borderColor }} />

      {/* ZENTRALER WEISSER INHALTSBEREICH */}
      <div style={{ width: "100%", maxWidth: 1100, background: "#fff" }}>
        
        {/* HERO */}
        <div style={{ height: "60vh", width: "100%", position: "relative" }}>
          <img src={spot.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          
          {/* ÜBERLEGENDE SIDEBAR (Absolute Positionierung für den Überlappungseffekt) */}
          <aside style={{ 
            position: "absolute", 
            top: "40%", 
            right: 40, 
            width: 350, 
            background: "#fff", 
            borderRadius: 24, 
            padding: 32, 
            boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
            zIndex: 20 
          }}>
            <h3 style={{ fontSize: 18, marginBottom: 24 }}>Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <InfoItem label="Kategorie" value={spot.category} />
              <InfoItem label="Koordinaten" value={`${spot.latitude?.toFixed(2)}, ${spot.longitude?.toFixed(2)}`} />
              <InfoItem label="Insider Level" value="Geheimtipp" />
            </div>
            <button style={{ width: "100%", marginTop: 32, padding: 16, background: "#000", color: "#fff", borderRadius: 12, border: "none", fontWeight: 600 }}>
              Route starten
            </button>
          </aside>
        </div>

        {/* CONTENT UNTER DEM HERO */}
        <div style={{ padding: 48 }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 24 }}>{spot.title}</h1>
          <p style={{ color: "#444", lineHeight: 1.8, fontSize: 16, maxWidth: 650 }}>{spot.long_description}</p>
          
          <h2 style={{ fontSize: 22, marginTop: 40, marginBottom: 20 }}>Lage</h2>
          <div style={{ height: 350, borderRadius: 20, overflow: "hidden", maxWidth: 700 }}>
            <MapBoxMini lat={spot.latitude} lng={spot.longitude} />
          </div>
        </div>
      </div>

      {/* Rechte graue Linie */}
      <div style={{ width: "1px", background: borderColor }} />
    </main>
  );
}

function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: 12 }}>
      <span style={{ color: "#888", fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: 14 }}>{value}</span>
    </div>
  );
}