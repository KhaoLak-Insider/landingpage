import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    console.log("🔥 WAITLIST API TRIGGERED");

    const body = await req.json();

    // 🧠 DEBUG: FULL BODY CHECK
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

    // 🧠 1. SAVE TO SUPABASE (SAFE + TRACEABLE)
    const insertPayload = {
      email,
      waitlist_opt_in: Boolean(waitlist_opt_in),
      newsletter_opt_in: Boolean(newsletter_opt_in),
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

    // 📧 EMAIL
    const result = await resend.emails.send({
      from: "Khao Lak Insider <no-reply@khaolak.app>",
      to: email,
      subject: "🌴 Willkommen auf der Warteliste",
      html: `<div>OK</div>`,
    });

    console.log("📧 RESEND RESPONSE:", result);

    return NextResponse.json({
      success: true,
      message: "Email sent + saved",
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