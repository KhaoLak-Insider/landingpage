import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    // Hier rufen wir die Liste der verfügbaren Modelle ab
    const models = await genAI.listModels();
    
    // Wir senden die Liste direkt als Antwort an den Browser
    return NextResponse.json({ debug_models: models }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}