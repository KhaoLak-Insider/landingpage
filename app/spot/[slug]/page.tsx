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
      <main style={{
        padding: 40,
        textAlign: "center",
        minHeight: "100vh",
        background: "#f6f7fb"
      }}>
        <h1>Ort nicht gefunden</h1>
      </main>
    );
  }

  return (
    <main style={{ background: "#f6f7fb", minHeight: "100vh" }}>

      {/* 1. HEADER NAV */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#ffffff",
        borderBottom: "1px solid #ddd"
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ fontWeight: 800, color: "#000" }}>Khao Lak Insider 🌴</div>
          <nav style={{ display: "flex", gap: 18, fontSize: 14 }}>
            <Link href="/entdecken">Entdecken</Link>
            <Link href="/planen">Planen</Link>
            <Link href="/erleben">Erleben</Link>
            <Link href="/favoriten">Favoriten</Link>
            <Link href="/community">Community</Link>
          </nav>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <div style={{ position: "relative", width: "100%", height: "50vh" }}>
        <img
          src={spot.image_url}
          alt={spot.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)" }} />
      </div>

      {/* 3. CONTENT WRAPPER */}
      <div style={{ maxWidth: 1100, margin: "-80px auto 40px auto", padding: "0 24px" }}>
        <div style={{
          background: "#fff",
          borderRadius: 24,
          padding: 40,
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 40
        }}>
          
          {/* LINKER BEREICH */}
          <div>
            <span style={{ 
                background: "#f0fdfa", 
                color: "#14b8a6", 
                padding: "4px 12px", 
                borderRadius: 999, 
                fontSize: 12, 
                fontWeight: 700 
            }}>
              {spot.category}
            </span>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: "16px 0" }}>{spot.title}</h1>
            <p style={{ color: "#4b5563", lineHeight: 1.8, fontSize: 16, marginBottom: 40 }}>
              {spot.long_description || spot.description}
            </p>

            <h3 style={{ marginBottom: 16 }}>📍 Standort</h3>
            <div style={{ borderRadius: 20, overflow: "hidden", height: 250, border: "1px solid #f3f4f6" }}>
              <MapBoxMini lat={spot.latitude} lng={spot.longitude} />
            </div>
            
            {/* INFO GRID */}
            <div style={{ marginTop: 30, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <div style={card}><div style={label}>📍 Koordinaten</div><div style={value}>{spot.latitude?.toFixed(2)}, {spot.longitude?.toFixed(2)}</div></div>
              <div style={card}><div style={label}>🏷 Kategorie</div><div style={value}>{spot.category}</div></div>
              <div style={card}><div style={label}>⭐ Level</div><div style={value}>Geheimtipp</div></div>
            </div>
          </div>

          {/* RECHTER BEREICH: Sidebar */}
          <div style={{ position: "sticky", top: 100, height: "fit-content" }}>
            <div style={{ background: "#f9fafb", borderRadius: 20, padding: 24, border: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: 14, color: "#14b8a6", fontWeight: 700 }}>Insider Spot</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>{spot.title}</div>
              <div style={{ marginTop: 12, fontSize: 13, color: "#666" }}>Perfekt für deinen Khao Lak Trip</div>
              
              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                <button style={{ background: "#14b8a6", color: "#fff", border: "none", padding: 14, borderRadius: 12, fontWeight: 600, cursor: "pointer" }}>
                  Route starten
                </button>
                <button style={{ background: "#fff", border: "1px solid #ddd", padding: 14, borderRadius: 12, fontWeight: 600, cursor: "pointer" }}>
                  ❤️ Favorit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ===== STYLES ===== */
const card: React.CSSProperties = { 
    background: "#fff", 
    padding: 14, 
    borderRadius: 14, 
    border: "1px solid #eee" 
};

const label: React.CSSProperties = { 
    fontSize: 11, 
    color: "#9ca3af", 
    fontWeight: 700, 
    textTransform: "uppercase", 
    marginBottom: 4 
};

const value: React.CSSProperties = { 
    fontSize: 14, 
    fontWeight: 600, 
    color: "#111" 
};