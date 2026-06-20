import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // 🧠 CLEAN TOKEN (wichtig!)
    const rawToken = searchParams.get("token");
    const token = rawToken?.trim().replace(/\s/g, "");

    console.log("🔥 RAW TOKEN:", rawToken);
    console.log("🔥 CLEAN TOKEN:", token);
    console.log("🔥 TOKEN LENGTH:", token?.length);

    // 🔌 Supabase Client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 🔍 STEP 1: FIND ROW
    const { data: rows, error: findError } = await supabase
      .from("waitlist")
      .select("id, newsletter_token")
      .eq("newsletter_token", token);

    console.log("📦 MATCH RESULT:", rows);
    console.log("❌ FIND ERROR:", findError);

    if (findError) {
      return NextResponse.json({
        error: "Supabase find error",
        details: findError,
      });
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        error: "NO MATCH FOUND",
        token,
      });
    }

    const id = rows[0].id;

    // 🔥 STEP 2: UPDATE
    const { data: updateData, error: updateError } = await supabase
      .from("waitlist")
      .update({
        newsletter_confirmed: true,
      })
      .eq("id", id)
      .select();

    console.log("✅ UPDATE RESULT:", updateData);
    console.log("❌ UPDATE ERROR:", updateError);

    if (updateError) {
      return NextResponse.json({
        error: "Update failed",
        details: updateError,
      });
    }

    return NextResponse.json({
      success: true,
      updated: updateData,
    });

  } catch (err) {
    console.log("💥 FATAL ERROR:", err);

    return NextResponse.json(
      {
        error: "Server error",
        details: String(err),
      },
      { status: 500 }
    );
  }
}