import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface SpotData {
  title?: string;
  category?: string;
  category_family?: string;
  description?: string;
  opening_hours?: string;
  price_level?: number | string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  parking_info?: {
    name?: string;
    price?: string;
    details?: string;
  } | null;
}

interface CategoryPrompt {
  role: string;
  sections: [string, string, string, string];
  focus: string;
  forbidden: string;
  featureGuidance: string;
}

const DEFAULT_PROMPT: CategoryPrompt = {
  role: "ehrlicher Khao-Lak-Reiseexperte für sehenswerte Orte",
  sections: [
    "Warum sich ein Besuch lohnt",
    "Was dich vor Ort erwartet",
    "Anreise & praktische Hinweise",
    "Für wen sich der Ort eignet",
  ],
  focus:
    "konkreter Charakter des Ortes, Atmosphäre, tatsächlicher Nutzen für Reisende, Erreichbarkeit und realistische Erwartungen",
  forbidden:
    "Erfinde keine Öffnungszeiten, Preise, Angebote, Einrichtungen oder historischen Fakten.",
  featureGuidance:
    "Wähle sechs sachliche Merkmale, die den Ort und den praktischen Besuch beschreiben.",
};

const CATEGORY_PROMPTS: Record<string, CategoryPrompt> = {
  strand: {
    role: "erfahrener Khao-Lak-Strandkenner",
    sections: [
      "Strandcharakter & Atmosphäre",
      "Baden, Sand & natürliche Bedingungen",
      "Anreise, Parken & Infrastruktur",
      "Beste Besuchszeit & Sicherheit",
    ],
    focus:
      "Sand, Küstenform, Ruhe oder Belebtheit, Schatten, Baden, Wellen, Gezeiten, Strandzugänge, Liegen sowie Gastronomie in unmittelbarer Nähe",
    forbidden:
      "Behaupte keine ganzjährig sicheren Badebedingungen. Erfinde keine Strömungen, Liegen, Strandbars oder Sonnenuntergangssicht. Sonnenuntergang nur erwähnen, wenn die Westlage anhand der Fakten plausibel ist.",
    featureGuidance:
      "Bevorzuge konkrete Strandmerkmale wie Ruhe, Schatten, Wellen, Infrastruktur, Fotomotive und Erreichbarkeit.",
  },
  "essen-trinken": {
    role: "ehrlicher Kenner der Gastronomie in Khao Lak",
    sections: [
      "Küche, Konzept & Atmosphäre",
      "Speisen, Getränke & Besonderheiten",
      "Preisniveau, Service & Zielgruppe",
      "Lage, Anreise & beste Besuchszeit",
    ],
    focus:
      "Art der Küche, authentischer Charakter, Atmosphäre, Sitzsituation, Preis-Leistung, Zielgruppe und nachvollziehbare Gründe für einen Besuch",
    forbidden:
      "Erfinde keine Gerichte, Preise, Öffnungszeiten, Reservierungsregeln, Auszeichnungen oder Speisekarten. Nenne konkrete Angebote nur, wenn sie in den Eingabedaten stehen.",
    featureGuidance:
      "Bevorzuge Küche, Atmosphäre, Preisniveau, Lage, Zielgruppe und Serviceart statt allgemeiner Werbeaussagen.",
  },
  restaurant: {
    role: "erfahrener, sachlicher Gastronomieredakteur mit Khao-Lak-Kenntnis",
    sections: [
      "Was das Restaurant kulinarisch auszeichnet",
      "Atmosphäre & Besuchserlebnis",
      "Für wen das Restaurant die richtige Wahl ist",
      "Preisniveau, Lage & praktische Hinweise",
    ],
    focus:
      "Beantworte die echten Fragen eines Gastes: Welche Art Restaurant ist es? Was unterscheidet es von anderen Optionen? Für welchen Anlass und welche Gäste passt es? Wie sind Atmosphäre, Preisniveau, Lage und praktische Planung einzuordnen? Schreibe wie ein glaubwürdiger Reiseführer, nicht wie das Restaurant selbst",
    forbidden:
      "Erfinde keine Gerichte, Preise, Öffnungszeiten, Reservierungspflichten, Bewertungen oder Auszeichnungen. Behaupte nicht, ein Gericht selbst probiert zu haben, wenn dazu keine Fakten vorliegen.",
    featureGuidance:
      "Erstelle genau diese sechs Fakten in dieser Reihenfolge: Küche (Utensils), Atmosphäre (Sparkles), Preisniveau (CircleDollarSign), Geeignet für (Users), Lage (MapPin), Parken/Anreise (Car). Nutze ausschließlich belegte Angaben; wenn ein Wert unbekannt ist, formuliere eine neutrale nützliche Einordnung statt eine konkrete Behauptung.",
  },
  bars: {
    role: "Kenner der Bars und des entspannten Nachtlebens in Khao Lak",
    sections: [
      "Stimmung & Konzept",
      "Getränke, Musik & Unterhaltung",
      "Publikum, Preisniveau & passende Anlässe",
      "Lage, Anreise & Besuchszeit",
    ],
    focus:
      "Atmosphäre, Lautstärke, Musikstil, Sitzbereiche, Zielgruppe, Lage und Unterschied zwischen entspannter Bar und Partyangebot",
    forbidden:
      "Erfinde keine Happy Hours, Getränkepreise, Live-Musik-Termine, Öffnungszeiten oder Events.",
    featureGuidance:
      "Wähle Merkmale zu Stimmung, Musik, Getränkefokus, Publikum, Lage und Besuchsanlass.",
  },
  strandbar: {
    role: "Kenner der Strandbars in Khao Lak",
    sections: [
      "Lage am Strand & Atmosphäre",
      "Getränke, Essen & Sitzplätze",
      "Für wen und welchen Anlass die Strandbar passt",
      "Anreise, Besuchszeit & praktische Hinweise",
    ],
    focus:
      "direkte Strandlage, Aussicht, Schatten, Sitzmöglichkeiten, entspannte Stimmung, Zielgruppe und Kombination mit einem Strandbesuch",
    forbidden:
      "Erfinde keine Speisen, Cocktails, Preise, Happy Hours, Öffnungszeiten oder Sonnenuntergangssicht.",
    featureGuidance:
      "Wähle Merkmale zu Strandlage, Atmosphäre, Schatten, Getränken, Essen und Erreichbarkeit.",
  },
  "local-food": {
    role: "Kenner authentischer lokaler Küche in Phang Nga und Khao Lak",
    sections: [
      "Lokale Küche & Charakter",
      "Bestellung & kulinarisches Erlebnis",
      "Preisniveau, Atmosphäre & für wen es passt",
      "Lage, Anreise & praktische Hinweise",
    ],
    focus:
      "lokaler Charakter, einfache oder traditionelle Atmosphäre, Bestellsituation, Preis-Leistung und respektvolle Einordnung thailändischer Esskultur",
    forbidden:
      "Erfinde keine Gerichte, Preise, Schärfegrade, Öffnungszeiten oder englischsprachige Speisekarten. Stelle einfache Ausstattung nicht abwertend dar.",
    featureGuidance:
      "Wähle Merkmale zu Authentizität, Küche, Preisniveau, Atmosphäre, Bestellung und Lage.",
  },
  unterkunft: {
    role: "unabhängiger Hotel- und Unterkunftsexperte für Khao Lak",
    sections: [
      "Lage & Charakter der Unterkunft",
      "Zimmer, Anlage & Ausstattung",
      "Strand, Gastronomie & Umgebung",
      "Zielgruppe, Preis-Leistung & Anreise",
    ],
    focus:
      "Lage, Unterkunftstyp, Atmosphäre, Zimmercharakter, Anlage, Strandzugang, Zielgruppe, Umgebung und nachvollziehbare Stärken oder Einschränkungen",
    forbidden:
      "Erfinde keine Zimmeranzahl, Ausstattung, Sterneklassifizierung, Restaurants, Pools, Strandzugänge, Preise oder Serviceleistungen. Schätze Sterne nur bei eindeutiger Faktenlage, sonst 0.",
    featureGuidance:
      "Wähle Merkmale zu Lage, Unterkunftstyp, Zimmern, Anlage, Strandnähe und Zielgruppe.",
  },
  ausfluege: {
    role: "erfahrener Ausflugsplaner für Khao Lak und Phang Nga",
    sections: [
      "Erlebnis & wichtigste Höhepunkte",
      "Typischer Ablauf & benötigte Zeit",
      "Voraussetzungen, Ausrüstung & Zielgruppe",
      "Anreise, Organisation & Sicherheit",
    ],
    focus:
      "Art des Erlebnisses, realistischer Ablauf, Dauer nur bei Faktenlage, körperliche Anforderungen, passende Ausrüstung, Wetterabhängigkeit und Zielgruppe",
    forbidden:
      "Erfinde keine Abfahrtszeiten, Preise, inkludierten Leistungen, Anbieter, garantierten Tiersichtungen, Tourdauer oder Sicherheitszusagen.",
    featureGuidance:
      "Wähle Merkmale zu Erlebnisart, Aktivitätsniveau, Dauer, Ausrüstung, Wetterabhängigkeit und Zielgruppe.",
  },
  markt: {
    role: "Kenner der lokalen Märkte in Khao Lak und Phang Nga",
    sections: [
      "Marktcharakter & Atmosphäre",
      "Angebot, Essen & Einkaufserlebnis",
      "Preise, Orientierung & Verhalten vor Ort",
      "Markttage, Anreise & beste Besuchszeit",
    ],
    focus:
      "Größe und Charakter, lokales oder touristisches Angebot, Essensstände, Einkaufssituation, Orientierung, Anreise und Besuchsatmosphäre",
    forbidden:
      "Erfinde keine Markttage, Uhrzeiten, Preise, Händlerzahlen oder konkreten Produkte. Wenn Zeiten nicht bekannt sind, weise darauf hin, sie aktuell zu prüfen.",
    featureGuidance:
      "Wähle Merkmale zu Marktart, Angebot, Essen, Atmosphäre, Preisniveau und Erreichbarkeit.",
  },
  natur: {
    role: "verantwortungsbewusster Natur- und Outdoor-Guide für Südthailand",
    sections: [
      "Landschaft & Naturerlebnis",
      "Weg, Schwierigkeit & Voraussetzungen",
      "Ausrüstung, Wetter & beste Besuchszeit",
      "Anreise, Sicherheit & Naturschutz",
    ],
    focus:
      "Landschaft, Wegbeschaffenheit nur bei Faktenlage, körperliche Anforderungen, Wetterrisiken, Ausrüstung, Tierwelt ohne Garantien und respektvoller Naturschutz",
    forbidden:
      "Erfinde keine Weglängen, Schwierigkeitsgrade, Eintrittspreise, Öffnungszeiten, Tierbeobachtungen oder Sicherheitsgarantien.",
    featureGuidance:
      "Wähle Merkmale zu Landschaft, Aktivitätsniveau, Weg, Ausrüstung, Wetter und Naturschutz.",
  },
  tempel: {
    role: "respektvoller Kenner buddhistischer Tempel und lokaler Kultur",
    sections: [
      "Bedeutung & Atmosphäre",
      "Architektur & was es zu sehen gibt",
      "Kleiderordnung & respektvolles Verhalten",
      "Anreise, Besuchszeit & praktische Hinweise",
    ],
    focus:
      "kultureller Kontext, Atmosphäre, Architektur nur anhand bekannter Fakten, angemessene Kleidung, respektvolles Verhalten und praktische Besuchshinweise",
    forbidden:
      "Erfinde keine Baujahre, religiösen Bedeutungen, Legenden, Eintrittspreise, Zeremonien oder Öffnungszeiten.",
    featureGuidance:
      "Wähle Merkmale zu Atmosphäre, Architektur, Kultur, Kleidung, Lage und Besuchsbedingungen.",
  },
};

function normalizeCategory(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCategoryPrompt(category: string): CategoryPrompt {
  return CATEGORY_PROMPTS[normalizeCategory(category)] || DEFAULT_PROMPT;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unbekannter Fehler";
}

interface GeneratedFeature {
  label?: unknown;
  value?: unknown;
  icon?: unknown;
}

interface GeneratedPayload {
  description?: unknown;
  long_description?: unknown;
  stars?: unknown;
  features?: unknown;
}

interface FoodAndDrinkPayload {
  hero_description?: unknown;
  meta_description?: unknown;
  seo_title?: unknown;
  slug?: unknown;
  keywords?: unknown;
  content?: {
    introduction?: unknown;
    atmosphere?: unknown;
    food?: unknown;
    target_group?: unknown;
    editorial?: unknown;
    conclusion?: unknown;
  };
  highlights?: unknown;
}

const VALID_ICONS = new Set([
  "Sparkles", "Wifi", "Coffee", "Car", "Camera", "Music", "MapPin",
  "Sun", "Waves", "Utensils", "Mountain", "Umbrella", "Bike",
  "CircleDollarSign", "Users", "Clock", "Leaf", "ShoppingBag",
  "UtensilsCrossed", "GlassWater", "Wine", "Salad", "Baby", "Heart",
]);

function semanticIcon(feature: GeneratedFeature): string {
  const text = `${String(feature.label || "")} ${String(feature.value || "")}`
    .toLowerCase();

  if (/preis|price|budget|kosten|cost|baht/.test(text)) return "CircleDollarSign";
  if (/küche|kueche|essen|gericht|food|cuisine|speise/.test(text)) return "Utensils";
  if (/atmosphäre|atmosphaere|ambiente|stimmung|atmosphere/.test(text)) return "Sparkles";
  if (/geeignet|zielgruppe|famil|paar|gruppe|audience|suitable/.test(text)) return "Users";
  if (/park|anreise|auto|roller|arrival|transport/.test(text)) return "Car";
  if (/lage|location|entfernung|distance|umgebung/.test(text)) return "MapPin";
  if (/öffnung|oeffnung|uhrzeit|zeit|hours|time/.test(text)) return "Clock";
  if (/strand|meer|welle|beach|sea|wave/.test(text)) return "Waves";
  if (/musik|music|live/.test(text)) return "Music";
  if (/kaffee|coffee|café|cafe/.test(text)) return "Coffee";
  if (/natur|dschungel|landschaft|nature|jungle/.test(text)) return "Leaf";
  if (/foto|photo|aussicht|view/.test(text)) return "Camera";
  if (/fahrrad|bike|bicycle|rad/.test(text)) return "Bike";

  const proposed = typeof feature.icon === "string" ? feature.icon : "";
  return VALID_ICONS.has(proposed) && proposed !== "Bike" ? proposed : "Sparkles";
}

function normalizePayload(
  payload: GeneratedPayload,
  category: string,
): GeneratedPayload {
  const restaurantIcons = [
    "Utensils", "Sparkles", "CircleDollarSign", "Users", "MapPin", "Car",
  ];
  const isRestaurant = normalizeCategory(category) === "restaurant";
  const features = Array.isArray(payload.features)
    ? payload.features.slice(0, 6).map((value, index) => {
        const feature = value && typeof value === "object"
          ? value as GeneratedFeature
          : {};
        return {
          label: String(feature.label || "").trim().slice(0, 60),
          value: String(feature.value || "").trim().slice(0, 100),
          icon: isRestaurant ? restaurantIcons[index] : semanticIcon(feature),
        };
      }).filter((feature) => feature.label && feature.value)
    : [];

  return {
    description: String(payload.description || "").trim(),
    long_description: String(payload.long_description || "").trim(),
    stars: String(payload.stars || "0"),
    features,
  };
}

function isFoodAndDrinkCategory(spotData: SpotData): boolean {
  const family = normalizeCategory(spotData.category_family || "");
  const category = normalizeCategory(spotData.category || "");
  return family === "essen-trinken" || [
    "essen-trinken", "restaurant", "bars", "bar", "strandbar",
    "strandbars", "local-food", "cafe", "cafes",
  ].includes(category);
}

function foodAndDrinkPrompt(spotData: SpotData, parkingInfo: string): string {
  return `
Du bist professioneller Reisejournalist, SEO-Texter und Content-Strategist für hochwertige Reiseführer.

Deine Aufgabe ist es, eine außergewöhnlich hochwertige Restaurantbeschreibung für Khao Lak Insider zu erstellen.

## Ziel

Der Text soll

- den Leser umfassend informieren
- Lust auf einen Besuch machen
- Vertrauen schaffen
- natürlich wirken
- hervorragend bei Google ranken
- einen echten Mehrwert gegenüber anderen Reiseseiten bieten.

Schreibe niemals für Suchmaschinen.
Schreibe immer für Menschen.
SEO soll sich ausschließlich aus hoher Qualität ergeben.

------------------------------------------------

## Schreibstil

Der Schreibstil soll

- hochwertig
- modern
- emotional
- authentisch
- informativ
- seriös
- journalistisch
- leicht verständlich

sein.

Keine Werbesprache.

Keine übertriebenen Superlative.

Keine Floskeln.

Keine KI-typischen Formulierungen.

Vermeide Formulierungen wie

"ein unvergessliches Erlebnis"

"Paradies"

"traumhaft"

"atemberaubend"

"perfekt"

wenn diese nicht wirklich begründet sind.

Beschreibe stattdessen konkrete Vorteile.

------------------------------------------------

## SEO

Der Text soll automatisch alle relevanten Keywords natürlich integrieren.

Beispiele:

Restaurantname

Restaurant Khao Lak

Essen in Khao Lak

Thai Restaurant

Seafood Restaurant

Restaurant am Strand

Restaurant Bang Niang

Restaurant Nang Thong

Dinner in Khao Lak

Mittagessen Khao Lak

Cocktails

Frühstück

Abendessen

Authentische Thai Küche

Meeresfrüchte

je nach Restaurant passende Begriffe.

Keyword-Stuffing ist verboten.

Die Keywords müssen natürlich eingebaut werden.

------------------------------------------------

## Textlänge

Mindestens 900 Wörter.

Optimal:

900–1400 Wörter.

------------------------------------------------

## Aufbau

Erstelle folgende Bereiche:

# Einleitung

Eine emotionale Einführung in das Restaurant.

ca. 120 Wörter

------------------------------------------------

# Atmosphäre

Beschreibe

- Ambiente
- Einrichtung
- Lage
- Zielgruppe
- Stimmung

------------------------------------------------

# Speisen und Getränke

Beschreibe

- Küche
- Spezialitäten
- Getränke
- Cocktails
- Qualität
- regionale Besonderheiten

------------------------------------------------

# Für wen eignet sich das Restaurant?

Gehe auf

- Paare
- Familien
- Alleinreisende
- Gruppen
- Vegetarier
- Veganer
- Kinder

ein.

------------------------------------------------

# Unser Eindruck

Eine ehrliche redaktionelle Einschätzung.

Nicht übertrieben positiv.

Auch kleinere Schwächen dürfen erwähnt werden.

------------------------------------------------

# Fazit

Ein natürlicher Abschluss.

Der Leser soll Lust bekommen, das Restaurant selbst zu besuchen.

------------------------------------------------

## Wichtige Punkte

Erstelle zusätzlich genau 6 Highlights.

Jedes Highlight besteht aus

- Titel
- kurzer Beschreibung
- passendem Lucide-Icon

Die Icons dürfen ausschließlich aus der Lucide Icon Library stammen.

Format:

[
 {
   "title":"Authentische Thai Küche",
   "description":"Frisch zubereitete traditionelle Gerichte.",
   "icon":"UtensilsCrossed"
 },
 ...
]

------------------------------------------------

## Ausgabeformat

Gib ausschließlich folgendes JSON zurück:

{
  "hero_description": "",
  "meta_description": "",
  "seo_title": "",
  "slug": "",
  "keywords": [],
  "content": {
      "introduction":"",
      "atmosphere":"",
      "food":"",
      "target_group":"",
      "editorial":"",
      "conclusion":""
  },
  "highlights":[]
}

------------------------------------------------

## Eingabedaten

Restaurantname: ${spotData.title?.trim() || "Nicht angegeben"}

Standort: ${spotData.description?.trim() || `${spotData.latitude || "nicht angegeben"}, ${spotData.longitude || "nicht angegeben"}`}

Homepage: Nicht angegeben

Google Maps: ${spotData.latitude && spotData.longitude ? `https://www.google.com/maps/search/?api=1&query=${spotData.latitude},${spotData.longitude}` : "Nicht angegeben"}

Google Bewertung: Nicht angegeben

Kategorie: ${spotData.category?.trim() || "Nicht angegeben"}

Besonderheiten: Preislevel ${spotData.price_level || "nicht angegeben"}; Öffnungszeiten ${spotData.opening_hours?.trim() || "nicht angegeben"}; ${parkingInfo}

Speisekarte: Nicht angegeben

Eigene Notizen: ${spotData.description?.trim() || "Nicht angegeben"}

------------------------------------------------

Nutze ausschließlich belegbare Informationen.

Falls Informationen fehlen, formuliere neutral.

Erfinde niemals Fakten.

Schreibe so, als wäre der Text von einem professionellen Reisemagazin erstellt worden.

Der Leser soll nach dem Lesen deutlich mehr über das Restaurant wissen als auf den Webseiten von Booking, Google oder Tripadvisor.
`;
}

function normalizeFoodAndDrinkPayload(
  payload: FoodAndDrinkPayload,
): GeneratedPayload & Record<string, unknown> {
  const content = payload.content || {};
  const sectionValues = [
    ["Einleitung", content.introduction],
    ["Atmosphäre", content.atmosphere],
    ["Speisen und Getränke", content.food],
    ["Für wen eignet sich das Restaurant?", content.target_group],
    ["Unser Eindruck", content.editorial],
    ["Fazit", content.conclusion],
  ] as const;
  const longDescription = sectionValues
    .map(([heading, value]) => `### ${heading}\n\n${String(value || "").trim()}`)
    .join("\n\n");
  const rawHighlights = Array.isArray(payload.highlights)
    ? payload.highlights
    : [];
  const features = rawHighlights.slice(0, 6).map((value) => {
    const highlight = value && typeof value === "object"
      ? value as { title?: unknown; description?: unknown; icon?: unknown }
      : {};
    const feature: GeneratedFeature = {
      label: highlight.title,
      value: highlight.description,
      icon: highlight.icon,
    };
    return {
      label: String(feature.label || "").trim().slice(0, 60),
      value: String(feature.value || "").trim().slice(0, 140),
      icon: semanticIcon(feature),
    };
  }).filter((feature) => feature.label && feature.value);

  return {
    description: String(payload.hero_description || "").trim(),
    long_description: longDescription,
    stars: "0",
    features,
    seo_title: String(payload.seo_title || "").trim(),
    seo_description: String(payload.meta_description || "").trim(),
    slug: String(payload.slug || "").trim(),
    keywords: Array.isArray(payload.keywords) ? payload.keywords : [],
  };
}

export async function POST(request: Request) {
  try {
    const { spotData } = (await request.json()) as { spotData?: SpotData };
    if (!spotData?.title?.trim() || !spotData.category?.trim()) {
      return NextResponse.json(
        { error: "Titel und Kategorie werden für die KI-Beschreibung benötigt." },
        { status: 400 },
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const categoryPrompt = getCategoryPrompt(spotData.category);
    const allowInsiderTip = Math.floor(Math.random() * 100) + 1 <= 5;
    const parkingInfo = spotData.parking_info
      ? `Parkplatz: ${spotData.parking_info.name || "nicht angegeben"}; Gebühr: ${spotData.parking_info.price || "nicht angegeben"}; Details: ${spotData.parking_info.details || "nicht angegeben"}.`
      : "Keine verlässlichen Parkplatzinformationen hinterlegt.";

    const insiderRule = allowInsiderTip
      ? "Die Bezeichnung Geheimtipp oder Insider-Tipp ist höchstens einmal erlaubt, aber nur wenn sie inhaltlich glaubwürdig ist."
      : "Verwende die Begriffe Geheimtipp und Insider-Tipp nicht im Fließtext.";

    const sections = categoryPrompt.sections
      .map((heading, index) => `${index + 1}. \"### ${heading}\"`)
      .join("\n");

    const defaultPrompt = `
Du bist ${categoryPrompt.role} und SEO-Copywriter für Khao Lak Insider.

SPOT:
- Name: ${spotData.title.trim()}
- Kategorie: ${spotData.category.trim()}
- Koordinaten: ${spotData.latitude || "nicht angegeben"}, ${spotData.longitude || "nicht angegeben"}
- Vorhandene Kurzinfo/Google-Angabe: ${spotData.description?.trim() || "nicht angegeben"}
- Hinterlegtes Preislevel: ${spotData.price_level || "nicht angegeben"}
- Hinterlegte Öffnungszeiten: ${spotData.opening_hours?.trim() || "nicht angegeben"}
- ${parkingInfo}

KATEGORIE-ZIEL:
- Konzentriere dich auf: ${categoryPrompt.focus}.
- ${categoryPrompt.forbidden}
- ${categoryPrompt.featureGuidance}

VERBINDLICHE QUALITÄTSREGELN:
1. Schreibe auf Deutsch, konkret, hilfreich und aus der Perspektive eines ehrlichen lokalen Freundes.
2. Verwende keine leeren Werbephrasen wie "unvergessliches Erlebnis", "atemberaubende Kulisse", "magischer Ort" oder "verstecktes Juwel".
3. Erfinde keine Fakten. Wenn eine Information nicht in den Eingabedaten steht, formuliere keine scheinbar konkrete Behauptung dazu.
4. Nutze Koordinaten nur zur groben räumlichen Einordnung. Erfinde keine Straßen, Abzweigungen, Schilder oder Fahrtzeiten.
5. ${insiderRule}
6. Vermeide Wiederholungen und liefere echten Informationsgewinn für die Reiseplanung.
7. Keine Keyword-Listen und kein Keyword-Stuffing. Verwende den Ortsnamen und passende Khao-Lak-Begriffe natürlich.
8. Schreibe keine generischen Aussagen, die unverändert auf jedes andere Restaurant oder jeden anderen Spot passen würden.
9. Stelle Vermutungen niemals als persönliche Erfahrung dar. Formulierungen wie "wir haben probiert", "bei unserem Besuch" oder "unser Favorit" sind ohne entsprechende Eingabefakten verboten.

LONG_DESCRIPTION:
- 400 bis 500 Wörter.
- Exakt vier Abschnitte mit diesen Markdown-Überschriften:
${sections}
- Jeder Abschnitt muss inhaltlich zur Kategorie ${spotData.category.trim()} passen.

AUSGABE:
1. description: maximal 140 Zeichen, enthält den Ortsnamen und einen konkreten Nutzen.
2. long_description: der strukturierte Text mit exakt vier Überschriften.
3. stars: Nur bei Unterkünften eine belegbare offizielle Sternezahl von 1 bis 5; bei Unsicherheit und allen anderen Kategorien strikt 0.
4. features: genau sechs kurze, kategoriespezifische Fakten. Label und Wert müssen semantisch zusammenpassen. Erlaubte Icons: Sparkles, Wifi, Coffee, Car, Camera, Music, MapPin, Sun, Waves, Utensils, Mountain, Umbrella, Bike, CircleDollarSign, Users, Clock, Leaf, ShoppingBag. Icons dürfen niemals dekorativ oder zufällig gewählt werden.

Antworte ausschließlich als gültiges JSON ohne Markdown-Codeblock:
{
  "description": "...",
  "long_description": "### ...",
  "stars": "0",
  "features": [
    {"label": "...", "value": "...", "icon": "..."},
    {"label": "...", "value": "...", "icon": "..."},
    {"label": "...", "value": "...", "icon": "..."},
    {"label": "...", "value": "...", "icon": "..."},
    {"label": "...", "value": "...", "icon": "..."},
    {"label": "...", "value": "...", "icon": "..."}
  ]
}`;

    const usesFoodAndDrinkPrompt = isFoodAndDrinkCategory(spotData);
    const prompt = usesFoodAndDrinkPrompt
      ? foodAndDrinkPrompt(spotData, parkingInfo)
      : defaultPrompt;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(text) as GeneratedPayload | FoodAndDrinkPayload;
    return NextResponse.json(
      usesFoodAndDrinkPrompt
        ? normalizeFoodAndDrinkPayload(parsed as FoodAndDrinkPayload)
        : normalizePayload(parsed as GeneratedPayload, spotData.category),
    );
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
