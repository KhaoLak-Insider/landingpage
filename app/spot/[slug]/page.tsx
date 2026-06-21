import { supabase } from "@/src/lib/supabase";
import MapBoxMini from "@/src/components/MapBoxMini";

export default async function SpotPage({
  params,
}: {
  params: { slug: string };
}) {
  // ✅ SAFE SLUG HANDLING (DEIN FIX BEHALTEN)
  const decodedSlug = decodeURIComponent(params.slug.trim());

  // ✅ SUPABASE QUERY (DEIN WORKING STATE)
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

      {/* HERO SECTION */}
      <div style={{ position: "relative" }}>

        <img
          src={spot.image_url}
          alt={spot.title}
          style={{
            width: "100%",
            height: "60vh",
            objectFit: "cover"
          }}
        />

        {/* HERO OVERLAY */}
        <div style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.1))"
        }} />

        {/* HERO TEXT */}
        <div style={{
          position: "absolute",
          bottom: 30,
          left: 30,
          right: 30,
          color: "#fff"
        }}>
          <span style={{
            background: "#14b8a6",
            padding: "6px 10px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600
          }}>
            {spot.category}
          </span>

          <h1 style={{
            marginTop: 10,
            fontSize: 42,
            fontWeight: 800
          }}>
            {spot.title}
          </h1>
        </div>
      </div>

      {/* CONTENT WRAPPER */}
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: 24,
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: 24
      }}>

        {/* LEFT SIDE */}
        <div>

          {/* DESCRIPTION CARD */}
          <div style={{
            background: "#fff",
            borderRadius: 18,
            padding: 24,
            boxShadow: "0 8px 20px rgba(0,0,0,0.05)"
          }}>
            <h2 style={{ marginBottom: 10 }}>Über diesen Ort</h2>

            <p style={{
              color: "#555",
              lineHeight: 1.7
            }}>
              {spot.long_description || spot.description}
            </p>
          </div>

          {/* MAP */}
          <div style={{
            marginTop: 20,
            background: "#fff",
            borderRadius: 18,
            padding: 16,
            boxShadow: "0 8px 20px rgba(0,0,0,0.05)"
          }}>
            <h3 style={{ marginBottom: 12 }}>📍 Lage</h3>

            <MapBoxMini
              lat={spot.latitude}
              lng={spot.longitude}
            />
          </div>

          {/* INFO GRID */}
          <div style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12
          }}>

            <div style={card}>
              <div style={label}>📍 Koordinaten</div>
              <div style={value}>
                {spot.latitude?.toFixed(2)}, {spot.longitude?.toFixed(2)}
              </div>
            </div>

            <div style={card}>
              <div style={label}>🏷 Kategorie</div>
              <div style={value}>{spot.category}</div>
            </div>

            <div style={card}>
              <div style={label}>⭐ Level</div>
              <div style={value}>Geheimtipp</div>
            </div>

          </div>
        </div>

        {/* RIGHT SIDEBAR (AIRBNB CARD) */}
        <div style={{
          position: "sticky",
          top: 20,
          height: "fit-content"
        }}>

          <div style={{
            background: "#fff",
            borderRadius: 20,
            padding: 20,
            boxShadow: "0 12px 30px rgba(0,0,0,0.08)"
          }}>

            <div style={{
              fontSize: 14,
              color: "#14b8a6",
              fontWeight: 700
            }}>
              Insider Spot
            </div>

            <div style={{
              fontSize: 22,
              fontWeight: 800,
              marginTop: 10
            }}>
              {spot.title}
            </div>

            <div style={{
              marginTop: 12,
              fontSize: 13,
              color: "#666"
            }}>
              Perfekt für deinen Khao Lak Trip
            </div>

            {/* CTA */}
            <div style={{
              marginTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: 10
            }}>

              <button style={{
                background: "#14b8a6",
                color: "#fff",
                border: "none",
                padding: 12,
                borderRadius: 12,
                fontWeight: 600,
                cursor: "pointer"
              }}>
                Route starten
              </button>

              <button style={{
                background: "#f3f4f6",
                border: "none",
                padding: 12,
                borderRadius: 12,
                cursor: "pointer"
              }}>
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
  textTransform: "uppercase"
};

const value: React.CSSProperties = {
  marginTop: 4,
  fontSize: 14,
  fontWeight: 600,
  color: "#111"
};