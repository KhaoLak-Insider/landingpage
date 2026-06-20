import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { render } from "@react-email/render";
import WelcomeEmail from "@/emails/WelcomeEmail";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // 🔑 TOKEN
    const rawToken = searchParams.get("token");
    const token = rawToken?.trim();

    if (!token) {
      return NextResponse.json(
        { error: "NO TOKEN PROVIDED" },
        { status: 400 }
      );
    }

    // 🔌 SUPABASE
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // ✉️ RESEND
    const resend = new Resend(process.env.RESEND_API_KEY!);

    // 🔍 FIND USER
    const { data, error } = await supabase
      .from("waitlist")
      .select("id, email, newsletter_token")
      .eq("newsletter_token", token);

    if (error) {
      return NextResponse.json(
        { error: "SUPABASE ERROR", details: error },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "INVALID TOKEN" },
        { status: 404 }
      );
    }

    const user = data[0];

    // 🔥 UPDATE USER
    const { error: updateError } = await supabase
      .from("waitlist")
      .update({
        newsletter_confirmed: true,
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "UPDATE FAILED", details: updateError },
        { status: 500 }
      );
    }

    // ✉️ RENDER REACT EMAIL (NEU)
    const html = render(<WelcomeEmail />);

    // ✉️ SEND EMAIL (NEU DESIGN)
    await resend.emails.send({
      from: "Khao Lak Insider <onboarding@khaolak.app>",
      to: user.email,
      subject: "Willkommen im Khao Lak Insider 🌴",
      html,
    });

    // 🎯 SUCCESS REDIRECT
    return NextResponse.redirect(
      "https://khaolak.app/confirm-newsletter?status=success"
    );

  } catch (err) {
    console.log("💥 SERVER ERROR:", err);

    return NextResponse.json(
      {
        error: "SERVER ERROR",
        details: String(err),
      },
      { status: 500 }
    );
  }
}