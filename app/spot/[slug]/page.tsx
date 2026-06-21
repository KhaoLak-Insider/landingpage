import { supabase } from "@/src/lib/supabase";
import MapBoxMini from "@/src/components/MapBoxMini";

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
      <main style={{ padding: 40, textAlign: "center", minHeight: "100vh" }}>
        <h1>Ort nicht gefunden.</h1>
      </main>
    );
  }

  return (
    <main style={{ background: "#f6f7fb", minHeight: "100vh", padding: "40px 24px" }}>
      
      {/* Container */}
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* CARD */}
        <div style={{
          background: "#fff",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
          border: "1px solid #eee"
        }}>
          
          {/* HERO IMAGE */}
          <div style={{ width: "100%", aspectRatio: "16 / 9" }}>
            <img
              src={spot.image_url}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
              alt={spot.title}
            />
          </div>

          {/* CONTENT */}
          <div style={{ padding: 32 }}>
            
            {/* HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ 
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: 999,
                  background: "#f0fdfa",
                  color: "#14b8a6",
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 12
                }}>
                  {spot.category}
                </span>

                <h1 style={{
                  fontSize: 32,
                  fontWeight: 800,
                  margin: 0,
                  color: "#111"
                }}>
                  {spot.title}
                </h1>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div style={{
              marginTop: 24,
              fontSize: 16,
              lineHeight: 1.7,
              color: "#444"
            }}>
              {spot.description}
            </div>

          {/* 🗺 MAP PLACEHOLDER */}
<div style={{
  marginTop: 24,
  borderRadius: 16,
  overflow: "hidden",
  border: "1px solid #eee",
  background: "#f3f4f6"
}}>
  <div style={{
    padding: 12,
    fontSize: 12,
    fontWeight: 600,
    color: "#666",
    background: "#fff",
    borderBottom: "1px solid #eee"
  }}>
    🗺 Ungefähre Lage
  </div>

  <div style={{
    height: 220,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#777",
    fontSize: 14
  }}>
    Map Placeholder
  </div>
</div>

            {/* INFO GRID */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginTop: 32
            }}>
              
              <div style={cardStyle}>
                <div style={labelStyle}>📍 Location</div>
                <div style={valueStyle}>
                  {spot.latitude
                    ? `${spot.latitude.toFixed(2)}, ${spot.longitude.toFixed(2)}`
                    : "-"}
                </div>
              </div>

              <div style={cardStyle}>
                <div style={labelStyle}>🏷 Kategorie</div>
                <div style={valueStyle}>{spot.category}</div>
              </div>

              <div style={cardStyle}>
                <div style={labelStyle}>⭐ Insider Level</div>
                <div style={valueStyle}>Geheimtipp</div>
              </div>

            </div>
          </div>
        </div>

        {/* VIDEO */}
        {spot.youtube_url && (
          <div style={{ marginTop: 32 }}>
            <h3 style={{ marginBottom: 16, fontSize: 18 }}>
              🎥 Video-Eindruck
            </h3>

            <div style={{ aspectRatio: "16 / 9", width: "100%" }}>
              <iframe
                src={spot.youtube_url}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 24,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              />
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

// STYLES
const cardStyle: React.CSSProperties = {
  background: "#f9fafb",
  borderRadius: 16,
  padding: 16,
  border: "1px solid #f3f4f6"
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#9ca3af",
  fontWeight: 700,
  marginBottom: 4
};

const valueStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#111"
};