import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    console.log("🔥 WAITLIST API TRIGGERED");

    const body = await req.json();
    const email = body?.email;

    console.log("📩 EMAIL RECEIVED:", email);

    if (!email) {
      return NextResponse.json(
        { error: "No email provided" },
        { status: 400 }
      );
    }

    // 🔐 CHECK ENV
    if (!process.env.RESEND_API_KEY) {
      console.log("❌ Missing RESEND_API_KEY");
      return NextResponse.json(
        { error: "Missing RESEND_API_KEY" },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log("❌ Missing Supabase env vars");
      return NextResponse.json(
        { error: "Missing Supabase env" },
        { status: 500 }
      );
    }

    console.log("✅ ENV OK");

    // INIT CLIENTS
    const resend = new Resend(process.env.RESEND_API_KEY);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // 🧠 1. SAVE TO SUPABASE
    const { error: dbError } = await supabase
      .from("waitlist")
      .insert([{ email }]);

    if (dbError) {
      console.log("❌ SUPABASE ERROR:", dbError);

      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    console.log("✅ SUPABASE INSERT OK");

    // 📧 2. SEND EMAIL
    console.log("📤 SENDING EMAIL VIA RESEND...");

    const result = await resend.emails.send({
  from: "Khao Lak Insider <no-reply@khaolak.app>",
  to: email,
  subject: "🌴 Willkommen auf der Warteliste",

  html: `
    <div style="background:#f6f7fb;padding:40px 0;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#00b3a6,#0ea5a4);padding:30px;text-align:center;color:white;">
          <h1 style="margin:0;font-size:24px;">🌴 Khao Lak Insider</h1>
          <p style="margin:8px 0 0;opacity:0.9;">Warteliste bestätigt</p>
        </div>

        <!-- Body -->
        <div style="padding:30px;color:#1f2937;">

          <h2 style="margin-top:0;">Danke für deine Anmeldung 🙌</h2>

          <p style="font-size:15px;line-height:1.6;">
            Du bist jetzt auf der Warteliste für die <b>Khao Lak Insider App</b>.
          </p>

          <div style="background:#f3f4f6;padding:15px;border-radius:10px;margin:20px 0;">
            <p style="margin:0;font-size:14px;">
              👉 Du bekommst als Erstes Zugang, sobald wir starten.<br/>
              👉 Exklusive Updates und Early Access Infos folgen bald.
            </p>
          </div>

          <a href="https://khaolak.app"
             style="display:inline-block;background:#0ea5a4;color:white;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:bold;">
            Zur Website
          </a>

          <p style="margin-top:25px;font-size:12px;color:#6b7280;">
            Khao Lak Insider – dein smarter Reiseführer für Thailand 🌴
          </p>

        </div>
      </div>
    </div>
  `,
});

    console.log("📧 RESEND RESPONSE:", result);

    return NextResponse.json({
      success: true,
      message: "Email sent + saved",
    });

  } catch (error) {
    console.log("💥 FATAL ERROR:", error);

    return NextResponse.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}