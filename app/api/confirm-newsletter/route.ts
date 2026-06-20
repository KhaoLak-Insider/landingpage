import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token")?.trim();

    console.log("🔥 TOKEN RAW:", token);
    console.log("🔥 TOKEN LENGTH:", token?.length);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 🔍 STEP 1: FIND ROW
    const { data: rows, error: findError } = await supabase
      .from("waitlist")
      .select("id, newsletter_token")
      .eq("newsletter_token", token);

    console.log("📦 ROWS:", rows);
    console.log("❌ FIND ERROR:", findError);

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        error: "NO MATCH FOUND",
        token,
      });
    }

    const id = rows[0].id;

    // 🔥 STEP 2: UPDATE BY ID
    const { data: updateData, error: updateError } = await supabase
      .from("waitlist")
      .update({
        newsletter_confirmed: true,
      })
      .eq("id", id)
      .select();

    console.log("✅ UPDATED:", updateData);
    console.log("❌ UPDATE ERROR:", updateError);

    return NextResponse.json({
      success: true,
      updated: updateData,
    });

  } catch (err) {
    console.log("💥 FATAL ERROR:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}