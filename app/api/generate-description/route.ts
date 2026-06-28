import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// WICHTIG: Nutze hier unbedingt deinen neuen API-Key, den du gerade erstellt hast
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Wir rufen die Liste der Modelle ab, um zu sehen, was verfügbar ist
    const response = await aiModel.listModels();
    
    return NextResponse.json({ available_models: response }, { status: 200 });
  } catch (error: any) {
    // Hier fangen wir den Fehler ab und senden ihn an den Browser
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}