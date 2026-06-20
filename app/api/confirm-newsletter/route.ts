import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Missing token" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("waitlist")
      .update({
        newsletter_confirmed: true,
      })
      .eq("newsletter_token", token)
      .select();

    if (error) {
      console.log("❌ CONFIRM ERROR:", error);

      return NextResponse.json(
        { error: "Update failed", details: error },
        { status: 500 }
      );
    }

    return NextResponse.redirect("https://khaolak.app?newsletter=confirmed");

  } catch (err) {
    console.log("💥 FATAL ERROR:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}