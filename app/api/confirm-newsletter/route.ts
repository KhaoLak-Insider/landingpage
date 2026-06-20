import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // 🧠 TOKEN CLEANING
    const rawToken = searchParams.get("token");
    const token = rawToken?.trim();

    console.log("🔥 RAW TOKEN:", rawToken);
    console.log("🔥 CLEAN TOKEN:", token);

    if (!token) {
      return NextResponse.json(
        { error: "NO TOKEN PROVIDED" },
        { status: 400 }
      );
    }

    // 🔌 SUPABASE CLIENT
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 🔍 FIND ROW VIA TOKEN
    const { data, error } = await supabase
      .from("waitlist")
      .select("id, newsletter_token")
      .eq("newsletter_token", token);

    console.log("📦 MATCH RESULT:", data);
    console.log("❌ FIND ERROR:", error);

    if (error) {
      return NextResponse.json({
        error: "SUPABASE SELECT ERROR",
        details: error,
      });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        error: "NO MATCH FOUND",
        token,
      });
    }

    const row = data[0];

    // 🔥 UPDATE ROW
    const { error: updateError } = await supabase
      .from("waitlist")
      .update({
        newsletter_confirmed: true,
      })
      .eq("id", row.id);

    console.log("❌ UPDATE ERROR:", updateError);

    if (updateError) {
      return NextResponse.json({
        error: "UPDATE FAILED",
        details: updateError,
      });
    }

    // 🎉 SUCCESS → REDIRECT TO NICE PAGE
    return NextResponse.redirect(
      "https://khaolak.app/confirm-newsletter?status=success"
    );

  } catch (err) {
    console.log("💥 FATAL ERROR:", err);

    return NextResponse.json(
      {
        error: "SERVER ERROR",
        details: String(err),
      },
      { status: 500 }
    );
  }
}