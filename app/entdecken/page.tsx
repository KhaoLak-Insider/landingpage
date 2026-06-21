import { supabase } from "@/src/lib/supabase";

export default async function EntdeckenPage() {
  const { data: spots } = await supabase
    .from("spots")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <main style={{ background: "#f6f7fb", minHeight: "100vh" }}>

      {/* HERO HEADER */}
      <div style={{
        padding: "32px 24px 10px 24px",
        maxWidth: 1200,
        margin: "0 auto"
      }}>
        <h1 style={{ fontSize: 34, margin: 0, fontWeight: 700 }}>
          Entdecken 🌴
        </h1>

        <p style={{ color: "#666", marginTop: 6 }}>
          Finde echte Highlights in Khao Lak
        </p>

        {/* SEARCH BAR */}
        <div style={{
          marginTop: 18,
          display: "flex",
          gap: 12,
        }}>
          <input
            placeholder="Suche nach Orten, Stränden, Restaurants..."
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              outline: "none",
              fontSize: 14
            }}
          />

          <button style={{
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: "white",
            cursor: "pointer"
          }}>
            Filter
          </button>
        </div>

        {/* CATEGORY PILLS */}
        <div style={{
          marginTop: 16,
          display: "flex",
          gap: 10,
          overflowX: "auto",
          paddingBottom: 6
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
      </div>

      {/* GRID CONTAINER */}
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 24px 40px 24px"
      }}>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 20,
        }}>

          {spots?.map((spot) => (
            <div
              key={spot.id}
              style={{
                background: "white",
                borderRadius: 18,
                overflow: "hidden",
                boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
                cursor: "pointer",
                transition: "transform 0.2s ease",
              }}
            >

              {/* IMAGE */}
              <div style={{ position: "relative" }}>
                <img
                  src={spot.image_url}
                  alt={spot.title}
                  style={{
                    width: "100%",
                    height: 190,
                    objectFit: "cover",
                  }}
                />

                {/* HEART */}
                <div style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  background: "rgba(255,255,255,0.9)",
                  borderRadius: 999,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14
                }}>
                  ♡
                </div>

                {/* CATEGORY BADGE */}
                <div style={{
                  position: "absolute",
                  bottom: 10,
                  left: 10,
                  background: "rgba(255,255,255,0.92)",
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 500
                }}>
                  {spot.category}
                </div>
              </div>

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
                  {spot.description?.slice(0, 90)}...
                </p>
              </div>

            </div>
          ))}

        </div>

      </div>
    </main>
  );
}