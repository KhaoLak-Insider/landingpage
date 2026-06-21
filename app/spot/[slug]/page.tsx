import { supabase } from "@/src/lib/supabase";

export default async function SpotPage({ params }: any) {
  console.log("SLUG:", params.slug);

  const { data, error } = await supabase
    .from("spots")
    .select("*")
    .eq("slug", params.slug);

  return (
    <div style={{ padding: 40 }}>
      <div>SLUG: {params.slug}</div>
      <div>RESULT: {JSON.stringify(data)}</div>
      <div>ERROR: {JSON.stringify(error)}</div>
    </div>
  );
}