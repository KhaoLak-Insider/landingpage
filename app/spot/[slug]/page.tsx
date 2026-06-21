import { supabase } from "@/src/lib/supabase";

// params ist Promise → bleibt GENAU wie bei dir
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
    return <div style={{ padding: 40 }}>Not found</div>;
  }

  return (
    <main style={{ background: "#f6f7fb", minHeight: "100vh" }}>

      {/* HERO IMAGE */}
      <div style={{
  width: "100%",
  height: "420px",
  overflow: "hidden",
  position: "relative"
}}>
  <img
    src={spot.image_url}
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "center" // 👈 DAS FEHLT BEI DIR
    }}
  />

  {/* soft fade like Airbnb */}
  <div style={{
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.35), transparent)"
  }} />
</div>

      {/* CONTENT WRAPPER */}
      <div style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "24px"
      }}>

        {/* TITLE + CATEGORY */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: -40
        }}>
          <div>
            <h1 style={{
              fontSize: 30,
              fontWeight: 800,
              color: "#111",
              marginBottom: 6
            }}>
              {spot.title}
            </h1>

            <span style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: 999,
              background: "#14b8a6",
              color: "#fff",
              fontSize: 12
            }}>
              {spot.category}
            </span>
          </div>

          {/* ACTION BUTTON */}
          <button style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
            background: "#fff",
            cursor: "pointer"
          }}>
            ❤️ Favorit
          </button>
        </div>

        {/* DESCRIPTION */}
        <div style={{ marginTop: 20 }}>
          <p style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: "#444"
          }}>
            {spot.description}
          </p>
        </div>

        {/* INFO CARDS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginTop: 25
        }}>

          <div style={card}>
            📍 <b>Location</b>
            <div style={sub}>{spot.latitude}, {spot.longitude}</div>
          </div>

          <div style={card}>
            🏷 <b>Category</b>
            <div style={sub}>{spot.category}</div>
          </div>

          <div style={card}>
            ⭐ <b>Insider Level</b>
            <div style={sub}>Hidden Gem</div>
          </div>

        </div>

        {/* OPTIONAL SECTION */}
        {spot.youtube_url && (
          <div style={{ marginTop: 30 }}>
            <h3 style={{ marginBottom: 10 }}>🎥 Video</h3>
            <iframe
              src={spot.youtube_url}
              style={{
                width: "100%",
                height: 260,
                borderRadius: 12,
                border: "none"
              }}
            />
          </div>
        )}

      </div>
    </main>
  );
}

// CARD STYLE (klein, sauber ausgelagert)
const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 14,
  padding: 14,
  border: "1px solid #eee"
};

const sub: React.CSSProperties = {
  fontSize: 13,
  color: "#666",
  marginTop: 4
};