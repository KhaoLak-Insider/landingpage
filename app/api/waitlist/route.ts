import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    console.log("API ROUTE HIT");

    const { email } = await req.json();
    console.log("EMAIL RECEIVED:", email);

    if (!email) {
      return NextResponse.json(
        { error: "No email provided" },
        { status: 400 }
      );
    }

    // ENV CHECK
    if (!process.env.RESEND_API_KEY) {
      console.log("❌ Missing RESEND_API_KEY");
      return NextResponse.json(
        { error: "Missing RESEND_API_KEY" },
        { status: 500 }
      );
    }

    console.log("RESEND KEY EXISTS:", true);

    const resend = new Resend(process.env.RESEND_API_KEY);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Supabase speichern
    const { error } = await supabase
      .from("waitlist")
      .insert([{ email }]);

    if (error && error.code !== "23505") {
      console.log("❌ SUPABASE ERROR:", error);
      return NextResponse.json(
        { error: "DB error" },
        { status: 500 }
      );
    }

    console.log("✅ Supabase insert OK");

    // 2. Mail senden
    const result = await resend.emails.send({
      from: "Khao Lak Insider <onboarding@resend.dev>",
      to: email,
      subject: "Du bist auf der Warteliste 🌴",
      html: `
        <div style="font-family: sans-serif;">
          <h1>Danke für deine Anmeldung 🌴</h1>
          <p>Du bist jetzt auf der Warteliste für die <b>Khao Lak Insider App</b>.</p>

          <p>Wir informieren dich, sobald wir starten.</p>

          <hr />

          <p style="color:#666;">
            Khao Lak Insider – dein smarter Reiseführer für Thailand
          </p>
        </div>
      `,
    });

    console.log("📧 RESEND RESULT:", result);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.log("❌ SERVER ERROR:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}