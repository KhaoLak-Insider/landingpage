import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const ALLOWED_FIELDS = new Set([
  "slug", "status", "sort_order", "name_de", "name_en",
  "short_description_de", "short_description_en", "description_de", "description_en",
  "size_sqm", "max_adults", "max_children", "max_occupancy",
  "bed_type_de", "bed_type_en", "view_de", "view_en", "bathroom_de", "bathroom_en",
  "cover_image_url", "images", "highlights_de", "highlights_en", "amenities_de", "amenities_en",
]);

export async function PATCH(request: NextRequest, context: { params: Promise<{ roomId: string }> }) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
    if (!url || !anonKey || !serviceKey || !token) {
      return NextResponse.json({ error: "Server oder Anmeldung ist nicht vollständig konfiguriert." }, { status: 500 });
    }

    const authClient = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user } } = await authClient.auth.getUser(token);
    if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    const { data: profile } = await authClient.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (!["admin", "editor"].includes(String(profile?.role || "").toLowerCase())) {
      return NextResponse.json({ error: "Keine Bearbeitungsberechtigung." }, { status: 403 });
    }

    const { roomId } = await context.params;
    const rawBody = (await request.json()) as Record<string, unknown>;
    const updates = Object.fromEntries(Object.entries(rawBody).filter(([key]) => ALLOWED_FIELDS.has(key)));
    updates.updated_at = new Date().toISOString();

    const adminClient = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data, error } = await adminClient.from("premium_rooms").update(updates).eq("id", roomId).select("id").maybeSingle();
    if (error) return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 400 });
    if (!data) return NextResponse.json({ error: "Zimmer wurde nicht gefunden." }, { status: 404 });
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("Premium-Zimmer konnte nicht gespeichert werden:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Speichern fehlgeschlagen." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ roomId: string }> }) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
    if (!url || !anonKey || !serviceKey || !token) {
      return NextResponse.json({ error: "Server oder Anmeldung ist nicht vollständig konfiguriert." }, { status: 500 });
    }

    const authClient = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user } } = await authClient.auth.getUser(token);
    if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    const { data: profile } = await authClient.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (!["admin", "editor"].includes(String(profile?.role || "").toLowerCase())) {
      return NextResponse.json({ error: "Keine Löschberechtigung." }, { status: 403 });
    }

    const { roomId } = await context.params;
    const adminClient = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data, error } = await adminClient.from("premium_rooms").delete().eq("id", roomId).select("id").maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!data) return NextResponse.json({ error: "Zimmer wurde nicht gefunden." }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Premium-Zimmer konnte nicht gelöscht werden:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Löschen fehlgeschlagen." }, { status: 500 });
  }
}
