import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  // Initialisiere den Client lokal in der Funktion
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Nutze hier den Service Role Key für Admin-Rechte
  );

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Keine ID" }, { status: 400 });

  const { data, error } = await supabase
    .from("profiles")
    .update({ newsletter: false })
    .eq("id", id);

  if (error) {
    console.error("SUPABASE ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse("<h1>Abgemeldet</h1><p>Du wurdest erfolgreich ausgetragen.</p>", { 
    status: 200, 
    headers: { "Content-Type": "text/html" } 
  });
}