import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Keine ID" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ newsletter: false })
    .eq("id", id);

  if (error) {
    console.error("SUPABASE ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <title>Abgemeldet</title>
    </head>
    <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
      <h1>Schade, dass du gehst!</h1>
      <p>Du wurdest erfolgreich ausgetragen und erhältst ab sofort keine E-Mails mehr von uns.</p>
      <a href="https://khaolak.app">Zurück zur Startseite</a>
    </body>
    </html>
  `;

  return new NextResponse(htmlContent, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}