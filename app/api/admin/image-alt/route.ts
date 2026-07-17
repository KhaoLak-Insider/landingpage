import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

async function verifyEditor(request: NextRequest): Promise<boolean> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !key) return false;
  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user } } = await client.auth.getUser(token);
  if (!user) return false;
  const { data } = await client.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return ["admin", "editor"].includes(String(data?.role || "").toLowerCase());
}

function parseJson(text: string): { de?: unknown; en?: unknown; title_de?: unknown; title_en?: unknown } | null {
  try {
    return JSON.parse(text.replace(/^```json\s*|\s*```$/g, ""));
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await verifyEditor(request))) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY ist nicht konfiguriert." }, { status: 500 });
    }
    const body = (await request.json()) as { imageUrl?: unknown; context?: unknown };
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
    if (!/^https?:\/\//i.test(imageUrl)) {
      return NextResponse.json({ error: "Eine gültige öffentliche Bild-URL wird benötigt." }, { status: 400 });
    }
    const context = typeof body.context === "string" ? body.context.trim().slice(0, 500) : "";
    const imageResponse = await fetch(imageUrl, { cache: "no-store", signal: AbortSignal.timeout(15_000) });
    const mimeType = imageResponse.headers.get("content-type")?.split(";")[0].trim() || "";
    if (!imageResponse.ok || !mimeType.startsWith("image/")) {
      return NextResponse.json({ error: "Das Bild konnte nicht öffentlich geladen werden." }, { status: 400 });
    }
    const imageBytes = await imageResponse.arrayBuffer();
    if (imageBytes.byteLength > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "Das Bild ist für die KI-Analyse zu groß." }, { status: 413 });
    }
    const model = process.env.GEMINI_VISION_MODEL?.trim() || "gemini-2.5-flash";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [
          { inlineData: { mimeType, data: Buffer.from(imageBytes).toString("base64") } },
          { text: `Erstelle für dieses Bild je Sprache einen kurzen natürlichen Bildtitel (3 bis 8 Wörter) und einen präzisen SEO-Alt-Text ohne Keyword-Stuffing (maximal 125 Zeichen). Kontext: ${context || "Khao Lak Hotel oder Zimmer"}.` },
        ] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: { de: { type: "STRING" }, en: { type: "STRING" }, title_de: { type: "STRING" }, title_en: { type: "STRING" } },
            required: ["de", "en", "title_de", "title_en"],
          },
          thinkingConfig: { thinkingBudget: 0 },
          maxOutputTokens: 500,
        },
      }),
      cache: "no-store",
    });
    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      error?: { message?: string };
    };
    if (!response.ok) return NextResponse.json({ error: data.error?.message || "Gemini-Anfrage fehlgeschlagen." }, { status: response.status });
    const responseText = data.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text || "";
    const parsed = parseJson(responseText);
    const de = typeof parsed?.de === "string" ? parsed.de.trim().slice(0, 160) : "";
    const en = typeof parsed?.en === "string" ? parsed.en.trim().slice(0, 160) : "";
    const title_de = typeof parsed?.title_de === "string" ? parsed.title_de.trim().slice(0, 100) : "";
    const title_en = typeof parsed?.title_en === "string" ? parsed.title_en.trim().slice(0, 100) : "";
    if (!de || !en || !title_de || !title_en) return NextResponse.json({ error: "Die KI hat keine gültigen Bildtexte geliefert." }, { status: 502 });
    return NextResponse.json({ de, en, title_de, title_en });
  } catch (error) {
    console.error("Alt-Text-Generierung fehlgeschlagen:", error);
    return NextResponse.json({ error: "Alt-Texte konnten nicht erstellt werden." }, { status: 500 });
  }
}
