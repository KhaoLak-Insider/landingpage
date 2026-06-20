import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    console.log("🔥 WAITLIST API TRIGGERED");

    const body = await req.json();

    const email = body?.email;
    const waitlist_opt_in = body?.waitlist_opt_in;
    const newsletter_opt_in = body?.newsletter_opt_in;

    console.log("📩 EMAIL RECEIVED:", email);
    console.log("🧠 CONSENTS:", {
      waitlist_opt_in,
      newsletter_opt_in,
    });

    if (!email) {
      return NextResponse.json(
        { error: "No email provided" },
        { status: 400 }
      );
    }

    // 🔐 ENV CHECK
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Missing RESEND_API_KEY" },
        { status: 500 }
      );
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return NextResponse.json(
        { error: "Missing Supabase env" },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // 🧠 1. SAVE TO SUPABASE (FIX HERE 🔥)
    const { error: dbError } = await supabase.from("waitlist").insert([
      {
        email,
        waitlist_opt_in: Boolean(waitlist_opt_in),
        newsletter_opt_in: Boolean(newsletter_opt_in),
      },
    ]);

    if (dbError) {
  console.log("❌ SUPABASE FULL ERROR:", dbError);

  return NextResponse.json(
    {
      error: "Database error",
      details: dbError,
    },
    { status: 500 }
  );
}

    console.log("✅ SUPABASE INSERT OK");

    // 📧 2. EMAIL
    const result = await resend.emails.send({
      from: "Khao Lak Insider <no-reply@khaolak.app>",
      to: email,
      subject: "🌴 Willkommen auf der Warteliste",
      html: `
        <div style="margin:0;padding:40px 20px;background:#f4f7fb;font-family:Arial,sans-serif;">
          <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;">

            <div style="background:#14b8a6;padding:40px;text-align:center;color:white;">
              <div style="font-size:42px;">🌴</div>
              <h1 style="margin:10px 0;">Willkommen bei Khao Lak Insider</h1>
              <p>Dein Platz ist reserviert.</p>
            </div>

            <div style="padding:30px;">
              <h2>Danke für deine Anmeldung 🙌</h2>

              <p>Du bist jetzt auf der Warteliste.</p>

              <div style="margin:20px 0;padding:15px;background:#f0fdfa;border-radius:10px;">
                <p>✅ Early Access<br>✅ Updates<br>✅ Kein Spam</p>
              </div>

              <a href="https://khaolak.app"
                style="display:inline-block;padding:12px 20px;background:#14b8a6;color:white;text-decoration:none;border-radius:10px;">
                Zur Website
              </a>
            </div>

          </div>
        </div>
      `,
    });

    console.log("📧 RESEND RESPONSE:", result);

    return NextResponse.json({
      success: true,
      message: "Saved + email sent",
    });

  } catch (error) {
    console.log("💥 FATAL ERROR:", error);

    return NextResponse.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}