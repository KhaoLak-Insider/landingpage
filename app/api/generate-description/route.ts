import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { spotData } = await request.json();
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 1. Wahrscheinlichkeit berechnen: Zufallszahl zwischen 1 und 100
    const randomValue = Math.floor(Math.random() * 100) + 1;
    // Wenn die Zahl 5 oder kleiner ist, ist das "Geheimtipp-Feature" für diesen Request aktiv (5% Chance)
    const allowGeheimtipp = randomValue <= 5;

    // Parkplatzdaten aufbereiten
    const parkenInfo = spotData.parking_info 
      ? `Name/Ort des Parkplatzes: ${spotData.parking_info.name || 'Keine Angabe'}, Gebühr: ${spotData.parking_info.price || 'Keine Angabe'}, Details: ${spotData.parking_info.details || 'Keine Angabe'}`
      : "Keine spezifischen Parkplatzdaten hinterlegt.";

    // 2. Dynamische Regel je nach gewürfeltem Prozentwert
    const geheimtippRegel = allowGeheimtipp
      ? `GEHEIMTIPP-ERLAUBNIS: Du darfst diesen Ort ausnahmsweise im Text als echten "Geheimtipp" oder "Insider-Tipp" bezeichnen, da er sich perfekt dafür eignet. Übertreibe es aber nicht und bleibe trotzdem glaubwürdig.`
      : `GEHEIMTIPP-VERBOT: Verwende NIEMALS das Wort "Geheimtipp" oder "Insider-Tipp" im Fließtext. Beschreibe den Ort ehrlich und authentisch, ohne künstlichen Hype. Bei vielen Spots im Guide ist es unglaubwürdig, wenn jeder ein unentdecktes Juwel ist.`;

    const prompt = `
      Du bist ein erfahrener SEO-Copywriter und ehrlicher Reise-Insider für den 'Khao Lak Insider'.
      Deine Aufgabe ist es, einen absolut individuellen, nützlichen Content für folgenden Ort zu schreiben: ${spotData.title} (Kategorie: ${spotData.category}).
      Hinterlegte Geodaten: Breitengrad (Latitude): ${spotData.latitude || 'Nicht angegeben'}, Längengrad (Longitude): ${spotData.longitude || 'Nicht angegeben'}.
      Hinterlegte Parkplatz-Fakten: ${parkenInfo}.

      CRITICAL: ANTI-FLOSKEL & ANTI-HALLUZINATIONS-REGELN:
      1. ${geheimtippRegel}
      2. SONNENUNTERGANGS-VERBOT: Erwähne das Wort "Sonnenuntergang" NUR UND AUSSCHLIESSLICH dann, wenn es sich um einen Ort handelt, der direkt im Westen am Strand liegt und wo man den Sonnenuntergang tatsächlich sehen kann. Wenn es ein Markt, ein Wasserfall, ein Restaurant im Landesinneren oder ein Nationalpark ist, erwähne KEINEN Sonnenuntergang!
      3. INFORMATION GAIN & VERORTUNG: Halluziniere keine Anfahrtsbeschreibungen oder Wege. Nutze stattdessen die oben mitgegebenen Parkplatz-Fakten (${parkenInfo}). Wenn dort keine genauen Orientierungspunkte stehen, schreibe allgemein, wie man den Ort mit dem Roller oder Auto erreicht, ohne fiktive Kreuzungen oder Schilder zu erfinden. Oriente dich an den echten Koordinaten.
      4. TONALITÄT: Schreibe einladend, authentisch und aus der Perspektive eines lokalen Freundes. Vermeide leere Werbephrasen wie "ein unvergessliches Erlebnis", "atemberaubende Kulisse" oder "magischer Ort". Nutze konkrete, bildhafte Fakten.

      TEXTLÄNGE & ABSCHNITTS-STRUKTUR FÜR 'long_description':
      Der Text in 'long_description' MUSS eine Gesamtlänge von 400 bis 500 Wörtern haben und exakt in 3 bis 4 Abschnitte unterteilt sein. Jeder Abschnitt benötigt zwingend eine Markdown-Überschrift "### ". Nutze folgendes Raster:
      1. "### Warum sich der Besuch lohnt" (Das echte Highlight, die reale Atmosphäre und was diesen Ort von anderen in Khao Lak unterscheidet – ca. 100 Wörter)
      2. "### Anreise & Parken vor Ort" (Nutze die echten Parkplatz-Daten: ${parkenInfo}. Erkläre sachlich die Erreichbarkeit basierend auf den Fakten – ca. 100 Wörter)
      3. "### Infrastruktur, Essen & Trinken" (Schattenplätze, Liegen-Situation, namentliche Strandbars/Restaurants vor Ort – ca. 150 Wörter)
      4. "### Besonderheiten & Sicherheit" (Beste Uhrzeit für Fotos, Verhalten bei Strömung/Regenzeit von Mai bis Oktober – ca. 100 Wörter)

      AUFGABEN-ÜBERSICHT:
      1. Kurze Einleitung (description): Max. 100 Zeichen. Muss den Leser neugierig machen und den Namen des Ortes enthalten (keine Floskeln).
      2. Ausführliche Beschreibung (long_description): Der oben definierte SEO-Haupttext (400-500 Wörter, 3-4 Abschnitte mit ### Überschriften).
      3. Sterne-Kategorie (stars): Entscheide/Schätze die offizielle Hotel-Kategorie/Sterne (0-5). Wenn die Kategorie ungleich "Unterkunft" oder "Hotel" ist, setze strikt 0.
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
          {"label": "Label", "value": "Wert", "icon": "Car"},
          {"label": "Label", "value": "Wert", "icon": "Camera"},
          {"label": "Label", "value": "Wert", "icon": "Sun"}
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