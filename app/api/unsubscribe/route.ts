import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase"; // Achte auf den richtigen Import

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Keine E-Mail angegeben" }, { status: 400 });
  }

  // Setze Newsletter in der Datenbank auf false
  const { error } = await supabase
    .from("profiles")
    .update({ newsletter: false })
    .eq("email", email);

  if (error) {
    return NextResponse.json({ error: "Fehler beim Abmelden" }, { status: 500 });
  }

  // Schöne Rückmeldung für den Nutzer
  return new NextResponse(
    "<h1>Abgemeldet</h1><p>Du hast dich erfolgreich vom Newsletter abgemeldet. Wir werden dich nicht mehr kontaktieren.</p>",
    { status: 200, headers: { "Content-Type": "text/html" } }
  );
}