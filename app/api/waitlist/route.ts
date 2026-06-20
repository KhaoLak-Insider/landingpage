import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "No email" }, { status: 400 });
  }

  // 1. In Supabase speichern
  const { error } = await supabase
    .from("waitlist")
    .insert([{ email }]);

  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  // 2. Mail senden
  await resend.emails.send({
    from: "Khao Lak Insider <onboarding@resend.dev>",
    to: email,
    subject: "Du bist auf der Warteliste 🌴",
    html: `
      <div style="font-family: sans-serif;">
        <h1>Danke für deine Anmeldung 🌴</h1>
        <p>Du bist jetzt auf der Warteliste für die <b>Khao Lak Insider App</b>.</p>

        <p>
          Wir informieren dich, sobald wir starten.
        </p>

        <hr />

        <p style="color: #666;">
          Khao Lak Insider – dein smarter Reiseführer für Thailand
        </p>
      </div>
    `,
  });

  return NextResponse.json({ success: true });
}