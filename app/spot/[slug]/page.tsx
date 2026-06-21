import { supabase } from "@/src/lib/supabase";
import MapBoxMini from "@/src/components/MapBoxMini";

export default async function SpotPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: spot } = await supabase.from("spots").select("*").eq("slug", decodeURIComponent(slug.trim())).maybeSingle();

  if (!spot) return <div style={{ padding: 40, textAlign: "center" }}>Ort nicht gefunden</div>;

  return (
    <main style={{ background: "#ffffff", minHeight: "100vh", fontFamily: "sans-serif" }}>
      {/* 1. HERO: Vollflächig */}
      <div style={{ height: "65vh", width: "100%", position: "relative" }}>
        <img src={spot.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* 2. LAYOUT: Grid für Content & Sidebar */}
      <div style={{ maxWidth: 1100, margin: "-80px auto 100px auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 350px", gap: 60, position: "relative" }}>
        
        {/* LINKS: Content */}
        <div>
          <h1 style={{ fontSize: 48, fontWeight: 800, color: "#111", marginBottom: 24 }}>{spot.title}</h1>
          <p style={{ fontSize: 18, color: "#444", lineHeight: 1.8, marginBottom: 48 }}>{spot.long_description}</p>
          
          <h2 style={{ fontSize: 24, marginBottom: 20 }}>Lage</h2>
          <div style={{ height: 350, borderRadius: 24, overflow: "hidden" }}>
            <MapBoxMini lat={spot.latitude} lng={spot.longitude} />
          </div>
        </div>

        {/* RECHTS: Sidebar (Floating Card) */}
        <aside style={{ position: "sticky", top: 24, height: "fit-content" }}>
          <div style={{ background: "#f8f9fa", borderRadius: 24, padding: 32, border: "1px solid #eee" }}>
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

// Kleine Hilfskomponente für die Liste
function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e5e5", paddingBottom: 12 }}>
      <span style={{ color: "#888", fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: 14 }}>{value}</span>
    </div>
  );
}