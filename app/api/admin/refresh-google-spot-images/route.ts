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
      const searchRes = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.id",
        },
        body: JSON.stringify({ textQuery: query }),
      });
      const searchData = await searchRes.json();
      const placeId = searchData?.places?.[0]?.id;
      if (!placeId) return null;
      const detailsRes = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "photos",
        },
      });
      const detailsData = await detailsRes.json();
      return detailsData?.photos?.[0]?.name || null;
    }

    for (const spot of spots || []) {
      let reference = String(spot.google_photo_reference || "").trim();
      const imageUrl = String(spot.image_url || "").trim();
      const imageSource = String((spot as { image_source?: string | null }).image_source || "").trim().toLowerCase();

      // A spot only "has a Google origin" if it ever carried a Google photo reference or a
      // raw Google photo URL. Genuine manual uploads (e.g. to R2/Supabase storage) have neither.
      const hadGoogleOrigin = Boolean(reference) || /googleapis\.com|googleusercontent\.com/i.test(imageUrl);
      if (imageSource === "manual" && !hadGoogleOrigin) {
        skipped += 1;
        continue;
      }

      // References from the old "Places API (Legacy)" don't work with the New API's photo
      // media endpoint anymore (different format/auth model) — treat them as missing so they
      // get re-fetched below instead of producing a permanently broken image URL.
      if (reference && !reference.startsWith("places/")) {
        reference = "";
      }

      if (!reference) {
        const title = String(spot.title || spot.title_en || "").trim();
        const category = String(spot.category || spot.category_en || "").trim();
        const query = [title, category, "Khao Lak"].filter(Boolean).join(" ");
        reference = (await searchGoogleReference(query)) || "";
        if (reference) {
          backfilled += 1;
        } else {
          skipped += 1;
          continue;
        }
      }

      const nextImageUrl = `/api/google-place-photo?photo_reference=${encodeURIComponent(reference)}&maxwidth=1200`;
      // Keep an existing "manual" tag so future refreshes leave this spot alone again;
      // everything else is labelled "google" since the image now comes straight from Places.
      const nextImageSource = imageSource === "manual" ? "manual" : "google";

      const { error: updateError } = await adminClient
        .from("spots")
        .update({ image_url: nextImageUrl, google_photo_reference: reference, image_source: nextImageSource })
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
