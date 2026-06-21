import { supabase } from "@/src/lib/supabase";

export default async function EntdeckenPage() {
  const { data: spots } = await supabase
    .from("spots")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <main style={{ background: "#f6f7fb", minHeight: "100vh", padding: 24 }}>

      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Entdecken 🌴</h1>
        <p style={{ color: "#666", marginTop: 6 }}>
          Finde die besten Orte in Khao Lak
        </p>
      </div>

      {/* FILTER BAR (Airbnb-like) */}
      <div style={{
        display: "flex",
        gap: 10,
        overflowX: "auto",
        paddingBottom: 12,
        marginBottom: 20
      }}>
        {["Alle", "Strand", "Natur", "Restaurant", "Markt", "Tempel", "Geheimtipp"].map((cat) => (
          <div
            key={cat}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              background: "white",
              border: "1px solid #e5e7eb",
              whiteSpace: "nowrap",
              fontSize: 13,
              cursor: "pointer"
            }}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 18,
        }}
      >
        {spots?.map((spot) => (
          <div
            key={spot.id}
            style={{
              background: "white",
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
              cursor: "pointer",
              transition: "transform 0.2s ease",
            }}
          >

            {/* IMAGE */}
            {spot.image_url && (
              <div style={{ position: "relative" }}>
                <img
                  src={spot.image_url}
                  alt={spot.title}
                  style={{
                    width: "100%",
                    height: 180,
                    objectFit: "cover",
                  }}
                />

                {/* CATEGORY BADGE */}
                <div style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  background: "rgba(255,255,255,0.9)",
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 500,
                }}>
                  {spot.category}
                </div>
              </div>
            )}

            {/* CONTENT */}
            <div style={{ padding: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>
                {spot.title}
              </h3>

              <p style={{
                marginTop: 6,
                fontSize: 13,
                color: "#6b7280",
                lineHeight: 1.4
              }}>
                {spot.description?.slice(0, 80)}...
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}