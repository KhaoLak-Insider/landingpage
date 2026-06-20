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
      .insert([
  {
    email,
    waitlist_opt_in: body?.waitlist_opt_in ?? false,
    newsletter_opt_in: body?.newsletter_opt_in ?? false,
  },
]);

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
  <div style="margin:0;padding:40px 20px;background:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">

    <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.08);">

      <div style="background:linear-gradient(135deg,#14b8a6,#0f766e);padding:40px 30px;text-align:center;color:white;">
        <div style="font-size:42px;line-height:1;">🌴</div>

        <h1 style="margin:15px 0 8px;font-size:28px;font-weight:700;">
          Willkommen bei Khao Lak Insider
        </h1>

        <p style="margin:0;font-size:15px;opacity:0.9;">
          Dein Platz auf der Warteliste ist reserviert.
        </p>
      </div>

      <div style="padding:35px 30px;color:#1f2937;">

        <h2 style="margin-top:0;font-size:24px;">
          Danke für deine Anmeldung 🙌
        </h2>

        <p style="font-size:16px;line-height:1.7;color:#4b5563;">
          Du bist jetzt offiziell auf der Warteliste für die
          <strong>Khao Lak Insider App</strong>.
        </p>

        <p style="font-size:16px;line-height:1.7;color:#4b5563;">
          Wir informieren dich als Ersten, sobald die App verfügbar ist.
        </p>

        <div style="background:#f0fdfa;border:1px solid #ccfbf1;border-radius:14px;padding:18px;margin:25px 0;">
          <div style="font-size:15px;line-height:1.8;color:#115e59;">
            ✅ Early Access zum App-Start<br>
            ✅ Exklusive Updates zur Entwicklung<br>
            ✅ Kein Spam – nur relevante Informationen
          </div>
        </div>

        <div style="text-align:center;margin:35px 0;">
          <a
            href="https://khaolak.app"
            style="
              background:#14b8a6;
              color:#ffffff;
              text-decoration:none;
              padding:14px 28px;
              border-radius:12px;
              display:inline-block;
              font-weight:600;
              font-size:15px;
            "
          >
            🌴 Zur Website
          </a>
        </div>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;">

        <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
          Khao Lak Insider – dein smarter Reiseführer für Thailand
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