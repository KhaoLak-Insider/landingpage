import { supabase } from "@/src/lib/supabase";

export default async function SpotPage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: spot } = await supabase
    .from("spots")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!spot) {
    return <div>Not found</div>;
  }

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>

      <img
        src={spot.image_url}
        style={{
          width: "100%",
          height: 300,
          objectFit: "cover",
          borderRadius: 18,
        }}
      />

      <h1 style={{ marginTop: 20 }}>{spot.title}</h1>

      <p style={{ color: "#666", lineHeight: 1.6 }}>
        {spot.long_description || spot.description}
      </p>

      <span style={{
        padding: "6px 12px",
        borderRadius: 999,
        background: "#f3f4f6",
        display: "inline-block",
        marginTop: 10
      }}>
        {spot.category}
      </span>

    </main>
  );
}