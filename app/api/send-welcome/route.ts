import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // 🔑 EMAIL AUS URL
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "NO EMAIL PROVIDED" },
        { status: 400 }
      );
    }

    // 🔌 SUPABASE CLIENT
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // ✉️ RESEND CLIENT
    const resend = new Resend(process.env.RESEND_API_KEY!);

    // 📩 HTML EMAIL LADEN (WICHTIG!)
    const html = fs.readFileSync(
      path.join(process.cwd(), "emails/WelcomeEmail.html"),
      "utf8"
    );

    // 🚀 EMAIL SENDEN
    const { data, error } = await resend.emails.send({
      from: "Khao Lak Insider <onboarding@khaolak.app>",
      to: email,
      subject: "🌴 Willkommen im Khao Lak Insider",
      html,
    });

    if (error) {
      console.log("RESEND ERROR:", error);

      return NextResponse.json(
        { error: "EMAIL FAILED", details: error },
        { status: 500 }
      );
    }

    // 🧠 OPTIONAL: später Tracking in Supabase
    // await supabase.from("waitlist").update({ welcome_sent: true }).eq("email", email);

    return NextResponse.json({
      success: true,
      message: "HTML Welcome Email sent",
      id: data?.id,
    });

  } catch (err) {
    console.log("SERVER ERROR:", err);

    return NextResponse.json(
      {
        error: "SERVER ERROR",
        details: String(err),
      },
      { status: 500 }
    );
  }
}