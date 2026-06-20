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
      from: "Khao Lak Insider <onboarding@resend.dev>",
      to: email,
      subject: "Du bist auf der Warteliste 🌴",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h1>Danke für deine Anmeldung 🌴</h1>
          <p>Du bist jetzt auf der Warteliste für die <b>Khao Lak Insider App</b>.</p>
          <p>Wir melden uns, sobald es losgeht.</p>
          <hr />
          <p style="color: #666;">
            Khao Lak Insider – dein smarter Reiseführer für Thailand
          </p>
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