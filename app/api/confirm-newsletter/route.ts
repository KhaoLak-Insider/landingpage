import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token")?.trim();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 🔍 GET ALL ROWS FIRST (ABSOLUTE TRUTH SOURCE)
  const { data, error } = await supabase
    .from("waitlist")
    .select("id, newsletter_token");

  console.log("📦 ALL ROWS:", data);
  console.log("❌ ERROR:", error);

  // 🧠 MANUAL MATCH (NO SUPABASE FILTER)
  const match = data?.find(
    (row) => row.newsletter_token?.trim() === token
  );

  console.log("🎯 MATCH:", match);

  if (!match) {
    return NextResponse.json({
      error: "NO MATCH FOUND",
      token,
      dbTokens: data?.map(r => r.newsletter_token),
    });
  }

  // 🔥 UPDATE BY ID
  const { data: updated, error: updateError } = await supabase
    .from("waitlist")
    .update({
      newsletter_confirmed: true,
    })
    .eq("id", match.id)
    .select();

  console.log("✅ UPDATED:", updated);
  console.log("❌ UPDATE ERROR:", updateError);

  return NextResponse.json({
    success: true,
    updated,
  });
}