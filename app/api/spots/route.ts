// app/api/spots/route.ts
import { supabase } from "@/src/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Deine originale Abfrage bleibt exakt so, wie sie war
    const { data: spots, error: spotsError } = await supabase
      .from("spots")
      .select("id, title, title_en, slug, category, category_en, category_id, description, description_en, image_url, latitude, longitude, price_level, stars")
      .eq("is_published", true);

    if (spotsError) throw spotsError;

    // 2. Wir holen einfach parallel die Farben und Icons aus der categories-Tabelle
    const { data: categories, error: catsError } = await supabase
      .from("categories")
      .select("id, name, name_en, slug, icon, color, parent_id, sort_order")
      .eq("is_active", true)
      .order("sort_order")
      .order("name");

    // Falls es bei den Kategorien einen Fehler gibt, loggen wir ihn nur, 
    // damit die Spots trotzdem geladen werden!
    if (catsError) {
      console.error("Kategorien konnten nicht geladen werden:", catsError.message);
    }

    // 3. Wir mappen die Farben/Icons ganz simpel über den Textnamen (category) an die Spots
    const enrichedSpots = (spots || []).map((spot) => {
      // Findet die passende Kategorie anhand des Namens (z.B. "Strand")
      const matchingCategory = (categories || []).find(
        (cat) =>
          cat.id === spot.category_id ||
          cat.name?.toLowerCase() === spot.category?.toLowerCase()
      );

      return {
        ...spot,
        // Wir packen das Objekt genau so hinein, wie die Planen-Page es erwartet
        categories: matchingCategory ? {
          name: matchingCategory.name,
          name_en: matchingCategory.name_en,
          slug: matchingCategory.slug,
          icon: matchingCategory.icon,
          color: matchingCategory.color,
          parent_id: matchingCategory.parent_id,
          sort_order: matchingCategory.sort_order,
        } : null
      };
    });

    // Wir geben die angereicherten Spots zurück
    return NextResponse.json({
      success: true,
      result: enrichedSpots,
      categories: categories || [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
