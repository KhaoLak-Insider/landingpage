import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialisierung mit dem API-Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { spotData } = await request.json();

    // Wir nutzen hier 'gemini-2.0-flash', da dieses Modell aktuell 
    // weitgehend verfügbar und für diesen Einsatzzweck optimiert ist.
    const model = genAI.getGenerativeModel({ model: "gemini-3.0-flash" });

    const prompt = `
      Du bist ein Reise-Experte für den 'Khao Lak Insider'. 
      Schreibe eine kurze Einleitung (max. 200 Zeichen) und eine ausführliche Beschreibung (mit ### Überschriften) 
      für den Ort: ${spotData.title}.
      Kategorie: ${spotData.category}.
      Features: ${JSON.stringify(spotData.features)}.
      
      Antworte strikt im JSON-Format: 
      { "description": "Kurze Einleitung", "long_description": "Lange Beschreibung" }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    // Fehlerbehandlung: Gibt den Fehler direkt an den Browser zurück, 
    // damit du im Netzwerk-Tab siehst, was genau passiert.
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}