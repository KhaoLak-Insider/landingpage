import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function SpotPage({ params }: any) {
  const slug = params.slug?.trim();

  const { data: spot, error } = await supabase
    .from("spots")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

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