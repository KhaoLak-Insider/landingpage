import { supabaseServer } from "@/src/lib/supabase-server";

export default async function SpotPage({ params }: any) {

  const slug = params.slug?.trim();

  const { data: spot, error } = await supabaseServer
    .from("spots")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!spot) {
    return <div>Not found</div>;
  }

  return (
    <main style={{ padding: 40 }}>
      <img src={spot.image_url} style={{ width: "100%", height: 300 }} />
      <h1>{spot.title}</h1>
      <p>{spot.description}</p>
    </main>
  );
}