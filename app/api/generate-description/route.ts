import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { spotData } = await request.json();
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Du bist ein Reise-Experte für den 'Khao Lak Insider'. 
      Analysiere den Ort: ${spotData.title} (Kategorie: ${spotData.category}).
      
      1. Schreibe eine kurze Einleitung (max. 150 Zeichen).
      2. Schreibe eine ausführliche Beschreibung mit ### Überschriften.
      3. Recherchiere/Schätze die offizielle Hotel-Kategorie oder Sterne (0 bis 5). Wenn es kein Hotel ist, setze 0.
      4. Erstelle genau 6 nützliche Features für diesen Ort. Nutze für das Feld "icon" ausschließlich diese Namen, da sie in der Icon-Library existieren: 
         ['Sparkles', 'Wifi', 'Coffee', 'Car', 'Camera', 'Music', 'Map', 'Sun', 'Waves', 'Utensils', 'Mountain', 'Umbrella', 'Bike'].
      
      Antworte strikt im JSON-Format ohne erklärenden Text: 
      { 
        "description": "Kurze Einleitung", 
        "long_description": "Lange Beschreibung",
        "stars": "4",
        "features": [
          {"label": "Beispiel", "value": "Beispiel", "icon": "Sparkles"},
          {"label": "Beispiel", "value": "Beispiel", "icon": "Wifi"},
          {"label": "Beispiel", "value": "Beispiel", "icon": "Coffee"},
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