import { supabase } from "@/src/lib/supabase";

export default async function EntdeckenPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const category = searchParams?.category;

  let query = supabase
    .from("spots")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (category && category !== "Alle") {
    query = query.eq("category", category);
  }

  const { data: spots } = await query;

  const categories = [
    "Alle",
    "Strand",
    "Natur",
    "Restaurant",
    "Markt",
    "Tempel",
    "Geheimtipp",
  ];

  return (
    <main style={{ background: "#f6f7fb", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <h1>Entdecken 🌴</h1>

        {/* FILTERS (REAL LINKS) */}
        <div style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          marginTop: 16
        }}>
          {categories.map((cat) => (
            <a
              key={cat}
              href={`/entdecken${cat !== "Alle" ? `?category=${cat}` : ""}`}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                background: category === cat ? "#22c55e" : "white",
                color: category === cat ? "white" : "black",
                border: "1px solid #e5e7eb",
                whiteSpace: "nowrap",
                textDecoration: "none",
                fontSize: 13
              }}
            >
              {cat}
            </a>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 24px 40px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 20,
      }}>

        {spots?.map((spot) => (
          <a
            key={spot.id}
            href={`/spot/${spot.slug}`}
            style={{
              background: "white",
              borderRadius: 18,
              overflow: "hidden",
              textDecoration: "none",
              color: "inherit",
              boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
            }}
          >

            <img
              src={spot.image_url}
              style={{
                width: "100%",
                height: 190,
                objectFit: "cover",
              }}
            />

            <div style={{ padding: 12 }}>
              <h3 style={{ margin: 0 }}>{spot.title}</h3>

              <p style={{
                fontSize: 13,
                color: "#6b7280"
              }}>
                {spot.description?.slice(0, 80)}...
              </p>
            </div>

          </a>
        ))}

      </div>
    </main>
  );
}