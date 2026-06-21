import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    console.log("🔥 WAITLIST API TRIGGERED");

    const body = await req.json();

    const email = body?.email;
    const waitlist_opt_in = body?.waitlist_opt_in;
    const newsletter_opt_in = body?.newsletter_opt_in;

    if (!email) {
      return NextResponse.json(
        { error: "No email provided" },
        { status: 400 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY!);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 🧠 Token nur für Double Opt-in
    const newsletter_token = newsletter_opt_in ? randomUUID() : null;

    // 💾 Save user
    const { data, error: dbError } = await supabase
      .from("waitlist")
      .insert([
        {
          email,
          waitlist_opt_in: Boolean(waitlist_opt_in),
          newsletter_opt_in: Boolean(newsletter_opt_in),
          newsletter_confirmed: false,
          newsletter_token,
        },
      ]);

    if (dbError) {
      console.log("❌ SUPABASE ERROR:", dbError);

      return NextResponse.json(
        { error: "Database error", details: dbError },
        { status: 500 }
      );
    }

    console.log("✅ USER SAVED");

    // 📧 ONLY ONE EMAIL FLOW (DOUBLE OPT-IN)
    if (newsletter_opt_in && newsletter_token) {
      await resend.emails.send({
        from: "Khao Lak Insider <no-reply@khaolak.app>",
        to: email,
        subject: "📩 Bitte bestätige deinen Newsletter",

        html: `
          <div style="font-family:Arial;padding:30px">
            <h2>Bitte bestätige deinen Newsletter 🌴</h2>

            <p>Damit wir dir Insider-Tipps senden dürfen, bestätige bitte deine Anmeldung:</p>

            <a href="https://khaolak.app/api/confirm-newsletter?token=${newsletter_token}"
               style="display:inline-block;margin-top:15px;padding:12px 20px;background:#14b8a6;color:white;border-radius:8px;text-decoration:none">
              Newsletter bestätigen
            </a>

            <p style="margin-top:20px;font-size:12px;color:#888">
              Wenn du das nicht warst, kannst du diese Mail ignorieren.
            </p>
          </div>
        `,
      });

      console.log("📤 DOUBLE OPT-IN EMAIL SENT");
    }

    return NextResponse.json({
      success: true,
      message: "User saved + opt-in email sent if needed",
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