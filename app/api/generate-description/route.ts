import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { spotData } = await request.json();
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Du bist ein erfahrener SEO-Copywriter und Reise-Insider für den 'Khao Lak Insider'.
      Deine Aufgabe ist es, hochgradig optimierten, nützlichen Content für folgenden Ort zu schreiben: ${spotData.title} (Kategorie: ${spotData.category}).
      Ziel ist es, die Suchintention (User Intent) umfassender und detaillierter zu bedienen als die Konkurrenz, um auf Platz 1 bei Google zu ranken.

      PROMPT-RICHTLINIEN FÜR DEN INHALT:
      - TONALITÄT: Schreibe einladend, authentisch und aus der Perspektive eines lokalen Insiders (wie ein guter Freund vor Ort). Vermeide leere Floskeln wie "ein unvergessliches Erlebnis" oder "atemberaubende Kulisse". Nutze stattdessen bildhafte Beschreibungen und konkrete Fakten.
      - DETAILORIENTIERUNG: Integriere handfeste Details für Reisende vor Ort. Beantworte im Text zwingend Fragen wie: Wo genau parkt man? (Gibt es Orientierungspunkte?), Gibt es Schatten/Palmen?, Wie sieht es mit Liegen aus (Ab wann belegt?), Welche Restaurants/Bars gibt es namentlich vor Ort? Berücksichtige saisonale Besonderheiten (z. B. Wellen/Strömung in der Hauptsaison vs. Regenzeit von Mai bis Oktober).
      - KEYWORDS: Integriere Begriffe, nach denen Reisende suchen (z.B. "Khao Lak", "Urlaub", "Geheimtipp", sowie den Namen des Ortes selbst), vollkommen natürlich im Text.

      TEXTLÄNGE & ABSCHNITTS-STRUKTUR FÜR 'long_description':
      Der Text in 'long_description' MUSS eine Gesamtlänge von 400 bis 500 Wörtern haben und exakt in 3 bis 4 Abschnitte unterteilt sein. Jeder Abschnitt benötigt zwingend eine Markdown-Überschrift "### ". Nutze folgendes Raster:
      1. "### Warum sich der Besuch lohnt" (Das Highlight & die Atmosphäre – ca. 100 Wörter)
      2. "### Anreise & Parken vor Ort" (Konkrete Navigation, Orientierungspunkte, Roller-/Auto-Parkplätze – ca. 100 Wörter)
      3. "### Infrastruktur, Essen & Trinken" (Schattenplätze, Liegen-Situation, namentliche Strandbars/Restaurants – ca. 150 Wörter)
      4. "### Insider-Tipp & Sicherheit" (Beste Uhrzeit für Fotos, Verhalten bei Strömung/Regenzeit – ca. 100 Wörter)

      AUFGABEN-ÜBERSICHT:
      1. Kurze Einleitung (description): Max. 100 Zeichen. Muss den Leser neugierig machen und das Haupt-Keyword enthalten (Meta-Description-Stil).
      2. Ausführliche Beschreibung (long_description): Der oben definierte SEO-Haupttext (400-500 Wörter, 3-4 Abschnitte mit ### Überschriften).
      3. Sterne-Kategorie (stars): Entscheide/Schätze die offizielle Hotel-Kategorie/Sterne (0-5). Wenn die Kategorie ungleich "Unterkunft" (also kein Hotel) ist, setze strikt 0.
      4. Features (features): Erstelle genau 6 nützliche Features für diesen Ort. Nutze ausschließlich diese Icon-Namen: ['Sparkles', 'Wifi', 'Coffee', 'Car', 'Camera', 'Music', 'Map', 'Sun', 'Waves', 'Utensils', 'Mountain', 'Umbrella', 'Bike'].

      Antworte strikt im JSON-Format ohne erklärenden Text oder zusätzliche Zeichen außerhalb des Objekts: 
      { 
        "description": "Hier die Einleitung (max 100 Zeichen)", 
        "long_description": "Hier die lange, detaillierte Insider-Beschreibung (400-500 Wörter) mit exakt den vorgegebenen ### Überschriften",
        "stars": "0",
        "features": [
          {"label": "Label", "value": "Wert", "icon": "Sparkles"},
          {"label": "Label", "value": "Wert", "icon": "Wifi"},
          {"label": "Label", "value": "Wert", "icon": "Coffee"},
          {"label": "Beispiel", "value": "Beispiel", "icon": "Car"},
          {"label": "Beispiel", "value": "Beispiel", "icon": "Camera"},
          {"label": "Beispiel", "value": "Beispiel", "icon": "Sun"}
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}