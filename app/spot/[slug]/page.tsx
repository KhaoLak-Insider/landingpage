import { supabase } from "@/src/lib/supabase";
import MapBoxMini from "@/src/components/MapBoxMini";
import Link from "next/link";

export default async function SpotPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: spot } = await supabase.from("spots").select("*").eq("slug", decodeURIComponent(slug.trim())).maybeSingle();

  if (!spot) return <div style={{ padding: 40, textAlign: "center" }}>Ort nicht gefunden</div>;

  return (
    <main style={{ background: "#ffffff", minHeight: "100vh", fontFamily: "sans-serif" }}>
      
      {/* 1. HEADER (Dein Original) */}
      <header style={{ padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee" }}>
        <div style={{ fontWeight: 800, fontSize: 20 }}>Khao Lak Insider 🌴</div>
        <nav style={{ display: "flex", gap: 24, fontSize: 14, color: "#444" }}>
          {["Entdecken", "Kategorien", "Karte", "Favoriten", "Über uns"].map(item => (
            <Link key={item} href={`/${item.toLowerCase()}`}>{item}</Link>
          ))}
        </nav>
      </header>

      {/* 2. HERO */}
      <div style={{ height: "60vh", width: "100%", position: "relative" }}>
        <img src={spot.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* 3. LAYOUT GRID */}
      <div style={{ maxWidth: 1100, margin: "-60px auto 100px auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 350px", gap: 40 }}>
        
        {/* LINKS: Content */}
        <div>
          <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 16 }}>{spot.title}</h1>
          <p style={{ fontSize: 16, color: "#666", marginBottom: 40 }}>{spot.long_description}</p>
          
          {/* Foto-Grid Platzhalter */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: 120, background: "#eee", borderRadius: 12 }} />)}
          </div>

          <h2 style={{ fontSize: 24, marginBottom: 20 }}>Lage</h2>
          <div style={{ height: 350, borderRadius: 24, overflow: "hidden", marginBottom: 40 }}>
            <MapBoxMini lat={spot.latitude} lng={spot.longitude} />
          </div>
        </div>

        {/* RECHTS: Sidebar */}
        <aside style={{ position: "sticky", top: 24, height: "fit-content" }}>
          <div style={{ background: "#f8f9fa", borderRadius: 24, padding: 32, border: "1px solid #eee" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <InfoItem label="Koordinaten" value={`${spot.latitude?.toFixed(2)}, ${spot.longitude?.toFixed(2)}`} />
              <InfoItem label="Kategorie" value={spot.category} />
              <InfoItem label="Beste Zeit" value="Nov - April" />
              <InfoItem label="Entfernung" value="12 Min." />
            </div>
            <button style={{ width: "100%", marginTop: 32, padding: 16, background: "#00a396", color: "#fff", borderRadius: 12, border: "none", fontWeight: 600 }}>Route starten</button>
          </div>
        </aside>
      </div>
    </main>
  );
}

function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e5e5", paddingBottom: 12 }}>
      <span style={{ color: "#888", fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: 14 }}>{value}</span>
    </div>
  );
}