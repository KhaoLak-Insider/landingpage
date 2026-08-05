import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function isAdminRequest(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();

  if (!url || !anonKey || !serviceKey || !token) {
    return { ok: false as const, response: NextResponse.json({ error: "Server oder Anmeldung ist nicht vollständig konfiguriert." }, { status: 500 }) };
  }

  const authClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user } } = await authClient.auth.getUser(token);
  if (!user) {
    return { ok: false as const, response: NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 }) };
  }

  const { data: profile } = await authClient.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!["admin", "editor"].includes(String(profile?.role || "").toLowerCase())) {
    return { ok: false as const, response: NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 }) };
  }

  return {
    ok: true as const,
    url,
    serviceKey,
  };
}

export async function POST(request: NextRequest) {
  try {
    const auth = await isAdminRequest(request);
    if (!auth.ok) return auth.response;

    const adminClient = createClient(auth.url, auth.serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: spots, error: spotsError } = await adminClient
      .from("spots")
      .select("id, title, title_en, category, category_en, image_url, google_photo_reference, image_source");

    if (spotsError) {
      return NextResponse.json({ error: spotsError.message }, { status: 400 });
    }

    let updated = 0;
    let skipped = 0;
    let backfilled = 0;

    async function searchGoogleReference(query: string) {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || "";
      if (!apiKey || !query.trim()) return null;
      const searchRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${apiKey}`,
      );
      const searchData = await searchRes.json();
      const placeId = searchData?.candidates?.[0]?.place_id;
      if (!placeId) return null;
      const detailsRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&key=${apiKey}`,
      );
      const detailsData = await detailsRes.json();
      return detailsData?.result?.photos?.[0]?.photo_reference || null;
    }

    for (const spot of spots || []) {
      let reference = String(spot.google_photo_reference || "").trim();
      const imageUrl = String(spot.image_url || "").trim();
      const imageSource = String((spot as { image_source?: string | null }).image_source || "").trim().toLowerCase();
      if (imageSource === "manual") {
        skipped += 1;
        continue;
      }
      const hasGoogleImage = /googleapis\.com|googleusercontent\.com|maps\.googleapis\.com/i.test(imageUrl);

      if (!reference && !hasGoogleImage) {
        const title = String(spot.title || spot.title_en || "").trim();
        const category = String(spot.category || spot.category_en || "").trim();
        const query = [title, category, "Khao Lak"].filter(Boolean).join(" ");
        reference = (await searchGoogleReference(query)) || "";
        if (reference) {
          backfilled += 1;
          const { error: refError } = await adminClient
            .from("spots")
            .update({ google_photo_reference: reference, image_source: "google" })
            .eq("id", spot.id);
          if (refError) {
            console.warn("Backfill reference failed:", spot.id, refError.message);
            skipped += 1;
            continue;
          }
        } else {
          skipped += 1;
          continue;
        }
      }

      const nextImageUrl = `/api/google-place-photo?photo_reference=${encodeURIComponent(reference)}&maxwidth=1200`;
      if (!nextImageUrl) {
        skipped += 1;
        continue;
      }

      const { error: updateError } = await adminClient
        .from("spots")
        .update({ image_url: nextImageUrl, google_photo_reference: reference, image_source: "google" })
        .eq("id", spot.id);

      if (updateError) {
        console.warn("Spot image refresh failed:", spot.id, updateError.message);
        skipped += 1;
        continue;
      }

      updated += 1;
    }

    return NextResponse.json({ updated, skipped, backfilled });
  } catch (error) {
    console.error("Google spot image refresh failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Aktualisierung fehlgeschlagen." },
      { status: 500 },
    );
  }
}
