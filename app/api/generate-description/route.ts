import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface SpotData {
  title?: string;
  category?: string;
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
    role: "ehrlicher Restauranttester mit Khao-Lak-Erfahrung",
    sections: [
      "Küche & kulinarischer Charakter",
      "Atmosphäre & Restauranterlebnis",
      "Preisniveau, Service & für wen es passt",
      "Lage, Anreise & praktische Tipps",
    ],
    focus:
      "Küchenstil, Authentizität, Atmosphäre, Sitzplätze, Preis-Leistung, Zielgruppe und Einordnung gegenüber touristischen oder lokalen Restaurants",
    forbidden:
      "Erfinde keine Gerichte, Preise, Öffnungszeiten, Reservierungspflichten, Bewertungen oder Auszeichnungen. Behaupte nicht, ein Gericht selbst probiert zu haben, wenn dazu keine Fakten vorliegen.",
    featureGuidance:
      "Erstelle Merkmale zu Küche, Atmosphäre, Preisniveau, Lage, Zielgruppe und Serviceform.",
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

    const prompt = `
Du bist ${categoryPrompt.role} und SEO-Copywriter für Khao Lak Insider.

SPOT:
- Name: ${spotData.title.trim()}
- Kategorie: ${spotData.category.trim()}
- Koordinaten: ${spotData.latitude || "nicht angegeben"}, ${spotData.longitude || "nicht angegeben"}
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

LONG_DESCRIPTION:
- 400 bis 500 Wörter.
- Exakt vier Abschnitte mit diesen Markdown-Überschriften:
${sections}
- Jeder Abschnitt muss inhaltlich zur Kategorie ${spotData.category.trim()} passen.

AUSGABE:
1. description: maximal 140 Zeichen, enthält den Ortsnamen und einen konkreten Nutzen.
2. long_description: der strukturierte Text mit exakt vier Überschriften.
3. stars: Nur bei Unterkünften eine belegbare offizielle Sternezahl von 1 bis 5; bei Unsicherheit und allen anderen Kategorien strikt 0.
4. features: genau sechs kurze, kategoriespezifische Merkmale. Erlaubte Icons: Sparkles, Wifi, Coffee, Car, Camera, Music, Map, Sun, Waves, Utensils, Mountain, Umbrella, Bike.

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();

    return NextResponse.json(JSON.parse(text));
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
