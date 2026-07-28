"use client";

import { useRef, useState } from "react";
import { Check, Copy, ImagePlus, Languages, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/src/lib/supabase";
import { translateTexts } from "@/src/lib/admin/deepl";
import { uploadBlogImage } from "@/src/lib/r2-images";

// HELPER: Berechnet die Lesezeit basierend auf ca. 200 Wörtern pro Minute
function calculateReadingTime(text: string): number {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).length;
  const time = Math.ceil(words / 200);
  return time < 1 ? 1 : time;
}

type PreviewBlock =
  | { type: "heading-1" | "heading-2" | "heading-3"; content: string }
  | { type: "paragraph"; content: string };

function normalizeMarkdownText(text: string) {
  const lines = text.split("\n");
  const normalized: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const trimmed = rawLine.trim();

    const match = trimmed.match(/^(#{1,3})\s*(.*?)\s*(#{1,3})?$/);
    if (match && trimmed.startsWith("#")) {
      const [, hashes, content] = match;
      normalized.push(`${hashes} ${content.trim()}`);
    } else {
      normalized.push(rawLine);
    }
  }

  return normalized.join("\n");
}

// HELPER: Konvertiert Text für die saubere Rendering-Vorschau in strukturierte Blöcke
function convertTextToPreviewBlocks(text: string) {
  if (!text) return [];
  return normalizeMarkdownText(text)
    .split("\n")
    .map((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith("###")) {
        return {
          type: "heading-3",
          content: trimmedLine.replace(/^###\s*/, ""),
        } as PreviewBlock;
      }
      if (trimmedLine.startsWith("##")) {
        return {
          type: "heading-2",
          content: trimmedLine.replace(/^##\s*/, ""),
        } as PreviewBlock;
      }
      if (trimmedLine.startsWith("#")) {
        return {
          type: "heading-1",
          content: trimmedLine.replace(/^#\s*/, ""),
        } as PreviewBlock;
      }
      if (trimmedLine === "") return null;
      return { type: "paragraph", content: trimmedLine } as PreviewBlock;
    })
    .filter((block): block is PreviewBlock => block !== null);
}

export default function BlogEditorPage() {
  const [blogCategories] = useState<string[]>(["Reiseplanung", "Strände", "Ausflüge", "Kulinarik", "Insider-Tipps"]);
  const [formData, setFormData] = useState({
    title: "",
    title_en: "",
    image_url: "",
    excerpt: "",
    excerpt_en: "",
    content: "",
    content_en: "",
    category: "",
    category_en: "",
    reading_time: 1,
  });
  const [loading, setLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [imagePromptCopied, setImagePromptCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const contentInputRef = useRef<HTMLTextAreaElement | null>(null);

  const imageStylePrompt = (title: string, category: string) => {
    const topic = (title || "Khao Lak Guide").trim();
    const categoryText = category.trim() || "Reiseguide";
    return `Erstelle ein hochwertiges YouTube/Blog-Hero-Thumbnail im Stil der bereitgestellten Referenzbilder für einen deutschsprachigen Khao-Lak-Reiseblog.

Motiv:
- Thema: ${topic}
- Kontext: ${categoryText}
- Szene mit tropischer Thailand-Atmosphäre, warmem Sonnenuntergang oder klarer Tagesstimmung, fotorealistisch, dynamisch, sehr hochwertig
- starke visuelle Hierarchie, große Titel, prägnante Unterzeile, kleine Info-Boxen oder Icon-Module wie in den Referenzen

Stil:
- kräftige Blautöne, Türkis, Gold, Weiß, Orange
- kontrastreiche, saubere Typografie mit großer Headline oben
- gelbe Pinselstrich-Balken für Untertitel wie in den Referenzen
- moderne Infografik-Optik mit mehreren kleinen Stichpunkten/Icons
- cinematic, polished, marketable, editorial travel thumbnail

Bildaufbau:
- 16:9 Querformat
- große Headline oben
- mittlere Unterzeile auf gelbem Brush-Stroke
- links oder unten kompakte Info-Elemente mit Icons
- rechts oder im Vordergrund ein starkes Hauptmotiv
- insgesamt freundlich, klar, klickstark und nicht überladen

Text im Bild:
- Haupttitel in Großbuchstaben, sehr gut lesbar
- Unterzeile in deutscher Sprache
- keine Rechtschreibfehler, kein Zufallstext, keine Wasserzeichen

Do not:
- kein minimalistisches Design
- keine dunkle, triste Stimmung
- keine unscharfen Personen
- keine verzerrten Hände oder Gesichter
- keine generischen Stockfoto-Anmutungen`;
  };

  const insertContentSnippet = (snippet: string) => {
    const textarea = contentInputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? formData.content.length;
    const end = textarea.selectionEnd ?? formData.content.length;
    const nextValue =
      formData.content.slice(0, start) + snippet + formData.content.slice(end);

    setFormData((current) => ({ ...current, content: nextValue }));

    requestAnimationFrame(() => {
      const nextCursor = start + snippet.length;
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const generateImagePrompt = async () => {
    const prompt = imageStylePrompt(formData.title, formData.category);
    setImagePrompt(prompt);
    setImagePromptCopied(false);
    try {
      await navigator.clipboard.writeText(prompt);
      setImagePromptCopied(true);
      window.setTimeout(() => setImagePromptCopied(false), 1800);
    } catch {
      // Clipboard kann je nach Browser blockiert sein; Prompt bleibt sichtbar.
    }
  };

  const generateAndUseBlogImage = async () => {
    const prompt = imagePrompt || imageStylePrompt(formData.title, formData.category);
    setImagePrompt(prompt);
    setIsGeneratingImage(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) {
        alert("Bitte zuerst anmelden.");
        return;
      }

      const response = await fetch("/api/admin/generate-blog-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          blogSlug:
            formData.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, ""),
          title: formData.title,
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Bild konnte nicht generiert werden.");
      }

      setFormData((current) => ({ ...current, image_url: data.url || "" }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Bild konnte nicht generiert werden.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // KI Blogbeitrag generieren
  const generateBlogContent = async () => {
    if (!formData.title) return alert("Bitte gib zuerst einen Titel ein, damit die KI weiß, worum es geht!");
    setLoading(true);
    try {
      const res = await fetch("/api/generate-blog", {
        method: "POST",
        body: JSON.stringify({ 
          title: formData.title, 
          additionalInstructions: aiPrompt 
        }),
      });
      const data = await res.json();
      console.log("RAW AI RESPONSE DATA:", data);

      if (data.error) {
        alert("API Fehler: " + data.error);
        return;
      }

      // Flexibles Mapping fängt alle Keys (auch von älteren Versionen) sauber ab
      const excerpt = data.excerpt || data.description || formData.excerpt;
const content = data.content || data.long_description || formData.content;
const category = data.category || formData.category;
      
      setFormData(prev => ({
        ...prev,
        excerpt: excerpt,
        content: content,
        category: category,
        reading_time: calculateReadingTime(content || "")
      }));
    } catch (e) {
      console.error("Fehler im Frontend-Fetch:", e);
      alert("Fehler bei der KI-Generierung des Blogbeitrags");
    } finally {
      setLoading(false);
    }
  };

  const handleBlogImageUpload = async (file: File) => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) {
      alert("Bitte zuerst einen Titel eingeben, damit das Bild sauber abgelegt werden kann.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const url = await uploadBlogImage(file, slug);
      setFormData((current) => ({ ...current, image_url: url }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Der Bild-Upload ist fehlgeschlagen.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const translateToEnglish = async () => {
    const entries = [
      ["title_en", formData.title],
      ["excerpt_en", formData.excerpt],
      ["content_en", formData.content],
      ["category_en", formData.category],
    ] as const;
    const availableEntries = entries.filter(([, value]) => value.trim());

    if (availableEntries.length === 0) {
      alert("Bitte zuerst deutsche Texte oder eine Kategorie eingeben.");
      return;
    }

    setIsTranslating(true);
    try {
      const translations = await translateTexts(
        availableEntries.map(([, value]) => value),
        { sourceLang: "DE", targetLang: "EN-GB" },
      );

      setFormData((current) => {
        const next = { ...current };
        availableEntries.forEach(([field], index) => {
          next[field] = translations[index];
        });
        return next;
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Die Übersetzung ist fehlgeschlagen.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const { error } = await supabase.from("blog_posts").insert([{
      title: formData.title,
      title_en: formData.title_en,
      image_url: formData.image_url,
      slug: slug,
      excerpt: formData.excerpt,
      excerpt_en: formData.excerpt_en,
      content: formData.content,
      content_en: formData.content_en,
      category: formData.category,
      category_en: formData.category_en,
      reading_time: formData.reading_time,
    }]);

    setLoading(false);

    if (error) {
      alert("Fehler beim Speichern in blog_posts: " + error.message);
    } else {
      alert("Blogbeitrag erfolgreich veröffentlicht!");
      setFormData({
        title: "",
        title_en: "",
        image_url: "",
        excerpt: "",
        excerpt_en: "",
        content: "",
        content_en: "",
        category: "",
        category_en: "",
        reading_time: 1,
      });
      setAiPrompt("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Neuen Blogbeitrag schreiben</h1>
        <p className="text-slate-500">Erstelle einen SEO-optimierten Artikel für die Tabelle blog_posts.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 pb-24">
        {/* BASIS INFO */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-2">
            <h2 className="text-lg font-bold text-slate-800">Artikel-Basis</h2>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={isUploadingImage}
              className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-bold text-teal-700 hover:bg-teal-100 disabled:opacity-60"
            >
              {isUploadingImage ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
              {isUploadingImage ? "Bild wird in R2 geladen …" : "Bild in R2 hochladen"}
            </button>
          </div>
          <input 
            className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" 
            placeholder="Titel des Blogbeitrags (z.B. Internet in Thailand: Der ultimative eSIM Guide)" 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})} 
          />
          
          {/* Temporär als Textfeld, um Upload-Abstürze auszuschließen */}
          <input 
            className="w-full p-3 border rounded-xl text-sm" 
            placeholder="Bild URL (oder lade es später hoch)"
            value={formData.image_url}
            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
          />
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void handleBlogImageUpload(file);
                }
                e.currentTarget.value = "";
              }}
            />
            <span className="text-xs text-slate-400">
              Nach dem Upload wird die URL automatisch ins Feld gesetzt.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Kategorie</label>
              <select 
                className="w-full p-3 border rounded-xl bg-white text-sm"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="">Wähle eine Kategorie...</option>
                {blogCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Lesezeit (Minuten)</label>
              <input 
                type="number"
                className="w-full p-3 border rounded-xl text-sm bg-slate-50 font-bold"
                value={formData.reading_time}
                readOnly
              />
            </div>
          </div>
        </section>

        {/* KI GENERATOR OPTION */}
        <section className="bg-teal-50 p-6 rounded-2xl border-2 border-teal-200 space-y-4">
          <h2 className="text-lg font-bold text-teal-800">KI Blog-Schreiber</h2>
          <input 
            className="w-full p-3 border rounded-xl bg-white text-sm" 
            placeholder="Optionale Anweisungen an die KI (z.B. Erwähne Holafly, Saily und Yesim, schreibe locker)..." 
            value={aiPrompt} 
            onChange={(e) => setAiPrompt(e.target.value)} 
          />
          <button 
            type="button" 
            onClick={generateBlogContent} 
            className="bg-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-600 transition-all text-sm"
          >
            {loading ? "KI schreibt Artikel..." : "Kompletten Blogbeitrag via KI generieren"}
          </button>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-600">Bildstil</span>
              <h2 className="mt-1 text-lg font-bold text-slate-800">Referenz-Prompt für einheitliche Hero-Bilder</h2>
            </div>
            <button
              type="button"
              onClick={() => void generateImagePrompt()}
              className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-bold text-teal-700 hover:bg-teal-100"
            >
              <Sparkles size={16} />
              Prompt generieren
            </button>
          </div>
          <p className="text-sm leading-7 text-slate-600">
            Dieser Prompt orientiert sich an deinem bestehenden Stil: starke Titelgrafik, tropische Szene, gelbe Brush-Stroke-Headline, blaue Info-Elemente und klickstarke Infografik-Optik.
          </p>
          <textarea
            readOnly
            value={imagePrompt || "Klicke auf „Prompt generieren“, um einen fertigen Bildprompt zu erhalten."}
            className="min-h-[240px] w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 outline-none"
          />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                {imagePromptCopied ? "Prompt in die Zwischenablage kopiert." : "Der Prompt ist sofort wiederverwendbar für alle Blogbilder."}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!imagePrompt) {
                      await generateImagePrompt();
                      return;
                    }
                    try {
                      await navigator.clipboard.writeText(imagePrompt);
                      setImagePromptCopied(true);
                      window.setTimeout(() => setImagePromptCopied(false), 1800);
                    } catch {
                      setImagePromptCopied(false);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  {imagePromptCopied ? <Check size={16} /> : <Copy size={16} />}
                  {imagePromptCopied ? "Kopiert" : "Prompt kopieren"}
                </button>
                <button
                  type="button"
                  onClick={() => void generateAndUseBlogImage()}
                  disabled={isGeneratingImage}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {isGeneratingImage ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                  {isGeneratingImage ? "Bild wird generiert..." : "Bild generieren"}
                </button>
              </div>
            </div>
          </section>

        {/* TEXTE */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-2">
            <h2 className="text-lg font-bold text-slate-800">Inhalt</h2>
            <button
              type="button"
              onClick={translateToEnglish}
              disabled={isTranslating}
              className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-bold text-teal-700 hover:bg-teal-100 disabled:opacity-60"
            >
              <Languages size={16} />
              {isTranslating ? "DeepL übersetzt …" : "DE → EN übersetzen"}
            </button>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Auszug / Kurzbeschreibung (excerpt)</label>
            <textarea 
              className="w-full p-4 border rounded-xl text-sm" 
              rows={2}
              placeholder="Keine Lust auf Warteschlangen am Flughafen? Hier ist der Vergleich..." 
              value={formData.excerpt} 
              onChange={(e) => setFormData({...formData, excerpt: e.target.value})} 
            />
          </div>
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <label className="block text-xs font-bold uppercase text-slate-400">Haupttext (content - Nutze ### für Zwischenüberschriften)</label>
              <button
                type="button"
                onClick={() =>
                  insertContentSnippet(
                    "\n| Spalte 1 | Spalte 2 | Spalte 3 |\n| --- | --- | --- |\n| Eintrag 1 | Eintrag 2 | Eintrag 3 |\n",
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
              >
                Tabelle einfügen
              </button>
            </div>
            <textarea 
              ref={contentInputRef}
              className="w-full p-4 border rounded-xl text-sm leading-relaxed" 
              rows={14} 
              placeholder="Wer das erste Mal nach Khao Lak reist..." 
              value={formData.content} 
              onChange={(e) => {
                const txt = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  content: txt,
                  reading_time: calculateReadingTime(txt)
                }));
              }} 
            />
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="border-b pb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-600">English version</span>
            <h2 className="mt-1 text-lg font-bold text-slate-800">Englische Inhalte</h2>
          </div>
          <input
            className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="English title"
            value={formData.title_en}
            onChange={(e) => setFormData({...formData, title_en: e.target.value})}
          />
          <input
            className="w-full p-3 border rounded-xl text-sm"
            placeholder="English category"
            value={formData.category_en}
            onChange={(e) => setFormData({...formData, category_en: e.target.value})}
          />
          <textarea
            className="w-full p-4 border rounded-xl text-sm"
            rows={3}
            placeholder="English excerpt"
            value={formData.excerpt_en}
            onChange={(e) => setFormData({...formData, excerpt_en: e.target.value})}
          />
          <textarea
            className="w-full p-4 border rounded-xl text-sm leading-relaxed"
            rows={14}
            placeholder="English article content (use ### for headings)"
            value={formData.content_en}
            onChange={(e) => setFormData({...formData, content_en: e.target.value})}
          />
        </section>

        {/* FLOATING ACTION BAR */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 shadow-lg z-50">
          <div className="max-w-4xl mx-auto flex justify-end gap-4">
            <button 
              type="button" 
              onClick={() => setShowPreview(true)} 
              className="bg-slate-100 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all"
            >
              Vorschau
            </button>
            <button 
              disabled={loading} 
              type="submit" 
              className="bg-teal-500 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:bg-teal-600 transition-all shadow-xl shadow-teal-500/20"
            >
              {loading ? "Wird gespeichert..." : "Artikel veröffentlichen"}
            </button>
          </div>
        </div>
      </form>

      {/* VORSCHAU MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl relative shadow-2xl p-8">
            <button type="button" onClick={() => setShowPreview(false)} className="absolute top-4 right-4 z-50 p-2 bg-slate-100 rounded-full hover:bg-slate-200">✕</button>
            
            {formData.image_url && (
              <div className="w-full h-[250px] rounded-2xl overflow-hidden mb-6">
                <img src={formData.image_url} alt={formData.title || "Blog-Vorschau"} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="flex gap-4 items-center mb-2">
              <span className="bg-teal-500 text-white text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wider">{formData.category || "Allgemein"}</span>
              <span className="text-xs text-slate-400 font-bold">{formData.reading_time} Min. Lesezeit</span>
            </div>

            <h1 className="text-4xl font-black mb-4 text-slate-900">{formData.title || "Titel..."}</h1>
            <p className="text-lg text-slate-500 italic mb-6 border-l-4 pl-4 border-teal-500">{formData.excerpt || "Kurzbeschreibung..."}</p>
            
            <div className="prose text-slate-700 leading-relaxed border-t pt-4">
              {convertTextToPreviewBlocks(formData.content).map((block, i: number) =>
                block.type === "heading-1" ? (
                  <h1 key={i} className="text-3xl font-black mt-8 mb-4 text-slate-900 tracking-tight">
                    {block.content}
                  </h1>
                ) : block.type === "heading-2" ? (
                  <h2 key={i} className="text-2xl font-bold mt-7 mb-3 text-slate-800">
                    {block.content}
                  </h2>
                ) : block.type === "heading-3" ? (
                  <h3 key={i} className="text-xl font-bold mt-6 mb-3 text-slate-800">
                    {block.content}
                  </h3>
                ) : (
                  <p key={i} className="mb-4">
                    {block.content}
                  </p>
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
