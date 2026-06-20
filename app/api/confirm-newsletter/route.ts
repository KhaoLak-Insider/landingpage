import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  console.log("🔥 TOKEN:", token);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. FIND ROW FIRST (ABSOLUT SAFE)
  const { data: rows, error } = await supabase
    .from("waitlist")
    .select("id, newsletter_token")
    .eq("newsletter_token", token);

  console.log("📦 ROWS:", rows);

  if (!rows || rows.length === 0) {
    return NextResponse.json({
      error: "No match found",
      token
    });
  }

  const id = rows[0].id;

  // 2. UPDATE BY ID (NO STRING MATCH PROBLEMS)
  const { data, error: updateError } = await supabase
    .from("waitlist")
    .update({
      newsletter_confirmed: true,
    })
    .eq("id", id)
    .select();

  console.log("✅ UPDATED:", data);
  console.log("❌ UPDATE ERROR:", updateError);

  return NextResponse.json({
    success: true,
    updated: data
  });
}