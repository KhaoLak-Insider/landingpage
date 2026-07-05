import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { title, additionalInstructions } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Titel fehlt" }, { status: 400 });
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Du bist ein erfahrener SEO-Copywriter und Content-Writer für den Reise-Blog 'Khao Lak Insider'.
      Deine Aufgabe ist es, einen hochgradig optimierten, nützlichen und packenden Blogbeitrag für folgenden Titel zu schreiben: "${title}".
      Ziel ist es, die Suchintention (User Intent) umfassender und detaillierter zu bedienen als die Konkurrenz, um auf Platz 1 bei Google zu ranken.

      PROMPT-RICHTLINIEN FÜR DEN INHALT:
      - TONALITÄT: Schreibe einladend, authentisch und aus der Perspektive eines lokalen Insiders (wie ein guter Freund vor Ort). Vermeide leere Floskeln.
      - ZUSÄTZLICHE ANWEISUNGEN: Berücksichtige unbedingt diese spezifischen Wünsche für den Artikel: ${additionalInstructions || "Keine zusätzlichen Anweisungen."}

      TEXTLÄNGE & ABSCHNITTS-STRUKTUR FÜR 'content':
      Der Text in 'content' muss ausführlich sein und Zwischenüberschriften enthalten. Nutze zwingend "### " für Überschriften im Fließtext. Nutze keine anderen Markdown-Überschriften wie # oder ##.

      AUFGABEN-ÜBERSICHT FÜR DAS JSON:
      1. Auszug (excerpt): Eine kurze, spannende Zusammenfassung (max. 2 Sätze), die in der Blog-Übersicht neugierig auf den Artikel macht.
      2. Kategorie (category): Wähle die exakt passende Blog-Kategorie aus (z.B. "Reiseplanung", "Strände", "Ausflüge", "Kulinarik", "Insider-Tipps").
      3. Haupttext (content): Der vollständige SEO-Haupttext mit passenden Zwischenüberschriften (nutze dafür "### ").

      Antworte strikt im JSON-Format ohne erklärenden Text oder zusätzliche Zeichen außerhalb des Objekts.
      WICHTIG: Erzeuge keine echten Zeilenumbrüche innerhalb der JSON-Werte, sondern nutze '\\n' für Absätze!

      { 
        "excerpt": "Hier die kurze, spannende Zusammenfassung für die Vorschau.", 
        "category": "Hier die passende Kategorie",
        "content": "Hier der vollständige, ausführliche Blog-Inhalt mit eingebauten ### Überschriften"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      // Normaler Parse-Versuch
      return NextResponse.json(JSON.parse(text));
    } catch (parseError) {
      // FALLBACK: Falls Gemini rohe Zeilenumbrüche geliefert hat, maskieren wir sie vor dem Parsen
      console.warn("JSON-Parsing fehlgeschlagen, starte Bereinigung von Control Characters...");
      
      // Ersetzt rohe Zeilenumbrüche, die sich innerhalb des Textes verstecken
      const cleanedText = text
        .replace(/\n/g, "\\n") // Tauscht echte Umbrüche gegen Text-\n
        .replace(/\\n\s*"/g, '"') // Korrigiert fälschlicherweise maskierte Anführungszeichen am Ende
        .replace(/"\s*\\n/g, '"') // Korrigiert den Start von Properties
        .replace(/\{\s*\\n/g, '{') // Fix für den Objektstart
        .replace(/\\n\s*\}/g, '}') // Fix für das Objektende
        .replace(/,\\n\s*"/g, ',"'); // Fix für Kommas zwischen Feldern

      return NextResponse.json(JSON.parse(cleanedText));
    }
  } catch (error: any) {
    console.error("API Error bei Blog-Generierung:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}