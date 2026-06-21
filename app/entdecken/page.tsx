import { supabase } from "@/src/lib/supabase";

export default async function EntdeckenPage() {
  const { data: spots } = await supabase
    .from("spots")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <main style={{ padding: 24 }}>
      <h1>Entdecken 🌴</h1>

      <div style={{ display: "grid", gap: 16, marginTop: 20 }}>
        {spots?.map((spot) => (
          <div
            key={spot.id}
            style={{
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid #eee",
              padding: 12,
            }}
          >
            {/* IMAGE */}
            {spot.image_url && (
              <img
                src={spot.image_url}
                alt={spot.title}
                style={{
                  width: "100%",
                  height: 180,
                  objectFit: "cover",
                  borderRadius: 12,
                }}
              />
            )}

            {/* CONTENT */}
            <h2 style={{ marginTop: 10 }}>{spot.title}</h2>
            <p style={{ color: "#666" }}>{spot.description}</p>

            <span
              style={{
                fontSize: 12,
                padding: "4px 8px",
                borderRadius: 8,
                background: "#f3f4f6",
                display: "inline-block",
              }}
            >
              {spot.category}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}