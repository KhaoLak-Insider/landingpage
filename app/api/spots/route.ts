// app/api/spots/route.ts
import { supabase } from "@/src/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Wir holen nur die Felder, die wir für Marker, Filter & Card-Vorschau brauchen
    const { data: spots, error } = await supabase
      .from("spots")
      .select("id, title, slug, category, description, image_url, latitude, longitude, price_level, stars")
      .eq("is_published", true);

    if (error) throw error;

    return NextResponse.json({ success: true, result: spots || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}