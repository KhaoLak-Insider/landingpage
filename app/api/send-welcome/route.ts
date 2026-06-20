import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import WelcomeEmail from "@/emails/WelcomeEmail";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "NO EMAIL PROVIDED" },
        { status: 400 }
      );
    }

    // 🔌 Supabase (optional logging / future tracking)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // ✉️ Resend
    const resend = new Resend(process.env.RESEND_API_KEY!);

    // 🚀 SEND WELCOME EMAIL
    const { data, error } = await resend.emails.send({
      from: "Khao Lak Insider <onboarding@khaolak.app>",
      to: email,
      subject: "Willkommen im Khao Lak Insider 🌴",
      react: WelcomeEmail(),
    });

    if (error) {
      console.log("RESEND ERROR:", error);

      return NextResponse.json(
        { error: "EMAIL FAILED", details: error },
        { status: 500 }
      );
    }

    // (optional) track send in DB later
    // await supabase.from("waitlist").update({ welcome_sent: true }).eq(...)

    return NextResponse.json({
      success: true,
      message: "Welcome email sent",
      id: data?.id,
    });

  } catch (err) {
    console.log("SERVER ERROR:", err);

    return NextResponse.json(
      { error: "SERVER ERROR", details: String(err) },
      { status: 500 }
    );
  }
}