// app/api/spots/route.ts
import { supabase } from "@/src/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Deine originale Abfrage bleibt exakt so, wie sie war
    const { data: spots, error: spotsError } = await supabase
      .from("spots")
      .select("id, title, slug, category, description, image_url, latitude, longitude, price_level, stars")
      .eq("is_published", true);

    if (spotsError) throw spotsError;

    // 2. Wir holen einfach parallel die Farben und Icons aus der categories-Tabelle
    const { data: categories, error: catsError } = await supabase
      .from("categories")
      .select("name, icon, color");

    // Falls es bei den Kategorien einen Fehler gibt, loggen wir ihn nur, 
    // damit die Spots trotzdem geladen werden!
    if (catsError) {
      console.error("Kategorien konnten nicht geladen werden:", catsError.message);
    }

    // 3. Wir mappen die Farben/Icons ganz simpel über den Textnamen (category) an die Spots
    const enrichedSpots = (spots || []).map((spot) => {
      // Findet die passende Kategorie anhand des Namens (z.B. "Strand")
      const matchingCategory = (categories || []).find(
        (cat) => cat.name?.toLowerCase() === spot.category?.toLowerCase()
      );

      return {
        ...spot,
        // Wir packen das Objekt genau so hinein, wie die Planen-Page es erwartet
        categories: matchingCategory ? {
          name: matchingCategory.name,
          icon: matchingCategory.icon,
          color: matchingCategory.color
        } : null
      };
    });

    // Wir geben die angereicherten Spots zurück
    return NextResponse.json({ success: true, result: enrichedSpots });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}