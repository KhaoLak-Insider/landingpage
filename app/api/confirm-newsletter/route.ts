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

  // 1. RAW CHECK
  const { data: rows, error: selectError } = await supabase
    .from("waitlist")
    .select("*");

  console.log("📦 ALL ROWS:", rows);
  console.log("❌ SELECT ERROR:", selectError);

  // 2. EXACT MATCH TEST
  const match = rows?.find(r => r.newsletter_token === token);

  console.log("🎯 MATCH FOUND:", match);

  if (!match) {
    return NextResponse.json({
      error: "No match found",
      token,
      all_tokens: rows?.map(r => r.newsletter_token),
    });
  }

  // 3. UPDATE BY ID (IMPORTANT FIX)
  const { data, error: updateError } = await supabase
    .from("waitlist")
    .update({
      newsletter_confirmed: true,
    })
    .eq("id", match.id)
    .select();

  console.log("🔄 UPDATE RESULT:", data);
  console.log("❌ UPDATE ERROR:", updateError);

  return NextResponse.json({
    success: true,
    updated: data,
    updateError,
  });
}