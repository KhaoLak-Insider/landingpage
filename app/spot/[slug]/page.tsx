import { supabase } from "@/src/lib/supabase";
import { createClient } from "@supabase/supabase-js";

// ... dein Client-Setup

// params ist jetzt ein Promise, das wir auflösen müssen
export default async function SpotPage({ params }: { params: Promise<{ slug: string }> }) {
  // Wichtig: params auflösen!
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug.trim()); // Sicherer bei Sonderzeichen

  const { data: spot, error } = await supabase
    .from("spots")
    .select("*")
    .eq("slug", decodedSlug)
    .maybeSingle();

  if (error || !spot) {
    console.error("Fehler oder nicht gefunden:", error);
    return <div>Not found</div>;
  }

  return (
    <main style={{ padding: 40 }}>
      <img src={spot.image_url} style={{ width: "100%", height: 300, objectFit: "cover" }} />
      <h1>{spot.title}</h1>
      <p>{spot.description}</p>
    </main>
  );
}