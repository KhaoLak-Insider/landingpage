import { supabase } from "@/src/lib/supabase";
import MapBoxMini from "@/src/components/MapBoxMini";

export default async function SpotPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug.trim());
  const { data: spot } = await supabase.from("spots").select("*").eq("slug", decodedSlug).maybeSingle();

  if (!spot) return <div style={{ padding: 40, textAlign: "center" }}>Ort nicht gefunden</div>;

  return (
    <main style={{ background: "#f6f7fb", minHeight: "100vh", paddingBottom: 100 }}>
      {/* 1. HERO IMAGE */}
      <div style={{ height: "60vh", width: "100%" }}>
        <img src={spot.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* 2. LAYOUT GRID */}
      <div style={{ 
        maxWidth: 1100, 
        margin: "-120px auto 0 auto", // Zieht die Box nach oben über das Bild
        padding: "0 24px", 
        display: "grid", 
        gridTemplateColumns: "1fr 380px", 
        gap: 32,
        position: "relative",
        zIndex: 10
      }}>
        
        {/* LINKS: CONTENT */}
        <div style={{ background: "#fff", borderRadius: 24, padding: 48, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 24 }}>{spot.title}</h1>
          <p style={{ color: "#444", lineHeight: 1.8, fontSize: 16 }}>{spot.long_description}</p>
          
          <h2 style={{ fontSize: 22, marginTop: 40, marginBottom: 20 }}>Lage</h2>
          <div style={{ height: 350, borderRadius: 20, overflow: "hidden" }}>
            <MapBoxMini lat={spot.latitude} lng={spot.longitude} />
          </div>
        </div>

        {/* RECHTS: STICKY SIDEBAR */}
        <aside style={{ position: "sticky", top: 24, height: "fit-content" }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: 32, boxShadow: "0 20px 50px rgba(0,0,0,0.1)", border: "1px solid #eee" }}>
            <h3 style={{ fontSize: 18, marginBottom: 24 }}>Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <InfoItem label="Kategorie" value={spot.category} />
              <InfoItem label="Koordinaten" value={`${spot.latitude?.toFixed(2)}, ${spot.longitude?.toFixed(2)}`} />
              <InfoItem label="Insider Level" value="Geheimtipp" />
            </div>
            <button style={{ width: "100%", marginTop: 32, padding: 16, background: "#000", color: "#fff", borderRadius: 12, border: "none", fontWeight: 600, cursor: "pointer" }}>
              Route starten
            </button>
          </div>
        </aside>
      </div>
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