import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { spotData } = await request.json();
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Du bist ein erfahrener Reise-Journalist und SEO-Experte für den 'Khao Lak Insider'.
      Analysiere den Ort: ${spotData.title} (Kategorie: ${spotData.category}).
      
      AUFGABE:
      1. Kurze Einleitung (Meta-Description Stil): Max. 100 Zeichen. Muss den Leser neugierig machen und das Keyword enthalten.
      2. Ausführliche Beschreibung (SEO-optimiert): 
         - Schreibe in einem professionellen, inspirierenden Reise-Stil.
         - Nutze hochwertige, aussagekräftige Inhalte, die Mehrwert bieten.
         - Strukturiere den Text unbedingt mit mehreren ### Überschriften (z.B. "Warum sich der Besuch lohnt", "Tipps für den perfekten Tag", "Anreise & Lage").
         - Integriere Begriffe, nach denen Reisende suchen (z.B. "Khao Lak", "Urlaub", "Geheimtipp").
      3. Recherchiere/Schätze die offizielle Hotel-Kategorie/Sterne (0-5). Bei Nicht-Hotels setze 0. (Die Kategorie für Hotels ist bei mir Unterkunft)
      4. Erstelle genau 6 nützliche Features für diesen Ort. Nutze ausschließlich diese Icon-Namen: ['Sparkles', 'Wifi', 'Coffee', 'Car', 'Camera', 'Music', 'Map', 'Sun', 'Waves', 'Utensils', 'Mountain', 'Umbrella', 'Bike'].

      Antworte strikt im JSON-Format ohne erklärenden Text: 
      { 
        "description": "Hier die Einleitung (max 100 Zeichen)", 
        "long_description": "Hier die lange, professionelle Beschreibung mit ### Überschriften",
        "stars": "4",
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