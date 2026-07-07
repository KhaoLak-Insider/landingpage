import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

const CATEGORIES = [
  { name: "Alle Beiträge", slug: "all", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>
  )},
  { name: "Strände", slug: "Strände", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M6.343 6.343l.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
  )},
  { name: "Ausflüge", slug: "Ausflüge", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
  )},
  { name: "Essen & Trinken", slug: "Essen & Trinken", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.168.477-4.5 1.253" /></svg>
  )},
  { name: "Unterkünfte", slug: "Unterkünfte", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0V11m0 5H9m2 0h2m-2-5a1 1 0 11-2 0 1 1 0 012 0zm5 5h1.5m-1.5-5h1.5m-1.5-5h1.5M9 7h1.5M9 11h1.5" /></svg>
  )},
  { name: "Reiseplanung", slug: "Reiseplanung", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  )},
  { name: "Geheimtipps", slug: "Geheimtipps", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
  )},
];

interface BlogPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedParams = await searchParams;
  const categoryParam = resolvedParams.category;
  const activeCategory = typeof categoryParam === "string" ? categoryParam : "Alle Beiträge";

  let query = supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (activeCategory !== "Alle Beiträge") {
    query = query.eq("category", activeCategory);
  }

  const { data: posts } = await query;

  const safePosts = posts || [];
  const featuredPost = activeCategory === "Alle Beiträge" && safePosts.length > 0 ? safePosts[0] : null;
  const displayPosts = featuredPost ? safePosts.slice(1) : safePosts;

  return (
    <main className="min-h-screen bg-[#F7F9FA] text-slate-900 font-sans selection:bg-teal-500 selection:text-white antialiased">
      
      {/* HERO SECTION */}
      <section className="relative bg-white pt-20 pb-16 overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
        
        <div className="container mx-auto px-4 max-w-7xl relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full mb-6 border border-teal-100/60">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              Khao Lak Insider Guide
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Plane deine perfekte Reise nach <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Khao Lak</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 font-normal leading-relaxed max-w-2xl">
              Ehrliche Berichte, handverlesene Hotelempfehlungen und Routen abseits der Massen – direkt von Locals recherchiert.
            </p>
          </div>
        </div>
      </section>

      {/* FILTER & CONTENT AREA */}
      <section className="container mx-auto px-4 max-w-7xl mt-10 pb-32">
        
        {/* CATEGORY BAR */}
        <div className="sticky top-0 z-40 bg-[#F7F9FA]/90 backdrop-blur-md pt-2 pb-6 border-b border-slate-200/60 mb-12">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth">
            {CATEGORIES.map((cat) => {
              const isActive = cat.name === activeCategory;
              return (
                <Link
                  key={cat.name}
                  href={cat.name === "Alle Beiträge" ? "/blog" : `/blog?category=${encodeURIComponent(cat.name)}`}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shrink-0 border ${
                    isActive
                      ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10 scale-[1.01]"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:shadow-sm"
                  }`}
                >
                  <span className={`transition-transform duration-200 ${isActive ? "text-teal-400" : "text-slate-400 group-hover:text-slate-600"}`}>
                    {cat.icon}
                  </span>
                  <span>{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* FEATURED POST */}
        {featuredPost && (
          <div className="mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-teal-600 mb-4">
              <span className="w-4 h-[2px] bg-teal-500" /> Aktuelles Highlight
            </div>
            <Link href={`/blog/${featuredPost.slug}`} className="group block">
              <article className="bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-sm group-hover:shadow-xl group-hover:border-slate-300/80 transition-all duration-500 grid grid-cols-1 lg:grid-cols-12 gap-0">
                
                {/* Hier ist der exklusive Blur-Effekt für das obere Bild eingebaut */}
                <div className="relative aspect-[16/10] lg:aspect-auto lg:col-span-7 bg-slate-900 flex items-center justify-center min-h-[350px] overflow-hidden">
                  {featuredPost.image_url ? (
                    <>
                      {/* Weichgezeichneter Hintergrund füllt eventuelle Freiräume aus */}
                      <Image
                        src={featuredPost.image_url}
                        alt=""
                        fill
                        className="object-cover blur-xl opacity-50 scale-110 pointer-events-none"
                      />
                      {/* Scharfes Bild im object-contain Modus davor gelagert */}
                      <Image
                        src={featuredPost.image_url}
                        alt={featuredPost.title}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-contain group-hover:scale-[1.02] transition-transform duration-500 ease-out relative z-10"
                      />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center">
                      <span className="text-5xl">🏝️</span>
                    </div>
                  )}
                  <span className="absolute bottom-6 left-6 bg-slate-900/75 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg shadow-sm border border-white/10 z-20">
                    {featuredPost.category}
                  </span>
                </div>
                
                <div className="p-8 lg:p-12 lg:col-span-5 flex flex-col justify-between bg-white">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                      <span>{new Date(featuredPost.created_at).toLocaleDateString("de-DE", { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>⏱️ {featuredPost.reading_time || 5} Min. Lesezeit</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors duration-300 leading-tight tracking-tight">
                      {featuredPost.title}
                    </h2>
                    <p className="text-slate-500 text-base font-normal leading-relaxed line-clamp-4">
                      {featuredPost.excerpt}
                    </p>
                  </div>
                  <div className="pt-6 border-t border-slate-100 flex items-center text-sm font-bold text-teal-600 group-hover:text-teal-700">
                    <span>Beitrag lesen</span>
                    <span className="transform group-hover:translate-x-1.5 transition-transform duration-300 ml-2">→</span>
                  </div>
                </div>
              </article>
            </Link>
          </div>
        )}

        {/* MAIN GRID CONTENT */}
        {displayPosts.length === 0 && !featuredPost ? (
          <div className="bg-white rounded-3xl border border-slate-200/60 p-20 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl border border-slate-100">🏝️</div>
            <h3 className="text-xl font-bold text-slate-900">Hier wird gerade recherchiert</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
              In dieser Kategorie bereiten wir aktuell neue Insider-Berichte für dich vor. Schau bald wieder vorbei!
            </p>
          </div>
        ) : (
          <div>
            {featuredPost && (
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-slate-400 mb-6">
                <span className="w-4 h-[2px] bg-slate-300" /> Weitere Insider-Berichte
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayPosts.map((post) => (
                <Link href={`/blog/${post.slug}`} key={post.id} className="group block h-full">
                  <article className="bg-white rounded-2xl overflow-hidden border border-slate-200/50 shadow-sm group-hover:shadow-xl group-hover:border-slate-300/70 transition-all duration-300 flex flex-col h-full bg-white">
                    
                    {/* Unverändert: Die kleinen Karten bleiben im vollflächigen, perfekten aspect-[16/10] Modul */}
                    <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                      {post.image_url ? (
                        <Image
                          src={post.image_url}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center">
                          <span className="text-3xl">🏝️</span>
                        </div>
                      )}
                      <span className="absolute bottom-4 left-4 bg-slate-900/75 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md shadow-sm border border-white/10">
                        {post.category}
                      </span>
                    </div>

                    {/* Inhalt */}
                    <div className="p-6 flex flex-col flex-grow justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-400">
                          <span>{new Date(post.created_at).toLocaleDateString("de-DE", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          <span>•</span>
                          <span>⏱️ {post.reading_time || 4} Min.</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors duration-200 line-clamp-2 leading-snug tracking-tight">
                          {post.title}
                        </h3>
                        <p className="text-slate-400 text-sm font-normal line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-50 text-xs font-bold text-slate-500">
                        <span className="text-slate-400 group-hover:text-slate-600 transition-colors">Details ansehen</span>
                        <span className="text-teal-500 transform group-hover:translate-x-1 transition-transform duration-200">→</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}

              {/* HIGH-CONVERTING AFFILIATE BANNER */}
              <article className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl overflow-hidden shadow-lg p-8 flex flex-col justify-between text-white border border-slate-800 h-full relative min-h-[340px]">
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
                <div className="relative space-y-4">
                  <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md">
                    Insider-Deal 🏨
                  </span>
                  <h3 className="text-2xl font-bold tracking-tight leading-tight pt-2">
                    Bereit für Thailand? Die besten Hotel-Angebote
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Wir vergleichen täglich die Preise auf den größten Plattformen. Sichere dir die besten Konditionen für deinen Aufenthalt in Khao Lak mit kostenloser Stornierung.
                  </p>
                </div>
                
                <a 
                  href="https://www.booking.com/index.html?aid=DEINE_AFFILIATE_ID" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="relative w-full bg-teal-500 hover:bg-teal-400 text-slate-950 text-center font-bold text-sm py-3.5 rounded-xl transition-all duration-300 block shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 active:scale-[0.99]"
                >
                  Hotels in Khao Lak finden
                </a>
              </article>

            </div>
          </div>
        )}

      </section>
    </main>
  );
}