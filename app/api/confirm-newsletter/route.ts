import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // 🔑 TOKEN
    const rawToken = searchParams.get("token");
    const token = rawToken?.trim();

    console.log("🔥 TOKEN:", token);

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

    console.log("📦 DATA:", data);
    console.log("❌ ERROR:", error);

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

    // ✉️ WELCOME EMAIL (deine schöne Version)
    await resend.emails.send({
      from: "Khao Lak Insider <onboarding@khaolak.app>",
      to: user.email,
      subject: "Willkommen im Khao Lak Insider 🌴",
      html: `
<div style="font-family: Arial, sans-serif; background:#f6f7fb; padding:40px 0;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:32px; border-radius:12px;">

    <p style="font-size:14px; color:#666;">
      Khao Lak Insider
    </p>

    <h1 style="font-size:22px; margin-top:10px;">
      Willkommen 👋
    </h1>

    <p style="font-size:16px; line-height:1.6; color:#333;">
      Schön, dass du dabei bist.
    </p>

    <p style="font-size:16px; line-height:1.6; color:#333;">
      Du bekommst ab jetzt hin und wieder kurze Updates aus Khao Lak —
      neue Orte, kleine Tipps und Dinge, die man nicht sofort im Reiseführer findet.
    </p>

    <p style="font-size:16px; line-height:1.6; color:#333;">
      Kein Spam. Keine täglichen Mails. Nur wenn es wirklich etwas Neues gibt.
    </p>

    <hr style="margin:24px 0; border:none; border-top:1px solid #eee;" />

    <h2 style="font-size:18px;">
      🏝️ Kleine Empfehlung zum Start
    </h2>

    <p style="font-size:15px; line-height:1.6; color:#333;">
      Wenn du bald in Khao Lak bist, schau dir unbedingt die kleineren Strände nördlich von Bang Niang an.
      Dort ist es oft deutlich ruhiger als im Zentrum.
    </p>

    <p style="font-size:15px; color:#666;">
      Mehr davon kommt bald.
    </p>

    <hr style="margin:24px 0; border:none; border-top:1px solid #eee;" />

    <p style="font-size:12px; color:#999;">
      Du erhältst diese Mail, weil du dich auf khaolak.app für den Newsletter angemeldet hast.
    </p>

  </div>
</div>
      `,
    });

    // 🎯 REDIRECT TO SUCCESS PAGE
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