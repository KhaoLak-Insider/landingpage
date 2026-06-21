import { supabase } from "@/src/lib/supabase";

export default async function SpotPage({ params }: any) {

  // 🔍 DEBUG: zeigt exakt was Next.js liefert
  console.log("SLUG:", params.slug);
  console.log("RAW SLUG:", JSON.stringify(params.slug));

  // 🧠 DB QUERY (mit Trim gegen versteckte Leerzeichen)
  const { data, error } = await supabase
    .from("spots")
    .select("*")
    .eq("slug", params.slug.trim());

  return (
    <div style={{ padding: 40 }}>
      <div>SLUG: {params.slug}</div>
      <div>RESULT: {JSON.stringify(data)}</div>
      <div>ERROR: {JSON.stringify(error)}</div>
    </div>
  );
}