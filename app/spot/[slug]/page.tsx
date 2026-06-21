import { supabase } from "@/src/lib/supabase";
import MapBoxMini from "@/src/components/MapBoxMini";
import Link from "next/link";

export default async function SpotPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug.trim());

  const { data: spot, error } = await supabase
    .from("spots")
    .select("*")
    .eq("slug", decodedSlug)
    .maybeSingle();

  if (error || !spot) {
    return (
      <main style={{ padding: 40, textAlign: "center", minHeight: "100vh", background: "#f6f7fb" }}>
        <h1>Ort nicht gefunden</h1>
      </main>
    );
  }

  return (
    <main style={{ background: "#f6f7fb", minHeight: "100vh", paddingBottom: 60 }}>
      
      {/* 1. HERO SECTION */}
      <div style={{ position: "relative", width: "100%", height: "60vh" }}>
        <img
          src={spot.image_url}
          alt={spot.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)" }} />
      </div>

      {/* 2. MAIN LAYOUT GRID (Der Profi-Look) */}
      <div style={{ 
        maxWidth: 1200, 
        margin: "-100px auto 0 auto", 
        padding: "0 24px", 
        display: "grid", 
        gridTemplateColumns: "1fr 380px", 
        gap: 32,
        position: "relative",
        zIndex: 10
      }}>
        
        {/* LINKS: CONTENT CARD */}
        <div style={{ background: "#fff", borderRadius: 24, padding: 40, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
          <span style={{ background: "#f0fdfa", color: "#14b8a6", padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
            {spot.category}
          </span>
          <h1 style={{ fontSize: 40, fontWeight: 800, margin: "16px 0" }}>{spot.title}</h1>
          <p style={{ color: "#4b5563", lineHeight: 1.8, fontSize: 16, marginBottom: 40 }}>
            {spot.long_description || spot.description}
          </p>

          <h3 style={{ marginBottom: 16 }}>📍 Lage</h3>
          <div style={{ borderRadius: 20, overflow: "hidden", height: 300, border: "1px solid #f3f4f6" }}>
            <MapBoxMini lat={spot.latitude} lng={spot.longitude} />
          </div>
        </div>

        {/* RECHTS: STICKY SIDEBAR */}
        <div style={{ position: "sticky", top: 24, height: "fit-content" }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: 32, boxShadow: "0 20px 50px rgba(0,0,0,0.08)", border: "1px solid #f3f4f6" }}>
            
            <div style={{ fontSize: 14, color: "#14b8a6", fontWeight: 700 }}>Insider Spot</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>{spot.title}</h2>
            
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={infoRow}><span>Koordinaten</span> <b>{spot.latitude?.toFixed(2)}, {spot.longitude?.toFixed(2)}</b></div>
              <div style={infoRow}><span>Kategorie</span> <b>{spot.category}</b></div>
              <div style={infoRow}><span>Level</span> <b>Geheimtipp</b></div>
            </div>

            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
              <button style={{ background: "#14b8a6", color: "#fff", border: "none", padding: 16, borderRadius: 12, fontWeight: 600, cursor: "pointer" }}>
                Route starten
              </button>
              <button style={{ background: "#f3f4f6", border: "none", padding: 16, borderRadius: 12, fontWeight: 600, cursor: "pointer" }}>
                ❤️ Favorit
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ===== STYLES ===== */
const infoRow: React.CSSProperties = { 
  display: "flex", 
  justifyContent: "space-between", 
  paddingBottom: 12, 
  borderBottom: "1px solid #f3f4f6",
  fontSize: 14,
  color: "#666"
};