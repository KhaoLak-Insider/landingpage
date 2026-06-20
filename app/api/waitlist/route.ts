import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    console.log("🔥 WAITLIST API TRIGGERED");

    const body = await req.json();

    console.log("📦 BODY FULL:", body);

    const email = body?.email;
    const waitlist_opt_in = body?.waitlist_opt_in;
    const newsletter_opt_in = body?.newsletter_opt_in;

    console.log("📩 EMAIL RECEIVED:", email);
    console.log("🧠 FLAGS:", {
      waitlist_opt_in,
      newsletter_opt_in,
    });

    if (!email) {
      return NextResponse.json(
        { error: "No email provided" },
        { status: 400 }
      );
    }

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

    // 🧠 NEWSLETTER DOUBLE OPT-IN TOKEN
    const newsletter_token = newsletter_opt_in ? randomUUID() : null;

    // 🧠 SAVE TO SUPABASE
    const insertPayload = {
      email,
      waitlist_opt_in: Boolean(waitlist_opt_in),

      // Newsletter wird NICHT direkt aktiviert
      newsletter_opt_in: Boolean(newsletter_opt_in),
      newsletter_confirmed: false,
      newsletter_token,
    };

    console.log("📥 INSERT PAYLOAD:", insertPayload);

    const { data, error: dbError } = await supabase
      .from("waitlist")
      .insert([insertPayload]);

    if (dbError) {
      console.log("❌ SUPABASE ERROR FULL:", dbError);

      return NextResponse.json(
        {
          error: "Database error",
          details: dbError,
        },
        { status: 500 }
      );
    }

    console.log("✅ SUPABASE INSERT OK:", data);

    // 📧 WAITLIST EMAIL (immer)
    await resend.emails.send({
      from: "Khao Lak Insider <no-reply@khaolak.app>",
      to: email,
      subject: "🌴 Willkommen auf der Warteliste",
      html: `<div>Danke für deine Anmeldung!</div>`,
    });

    // 📧 NEWSLETTER DOUBLE OPT-IN EMAIL (nur wenn aktiviert)
    if (newsletter_opt_in && newsletter_token) {
      console.log("📤 SENDING DOUBLE OPT-IN EMAIL...");

      await resend.emails.send({
        from: "Khao Lak Insider <no-reply@khaolak.app>",
        to: email,
        subject: "📩 Bitte bestätige deinen Newsletter",

        html: `
          <div style="font-family:Arial;padding:30px">
            <h2>Bitte bestätige deinen Newsletter</h2>

            <p>Klicke auf den Button, um dich offiziell anzumelden:</p>

            <a href="https://khaolak.app/api/confirm-newsletter?token=${newsletter_token}"
               style="display:inline-block;padding:12px 20px;background:#14b8a6;color:white;border-radius:8px;text-decoration:none">
              Newsletter bestätigen
            </a>

            <p style="margin-top:20px;font-size:12px;color:#888">
              Wenn du das nicht warst, kannst du diese Mail ignorieren.
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Saved + emails sent",
    });

  } catch (error) {
    console.log("💥 FATAL ERROR:", error);

    return NextResponse.json(
      {
        error: "Server error",
        details: String(error),
      },
      { status: 500 }
    );
  }
}