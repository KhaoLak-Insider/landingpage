"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

// HELPER: Berechnet die Lesezeit basierend auf ca. 200 Wörtern pro Minute
function calculateReadingTime(text: string): number {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).length;
  const time = Math.ceil(words / 200);
  return time < 1 ? 1 : time;
}

// HELPER: Konvertiert Text für die saubere Rendering-Vorschau in strukturierte Blöcke
function convertTextToPreviewBlocks(text: string) {
  if (!text) return [];
  return text.split('\n').map(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('###')) {
      return { type: 'heading', content: trimmedLine.replace(/###\s*/, '') };
    }
    if (trimmedLine === '') return null;
    return { type: 'paragraph', content: trimmedLine };
  }).filter(block => block !== null);
}

export default function BlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const blogId = params.id; // Holt die ID aus der URL /blog/[id]

  // --- AUTH- & ROLLEN-STATES FÜR ABSOLUTEN ZUGRIFFSSCHUTZ ---
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const [blogCategories] = useState<string[]>(["Reiseplanung", "Strände", "Ausflüge", "Kulinarik", "Insider-Tipps"]);
  const [formData, setFormData] = useState({
    title: "",
    image_url: "",
    excerpt: "",
    content: "",
    category: "",
    reading_time: 1,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  // Authentifizierung, Rollenprüfung (aus der profiles-Tabelle) und Blogbeitrag beim Laden abrufen
  useEffect(() => {
    async function checkAuthAndFetchBlogPost() {
      try {
        // 1. Eingeloggten User holen
        const { data: { user: userData }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !userData) {
          router.push("/login");
          return; 
        }

        // 2. Rolle aus der PROFILES Tabelle laden
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userData.id)
          .maybeSingle();

        // 3. Rollenprüfung: Nur 'admin' oder 'editor' dürfen rein
        if (profileData?.role !== "admin" && profileData?.role !== "editor") {
          alert("Zugriff verweigert: Du hast keine Admin- oder Editor-Rechte.");
          router.push("/"); // Schickt unbefugte Nutzer auf die Startseite
          return;
        }
        
        // 4. Wenn Rolle passt, Zugriff erlauben
        setHasAccess(true);
        setCheckingAuth(false);

        // 5. Erst jetzt die eigentlichen Blog-Daten aus der DB laden
        if (!blogId) return;
        setLoading(true);
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("id", blogId)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            title: data.title || "",
            image_url: data.image_url || "",
            excerpt: data.excerpt || "",
            content: data.content || "",
            category: data.category || "",
            reading_time: data.reading_time || 1,
          });
        }
      } catch (e: any) {
        console.error("Fehler beim Initialisieren:", e);
        alert("Fehler beim Laden des Blogbeitrags: " + e.message);
        router.push("/editor/blog"); 
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndFetchBlogPost();
  }, [blogId, router]);

  // KI Optimierung / Umschreiben des bestehenden Beitrags
  const generateBlogContent = async () => {
    if (!formData.title) return alert("Bitte gib zuerst einen Titel ein!");
    setSaving(true);
    try {
      const res = await fetch("/api/generate-blog", {
        method: "POST",
        body: JSON.stringify({ 
          title: formData.title, 
          additionalInstructions: aiPrompt + " (Überarbeite basierend auf dem aktuellen Text: " + formData.content + ")"
        }),
      });
      const data = await res.json();

      if (data.error) {
        alert("API Fehler: " + data.error);
        return;
      }

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
      alert("Fehler bei der KI-Generierung");
    } finally {
      setSaving(false);
    }
  };

  // Änderungen in Supabase speichern (UPDATE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const { error } = await supabase
      .from("blog_posts")
      .update({
        title: formData.title,
        image_url: formData.image_url,
        slug: slug,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        reading_time: formData.reading_time,
      })
      .eq("id", blogId);

    setSaving(false);

    if (error) {
      alert("Fehler beim Aktualisieren: " + error.message);
    } else {
      alert("Blogbeitrag erfolgreich aktualisiert!");
    }
  };

  // --- SPERRIEGEL: BLOCKIERT JEGLICHES RENDERING FÜR NICHT-AUTORISIERTE CLIENTS ODER BOTS ---
  if (checkingAuth || !hasAccess) {
    return null; 
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-slate-50 min-h-screen">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Blogbeitrag bearbeiten</h1>
          <p className="text-slate-500">Bearbeite oder optimiere deinen bestehenden SEO-Artikel.</p>
        </div>
        <button 
          type="button" 
          onClick={() => router.back()}
          className="text-sm font-bold text-slate-500 hover:text-slate-800 bg-white border px-4 py-2 rounded-xl shadow-sm"
        >
          Zurück
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl border">
          <p className="text-slate-500 font-medium">Inhalt wird geladen...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8 pb-24">
          {/* BASIS INFO */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Artikel-Basis</h2>
            <input 
              className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" 
              placeholder="Titel des Blogbeitrags" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
            />
            
            <input 
              className="w-full p-3 border rounded-xl text-sm" 
              placeholder="Bild URL"
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
            />

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
            <h2 className="text-lg font-bold text-teal-800">KI Content-Optimierer</h2>
            <input 
              className="w-full p-3 border rounded-xl bg-white text-sm" 
              placeholder="Anweisungen zum Umschreiben (z.B. Füge einen Abschnitt über die besten Restaurants hinzu)..." 
              value={aiPrompt} 
              onChange={(e) => setAiPrompt(e.target.value)} 
            />
            <button 
              type="button" 
              onClick={generateBlogContent} 
              className="bg-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-600 transition-all text-sm"
            >
              {saving ? "KI optimiert Text..." : "Text durch KI erweitern / umschreiben"}
            </button>
          </section>

          {/* TEXTE */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Inhalt</h2>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Auszug / Kurzbeschreibung (excerpt)</label>
              <textarea 
                className="w-full p-4 border rounded-xl text-sm" 
                rows={2}
                value={formData.excerpt} 
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Haupttext (content - Nutze ### für Zwischenüberschriften)</label>
              <textarea 
                className="w-full p-4 border rounded-xl text-sm leading-relaxed" 
                rows={14} 
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
                disabled={saving} 
                type="submit" 
                className="bg-teal-500 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:bg-teal-600 transition-all shadow-xl shadow-teal-500/20"
              >
                {saving ? "Wird aktualisiert..." : "Änderungen speichern"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* VORSCHAU MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl relative shadow-2xl p-8">
            <button type="button" onClick={() => setShowPreview(false)} className="absolute top-4 right-4 z-50 p-2 bg-slate-100 rounded-full hover:bg-slate-200">✕</button>
            
            {formData.image_url && (
              <div className="w-full h-[250px] rounded-2xl overflow-hidden mb-6">
                <img src={formData.image_url} className="w-full h-full object-cover" alt="Preview" />
              </div>
            )}
            
            <div className="flex gap-4 items-center mb-2">
              <span className="bg-teal-500 text-white text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wider">{formData.category || "Allgemein"}</span>
              <span className="text-xs text-slate-400 font-bold">{formData.reading_time} Min. Lesezeit</span>
            </div>

            <h1 className="text-4xl font-black mb-4 text-slate-900">{formData.title || "Titel..."}</h1>
            <p className="text-lg text-slate-500 italic mb-6 border-l-4 pl-4 border-teal-500">{formData.excerpt || "Kurzbeschreibung..."}</p>
            
            <div className="prose text-slate-700 leading-relaxed border-t pt-4">
              {convertTextToPreviewBlocks(formData.content).map((block: any, i: number) => (
                block.type === 'heading' 
                  ? <h3 key={i} className="text-2xl font-bold mt-6 mb-3 text-slate-800">{block.content}</h3>
                  : <p key={i} className="mb-4">{block.content}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}