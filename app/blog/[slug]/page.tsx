// app/blog/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js"; // Sicherer Server-Import
import ReactMarkdown from "react-markdown";
import BlogImageMagnifier from "@/src/components/BlogImageMagnifier";

// Da die Seite nun auf dem Server läuft, initialisieren wir einen sauberen Client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

interface PostPageProps {
  params: Promise<{ slug: string }>; // Next.js 15+ standardisiert params als Promise
}

// 1. DIESE FUNKTION FÜR SEO HINZUFÜGEN (SSG): 
// Teilt Next.js beim Build alle existierenden Slugs mit, damit sie sofort indexierbar sind.
export async function generateStaticParams() {
  const { data: posts } = await supabase.from("blog_posts").select("slug");
  if (!posts) return [];
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostDetailPage({ params }: PostPageProps) {
  // A. Params direkt auf dem Server auflösen
  const { slug } = await params;

  // B. Daten parallel abrufen (Post + User/Profile falls eingeloggt)
  // Hinweis: Da Sitemaps/Crawler anonym surfen, fangen wir die User-Abfrage sicher ab
  const [postResponse, userResponse] = await Promise.all([
    supabase.from("blog_posts").select("*").eq("slug", slug).single(),
    supabase.auth.getUser().catch(() => ({ data: { user: null } }))
  ]);

  const post = postResponse.data;
  const userData = userResponse?.data?.user;

  let userProfile = null;
  if (userData) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.id)
      .maybeSingle();
    userProfile = profileData;
  }

  // C. Fallback falls der Beitrag nicht existiert (wichtig für 404 SEO)
  if (!post) {
    return (
      <main style={{ padding: 40, textAlign: "center", minHeight: "100vh", background: "#F7F9FA" }}>
        Beitrag nicht gefunden.
      </main>
    );
  }

  // Erweiterte Komponenten-Konfiguration für ReactMarkdown
  const markdownComponents = {
    h3: ({ ...props }) => (
      <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4 tracking-tight" {...props} />
    ),
    h4: ({ ...props }) => (
      <h4 className="text-xl font-bold text-slate-900 mt-6 mb-3 tracking-tight" {...props} />
    ),
    p: ({ ...props }) => (
      <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-5 font-normal" {...props} />
    ),
    li: ({ ...props }) => (
      <li className="ml-6 list-disc text-slate-600 mb-2 leading-relaxed" {...props} />
    ),
    hr: ({ ...props }) => (
      <hr className="my-8 border-slate-200" {...props} />
    ),
    a: ({ href, children, ...props }: any) => {
      const url = href || "";
      const isSailyLink = url.includes("saily") || url.includes("xKbnW9ID");
      const isYesimLink = url.includes("yesim") || url.includes("CTkfUgOu");

      if (isSailyLink || isYesimLink) {
        return (
          <div className="my-6 block">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-teal-500/10 active:scale-[0.99] no-underline"
              {...props}
            >
              <span>🚀 Jetzt Datenpaket sichern bei {isYesimLink ? "Yesim" : "Saily"}</span>
              <span className="text-base">→</span>
            </a>
          </div>
        );
      }

      return (
        <a 
          href={url} 
          className="text-teal-600 hover:text-teal-700 font-bold underline transition-colors"
          {...props}
        >
          {children}
        </a>
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F9FA] text-slate-900 antialiased pb-32">
      
      {/* PREMIUM BREADCRUMB & BACK BUTTON */}
      <nav className="container mx-auto px-4 max-w-5xl pt-12 pb-6">
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors group"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
          Zurück zur Übersicht
        </Link>
      </nav>

      {/* ARTICLE HERO SECTION */}
      <header className="container mx-auto px-4 max-w-5xl mb-12">
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-12 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
            <div className="max-w-3xl">
              <span className="bg-teal-50 text-teal-700 border border-teal-100 text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-md">
                {post.category}
              </span>
              
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-950 tracking-tight leading-[1.15] mt-6 mb-6">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span>{new Date(post.created_at).toLocaleDateString("de-DE", { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <span>⏱️</span>
                  <span>{post.reading_time || 5} Minuten Lesezeit</span>
                </div>
                <span>•</span>
                <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">Verified Insider-Content</span>
              </div>
            </div>

            {/* Admin/Editor Button */}
            {(userProfile?.role === "admin" || userProfile?.role === "editor") && (
              <div className="shrink-0">
                <Link
                  href={`/editor/blog/${post.id}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 px-5 py-3 rounded-xl shadow-sm transition-all duration-200"
                >
                  ✏️ Beitrag bearbeiten
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* TWO-COLUMN LAYOUT */}
      <div className="container mx-auto px-4 max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* MAIN TEXT CONTENT */}
        <article className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/60 p-6 md:p-10 shadow-sm prose prose-slate max-w-none">
          
          {post.image_url && (
            /* Hinweis: Falls BlogImageMagnifier interne React-Hooks nutzt, muss diese Komponente 
               intern ein "use client" deklariert haben. Das ist völlig legitim! */
            <BlogImageMagnifier src={post.image_url} alt={post.title} />
          )}

          {/* Der formatierte Haupttext via react-markdown */}
          <div className="focus:outline-none">
            <ReactMarkdown components={markdownComponents}>
              {post.content}
            </ReactMarkdown>
          </div>
        </article>

        {/* HIGH-CONVERSION MARKETING SIDEBAR */}
        <aside className="lg:col-span-4 space-y-6 sticky top-24">
          
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-md relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
            
            <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
              Direkt-Links 📱
            </span>
            
            <h4 className="text-xl font-bold tracking-tight mt-3 mb-2">
              Keine Lust auf Roaming-Kosten?
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              Lade dir die eSIM-App einfach vor Abflug herunter und surfe sofort nach der Landung in Thailand.
            </p>

            <div className="space-y-3">
              <a 
                href="https://saily.tpk.lv/xKbnW9ID" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-white hover:bg-slate-100 text-slate-950 text-center font-bold text-xs py-3 rounded-xl transition-all block shadow-sm"
              >
                Tarife bei Saily ansehen
              </a>
              <a 
                href="https://yesim.tpk.lv/CTkfUgOu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 text-center font-bold text-xs py-3 rounded-xl transition-all block shadow-sm"
              >
                Tarife bei Yesim ansehen
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 text-center shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Transparenz-Hinweis</p>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Bei den Links on dieser Seite handelt es sich um Affiliate-Links. Wenn du darüber eine eSIM buchst, erhalten wir eine kleine Provision – für dich ändert sich am Preis absolut nichts! Danke für deine Unterstützung. ❤️
            </p>
          </div>

        </aside>

      </div>
    </main>
  );
}