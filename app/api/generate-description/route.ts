import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialisierung mit dem API-Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { spotData } = await request.json();

    // Wir nutzen hier den expliziten Modellnamen. 
    // Sollte dies wieder einen 404 werfen, ist dein Key in deinem Google-Account 
    // für dieses spezifische Modell nicht freigeschaltet.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    console.error("KI Fehler:", error); // Loggt den Fehler in den Vercel-Logs
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}