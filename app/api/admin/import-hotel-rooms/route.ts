import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ImportRequestBody {
  url?: unknown;
}

export interface ImportedRoomCandidate {
  source_url: string;
  slug: string;
  name_de: string;
  name_en: string;
  short_description_de: string;
  short_description_en: string;
  description_de: string;
  description_en: string;
  size_sqm: number | null;
  max_adults: number | null;
  max_children: number | null;
  max_occupancy: number | null;
  bed_type_de: string;
  bed_type_en: string;
  view_de: string;
  view_en: string;
  bathroom_de: string;
  bathroom_en: string;
  cover_image_url: string;
  images: Array<{
    url: string;
    alt_de: string;
    alt_en: string;
  }>;
  highlights_de: string[];
  highlights_en: string[];
  amenities_de: string[];
  amenities_en: string[];
}

const MAX_LINKED_PAGES = 15;
const FETCH_TIMEOUT_MS = 12_000;
const MAX_HTML_LENGTH = 2_000_000;

const ROOM_LINK_PATTERN =
  /(room|rooms|suite|suites|villa|villas|bungalow|bungalows|accommodation|accommodations|accom|pool-access|pool_villa|family-room|deluxe|superior|seaside|beachfront)/i;

const IGNORE_LINK_PATTERN =
  /(booking|reserve|reservation|offer|promotion|package|contact|privacy|terms|gallery|restaurant|spa|wedding|meeting|event|facebook|instagram|youtube|tripadvisor)/i;

function createSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code)),
    )
    .replace(/&#x([a-f0-9]+);/gi, (_, code: string) =>
      String.fromCharCode(Number.parseInt(code, 16)),
    );
}

function cleanText(value: string): string {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function makeAbsoluteUrl(value: string, pageUrl: URL): string | null {
  const cleaned = decodeHtml(value).trim();

  if (
    !cleaned ||
    cleaned.startsWith("data:") ||
    cleaned.startsWith("javascript:") ||
    cleaned.startsWith("mailto:") ||
    cleaned.startsWith("tel:")
  ) {
    return null;
  }

  try {
    return new URL(cleaned, pageUrl).toString();
  } catch {
    return null;
  }
}

function validatePublicHttpUrl(rawUrl: string): URL {
  const parsed = new URL(rawUrl);

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Es sind nur öffentliche HTTP- oder HTTPS-Adressen erlaubt.");
  }

  const hostname = parsed.hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    hostname.endsWith(".local") ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    /^127\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^169\.254\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  ) {
    throw new Error("Lokale oder private Netzwerkadressen sind nicht erlaubt.");
  }

  parsed.hash = "";
  return parsed;
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
    console.error("Zimmerimport: Rollenprüfung fehlgeschlagen:", profileError);
    return false;
  }

  const role = String(profile?.role || "").trim().toLowerCase();
  return role === "admin" || role === "editor";
}

async function fetchHtml(url: URL): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; KhaoLakInsiderHotelImporter/1.0; +https://khaolak.app)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en,de;q=0.8",
      },
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `Die Website antwortete mit Status ${response.status}.`,
      );
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
      throw new Error("Die angegebene Adresse liefert keine HTML-Seite.");
    }

    const html = await response.text();
    return html.slice(0, MAX_HTML_LENGTH);
  } finally {
    clearTimeout(timeout);
  }
}

function extractMeta(
  html: string,
  propertyOrName: string,
): string {
  const escaped = propertyOrName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return cleanText(match[1]);
  }

  return "";
}

function extractTitle(html: string): string {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  if (h1) return cleanText(h1);

  const ogTitle = extractMeta(html, "og:title");
  if (ogTitle) return ogTitle;

  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return title ? cleanText(title).replace(/\s+[|–—-]\s+.+$/, "") : "";
}

function extractParagraphs(html: string): string[] {
  const values: string[] = [];
  const pattern = /<(p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    const text = cleanText(match[2]);

    if (
      text.length >= 35 &&
      text.length <= 900 &&
      !/(cookie|privacy|copyright|subscribe|newsletter)/i.test(text)
    ) {
      values.push(text);
    }
  }

  return uniqueStrings(values);
}

function extractImageUrls(html: string, pageUrl: URL): string[] {
  const candidates: string[] = [];

  const ogImage = extractMeta(html, "og:image");
  if (ogImage) candidates.push(ogImage);

  const imagePattern =
    /<(?:img|source)\b[^>]+(?:src|data-src|data-lazy-src|srcset)=["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = imagePattern.exec(html)) !== null) {
    const firstCandidate = match[1].split(",")[0]?.trim().split(/\s+/)[0];

    if (firstCandidate) {
      candidates.push(firstCandidate);
    }
  }

  return uniqueStrings(
    candidates
      .map((value) => makeAbsoluteUrl(value, pageUrl))
      .filter((value): value is string => Boolean(value))
      .filter(
        (value) =>
          !/(logo|icon|favicon|avatar|placeholder|sprite|flag)/i.test(value),
      ),
  ).slice(0, 8);
}

function extractLinks(
  html: string,
  pageUrl: URL,
  rootOrigin: string,
): URL[] {
  const links: URL[] = [];
  const pattern = /<a\b[^>]+href=["']([^"'#]+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    const absolute = makeAbsoluteUrl(match[1], pageUrl);
    if (!absolute) continue;

    try {
      const url = new URL(absolute);
      url.hash = "";

      const searchable = `${url.pathname} ${url.search}`;

      if (
        url.origin === rootOrigin &&
        ROOM_LINK_PATTERN.test(searchable) &&
        !IGNORE_LINK_PATTERN.test(searchable)
      ) {
        links.push(url);
      }
    } catch {
      // Ungültige Links werden ignoriert.
    }
  }

  return [...new Map(links.map((url) => [url.toString(), url])).values()];
}

function firstNumber(
  text: string,
  patterns: RegExp[],
): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      const value = Number(String(match[1]).replace(",", "."));
      if (Number.isFinite(value)) return value;
    }
  }

  return null;
}

function collectKeywords(
  text: string,
  entries: Array<[RegExp, string, string]>,
): { de: string[]; en: string[] } {
  const de: string[] = [];
  const en: string[] = [];

  for (const [pattern, german, english] of entries) {
    if (pattern.test(text)) {
      de.push(german);
      en.push(english);
    }
  }

  return {
    de: uniqueStrings(de),
    en: uniqueStrings(en),
  };
}

function parseRoomPage(
  html: string,
  pageUrl: URL,
): ImportedRoomCandidate | null {
  const name = extractTitle(html).trim();
  const paragraphs = extractParagraphs(html);
  const metaDescription =
    extractMeta(html, "description") ||
    extractMeta(html, "og:description");
  const pageText = cleanText(html);
  const combinedText = [name, metaDescription, ...paragraphs].join(" ");

  if (
    !name ||
    name.length > 120 ||
    !ROOM_LINK_PATTERN.test(`${pageUrl.pathname} ${name} ${combinedText}`)
  ) {
    return null;
  }

  const sizeSqm = firstNumber(combinedText, [
    /(\d+(?:[.,]\d+)?)\s*(?:m²|m2|sq\.?\s*m|sqm|square metres?|square meters?)/i,
  ]);

  const maxAdults = firstNumber(combinedText, [
    /(?:maximum|max\.?|up to|capacity)\s*(?:of\s*)?(\d+)\s*adults?/i,
    /(\d+)\s*adults?/i,
  ]);

  const maxChildren = firstNumber(combinedText, [
    /(?:maximum|max\.?|up to)\s*(?:of\s*)?(\d+)\s*children?/i,
    /(\d+)\s*children?/i,
  ]);

  const maxOccupancy = firstNumber(combinedText, [
    /(?:maximum occupancy|max\.?\s*occupancy|sleeps?|accommodates?)\s*:?\s*(\d+)/i,
    /up to\s*(\d+)\s*(?:guests?|persons?|people)/i,
    /(\d+)\s*(?:guests?|persons?)\s*(?:maximum|max)?/i,
  ]);

  const bedKeywords = collectKeywords(combinedText, [
    [/\bking(?:-size| sized)? bed\b/i, "Kingsize-Bett", "King-size bed"],
    [/\bqueen(?:-size| sized)? bed\b/i, "Queensize-Bett", "Queen-size bed"],
    [/\btwin beds?\b/i, "Twin-Betten", "Twin beds"],
    [/\bdouble bed\b/i, "Doppelbett", "Double bed"],
    [/\bsofa bed\b/i, "Schlafsofa", "Sofa bed"],
    [/\bbunk beds?\b/i, "Etagenbett", "Bunk beds"],
  ]);

  const viewKeywords = collectKeywords(combinedText, [
    [/\bsea view\b|\bocean view\b/i, "Meerblick", "Sea view"],
    [/\bgarden view\b/i, "Gartenblick", "Garden view"],
    [/\bpool view\b/i, "Poolblick", "Pool view"],
    [/\bmountain view\b/i, "Bergblick", "Mountain view"],
    [/\blagoon view\b/i, "Lagunenblick", "Lagoon view"],
  ]);

  const bathroomKeywords = collectKeywords(combinedText, [
    [/\brain shower\b/i, "Regendusche", "Rain shower"],
    [/\bwalk-in shower\b/i, "Begehbare Dusche", "Walk-in shower"],
    [/\bbathtub\b|\bbath tub\b/i, "Badewanne", "Bathtub"],
    [/\boutdoor (?:bath|bathtub|shower)\b/i, "Außenbad/-dusche", "Outdoor bath/shower"],
    [/\bdouble (?:vanity|basin|sink)\b/i, "Doppelwaschbecken", "Double vanity"],
  ]);

  const highlights = collectKeywords(combinedText, [
    [/\bdirect pool access\b|\bpool access\b/i, "Direkter Poolzugang", "Direct pool access"],
    [/\bprivate pool\b/i, "Privater Pool", "Private pool"],
    [/\bprivate balcony\b|\bbalcony\b/i, "Privater Balkon", "Private balcony"],
    [/\bprivate terrace\b|\bterrace\b/i, "Private Terrasse", "Private terrace"],
    [/\bbeachfront\b|\bbeach front\b/i, "Direkte Strandlage", "Beachfront location"],
    [/\bseparate living (?:room|area)\b/i, "Separater Wohnbereich", "Separate living area"],
    [/\bconnecting rooms?\b|\binterconnecting\b/i, "Verbindungszimmer möglich", "Connecting rooms available"],
    [/\bjacuzzi\b|\bwhirlpool\b/i, "Whirlpool", "Whirlpool"],
  ]);

  const amenities = collectKeywords(combinedText, [
    [/\bair conditioning\b|\bair-conditioned\b/i, "Klimaanlage", "Air conditioning"],
    [/\bwi-?fi\b|\bwireless internet\b/i, "WLAN", "Wi-Fi"],
    [/\bsmart tv\b/i, "Smart-TV", "Smart TV"],
    [/\bsatellite tv\b|\bcable tv\b|\btelevision\b|\btv\b/i, "Fernseher", "Television"],
    [/\bminibar\b|\bmini bar\b/i, "Minibar", "Minibar"],
    [/\bsafe\b|\bsafety deposit box\b/i, "Safe", "Safe"],
    [/\bcoffee (?:maker|machine)\b|\btea and coffee\b/i, "Kaffee-/Teezubereitung", "Tea and coffee facilities"],
    [/\bhair ?dryer\b/i, "Haartrockner", "Hairdryer"],
    [/\bbathrobes?\b/i, "Bademäntel", "Bathrobes"],
    [/\bslippers?\b/i, "Hausschuhe", "Slippers"],
    [/\btelephone\b/i, "Telefon", "Telephone"],
    [/\brefrigerator\b|\bfridge\b/i, "Kühlschrank", "Refrigerator"],
    [/\bmicrowave\b/i, "Mikrowelle", "Microwave"],
    [/\bkitchenette\b|\bkitchen\b/i, "Küchenzeile", "Kitchenette"],
    [/\bdining area\b/i, "Essbereich", "Dining area"],
    [/\bdesk\b|\bwork desk\b/i, "Schreibtisch", "Work desk"],
  ]);

  const images = extractImageUrls(html, pageUrl);
  const shortDescription =
    metaDescription || paragraphs[0] || "";
  const description =
    paragraphs.slice(0, 5).join("\n\n") || shortDescription;

  return {
    source_url: pageUrl.toString(),
    slug: createSlug(name),
    name_de: name,
    name_en: name,
    short_description_de: shortDescription,
    short_description_en: shortDescription,
    description_de: description,
    description_en: description,
    size_sqm: sizeSqm,
    max_adults: maxAdults,
    max_children: maxChildren,
    // Erwachsenen- und Kinderlimits beschreiben oft alternative Belegungen
    // und dürfen deshalb nicht zu einer Gesamtbelegung addiert werden.
    max_occupancy: maxOccupancy,
    bed_type_de: bedKeywords.de.join(", "),
    bed_type_en: bedKeywords.en.join(", "),
    view_de: viewKeywords.de.join(", "),
    view_en: viewKeywords.en.join(", "),
    bathroom_de: bathroomKeywords.de.join(", "),
    bathroom_en: bathroomKeywords.en.join(", "),
    cover_image_url: images[0] || "",
    images: images.map((url) => ({
      url,
      alt_de: `${name} – Zimmeransicht`,
      alt_en: `${name} – room view`,
    })),
    highlights_de: highlights.de.slice(0, 6),
    highlights_en: highlights.en.slice(0, 6),
    amenities_de: amenities.de,
    amenities_en: amenities.en,
  };
}

function deduplicateRooms(
  rooms: ImportedRoomCandidate[],
): ImportedRoomCandidate[] {
  const map = new Map<string, ImportedRoomCandidate>();

  for (const room of rooms) {
    const key = createSlug(room.name_en || room.name_de);

    if (!key || key.length < 3) continue;

    const existing = map.get(key);

    if (
      !existing ||
      room.description_de.length > existing.description_de.length
    ) {
      map.set(key, room);
    }
  }

  return [...map.values()];
}

export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAdmin(request))) {
      return NextResponse.json(
        { error: "Nicht autorisiert." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as ImportRequestBody;
    const rawUrl =
      typeof body.url === "string" ? body.url.trim() : "";

    if (!rawUrl) {
      return NextResponse.json(
        { error: "Bitte eine Hotelwebsite angeben." },
        { status: 400 },
      );
    }

    const rootUrl = validatePublicHttpUrl(rawUrl);
    const rootHtml = await fetchHtml(rootUrl);
    const linkedPages = extractLinks(
      rootHtml,
      rootUrl,
      rootUrl.origin,
    ).slice(0, MAX_LINKED_PAGES);

    const urlsToInspect =
      linkedPages.length > 0 ? linkedPages : [rootUrl];

    const results = await Promise.allSettled(
      urlsToInspect.map(async (url) => {
        const html =
          url.toString() === rootUrl.toString()
            ? rootHtml
            : await fetchHtml(url);

        return parseRoomPage(html, url);
      }),
    );

    const rooms = deduplicateRooms(
      results
        .filter(
          (
            result,
          ): result is PromiseFulfilledResult<ImportedRoomCandidate | null> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value)
        .filter(
          (room): room is ImportedRoomCandidate => room !== null,
        ),
    );

    return NextResponse.json({
      rooms,
      inspected_pages: urlsToInspect.length,
      warnings:
        rooms.length === 0
          ? [
              "Es wurden keine eindeutig strukturierten Zimmerdetailseiten erkannt. Prüfe, ob du die Unterkunftsübersicht des Hotels statt nur der Startseite angegeben hast.",
            ]
          : [],
    });
  } catch (error) {
    console.error("Fehler beim Website-Zimmerimport:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Die Hotelwebsite konnte nicht analysiert werden.",
      },
      { status: 500 },
    );
  }
}
