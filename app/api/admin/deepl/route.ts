import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

interface TranslateRequestBody {
  texts?: unknown;
  sourceLang?: unknown;
  targetLang?: unknown;
}

interface DeepLTranslation {
  detected_source_language?: string;
  text?: string;
}

interface DeepLResponse {
  translations?: DeepLTranslation[];
  message?: string;
}

const ALLOWED_SOURCE_LANGUAGES = new Set(["DE", "EN"]);
const ALLOWED_TARGET_LANGUAGES = new Set(["DE", "EN", "EN-GB", "EN-US"]);
const MAX_TEXTS_PER_REQUEST = 100;
const MAX_TOTAL_CHARACTERS = 100_000;

function getDeepLBaseUrl(apiKey: string): string {
  return apiKey.endsWith(":fx")
    ? "https://api-free.deepl.com"
    : "https://api.deepl.com";
}

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.replace(/^Bearer\s+/i, "").trim();

  if (!supabaseUrl || !supabaseAnonKey || !accessToken) {
    return false;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);

  if (userError || !user) {
    return false;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("DeepL API: Profilprüfung fehlgeschlagen:", profileError);
    return false;
  }

  const role = String(profile?.role || "").trim().toLowerCase();
  return role === "admin" || role === "editor";
}

export async function POST(request: NextRequest) {
  try {
    const isAuthorized = await verifyAdmin(request);

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Nicht autorisiert." },
        { status: 401 },
      );
    }

    const apiKey =
      process.env.DEEPL_API_KEY?.trim() ||
      process.env.DEEPL_AUTH_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "DEEPL_API_KEY oder DEEPL_AUTH_KEY ist auf dem Server nicht konfiguriert.",
        },
        { status: 500 },
      );
    }

    const body = (await request.json()) as TranslateRequestBody;

    const texts = Array.isArray(body.texts)
      ? body.texts.filter(
          (value): value is string =>
            typeof value === "string" && value.trim().length > 0,
        )
      : [];

    if (texts.length === 0) {
      return NextResponse.json(
        { error: "Es wurden keine Texte zum Übersetzen übergeben." },
        { status: 400 },
      );
    }

    if (texts.length > MAX_TEXTS_PER_REQUEST) {
      return NextResponse.json(
        {
          error: `Pro Anfrage sind höchstens ${MAX_TEXTS_PER_REQUEST} Texte erlaubt.`,
        },
        { status: 400 },
      );
    }

    const totalCharacters = texts.reduce(
      (sum, text) => sum + text.length,
      0,
    );

    if (totalCharacters > MAX_TOTAL_CHARACTERS) {
      return NextResponse.json(
        {
          error: `Die Anfrage überschreitet ${MAX_TOTAL_CHARACTERS.toLocaleString(
            "de-DE",
          )} Zeichen.`,
        },
        { status: 400 },
      );
    }

    const sourceLang = String(body.sourceLang || "DE").toUpperCase();
    const targetLang = String(body.targetLang || "EN-GB").toUpperCase();

    if (!ALLOWED_SOURCE_LANGUAGES.has(sourceLang)) {
      return NextResponse.json(
        { error: "Nicht unterstützte Ausgangssprache." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TARGET_LANGUAGES.has(targetLang)) {
      return NextResponse.json(
        { error: "Nicht unterstützte Zielsprache." },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${getDeepLBaseUrl(apiKey)}/v2/translate`,
      {
        method: "POST",
        headers: {
          Authorization: `DeepL-Auth-Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: texts,
          source_lang: sourceLang,
          target_lang: targetLang,
          preserve_formatting: true,
        }),
        cache: "no-store",
      },
    );

    const data = (await response.json()) as DeepLResponse;

    if (!response.ok) {
      console.error("DeepL API-Fehler:", response.status, data);

      return NextResponse.json(
        {
          error:
            data.message ||
            `DeepL hat die Anfrage mit Status ${response.status} abgelehnt.`,
        },
        { status: response.status },
      );
    }

    const translations = Array.isArray(data.translations)
      ? data.translations.map((translation) =>
          typeof translation.text === "string" ? translation.text : "",
        )
      : [];

    if (translations.length !== texts.length) {
      return NextResponse.json(
        { error: "DeepL hat nicht für jeden Text eine Übersetzung geliefert." },
        { status: 502 },
      );
    }

    return NextResponse.json({ translations });
  } catch (error) {
    console.error("Fehler in der DeepL-Route:", error);

    return NextResponse.json(
      { error: "Die Übersetzung konnte nicht ausgeführt werden." },
      { status: 500 },
    );
  }
}
