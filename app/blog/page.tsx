import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase"; // Nutzt jetzt deinen korrekten, lokalen Import-Pfad

const CATEGORIES = [
  { name: "Alle Beiträge", icon: "📱" },
  { name: "Strände", icon: "🏖️" },
  { name: "Ausflüge", icon: "⛰️" },
  { name: "Essen & Trinken", icon: "🍴" },
  { name: "Unterkünfte", icon: "🏨" },
  { name: "Reiseplanung", icon: "🧳" },
  { name: "Geheimtipps", icon: "⭐" },
];

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const resolvedParams = await searchParams;
  const activeCategory = resolvedParams.category || "Alle Beiträge";

  // Daten direkt über deine bestehende Supabase-Instanz abfragen
  let query = supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (activeCategory !== "Alle Beiträge") {
    query = query.eq("category", activeCategory);
  }

  const { data: posts } = await query;

  return (
    <main className="min-h-screen bg-slate-50/40 pb-24">
      {/* MINIMALISTISCHE HERO SECTION */}
      <section className="bg-white pt-16 pb-20 border-b border-slate-100">
        <div className="container mx-auto px-6 max-w-6xl text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-600 text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            Khao Lak Insider Blog
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight max-w-3xl mx-auto leading-tight">
            Tipps, Inspiration &<br />
            <span className="text-teal-500">Insider-Wissen</span> für deine Reise
          </h1>
          <p className="text-slate-500 text-base md:text-lg max-w-xl mx-auto font-medium leading-relaxed">
            Entdecke die schönsten Orte, besten Restaurants und geheime Strände direkt von der Redaktion.
          </p>
        </div>
      </section>

      {/* FILTER & GRID CONTENT */}
      <section className="container mx-auto px-6 max-w-6xl mt-12">
        
        {/* ELEGANTE FILTER-KACHELN */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 md:flex-wrap no-scrollbar scroll-smooth">
          {CATEGORIES.map((cat) => {
            const isActive = cat.name === activeCategory;
            return (
              <Link
                key={cat.name}
                href={cat.name === "Alle Beiträge" ? "/blog" : `/blog?category=${encodeURIComponent(cat.name)}`}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border shrink-0 ${
                  isActive
                    ? "bg-slate-950 text-white border-slate-950 shadow-sm scale-[1.02]"
                    : "bg-white text-slate-600 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </div>

        {/* BLOG POSTS GRID */}
        {!posts || posts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/60 p-16 text-center mt-12 shadow-sm max-w-md mx-auto">
            <span className="text-4xl">🏝️</span>
            <p className="text-slate-900 mt-4 font-bold text-lg">Hier ist es noch ruhig</p>
            <p className="text-slate-400 text-sm mt-1">In dieser Kategorie wurden noch keine Beiträge veröffentlicht.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full group"
              >
                {/* Bild-Bereich */}
                <div className="relative aspect-[16/10.5] bg-slate-100 overflow-hidden">
                  {post.image_url ? (
                    <Image
                      src={post.image_url}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center">
                      <span className="text-3xl">🏝️</span>
                    </div>
                  )}
                  <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-slate-900 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
                    {post.category}
                  </span>
                </div>

                {/* Content-Bereich */}
                <div className="p-6 flex flex-col flex-grow justify-between">
                  <div className="space-y-2.5">
                    <h2 className="text-xl font-black text-slate-900 group-hover:text-teal-500 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-slate-400 text-sm font-medium line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Footer der Karte */}
                  <div className="flex items-center justify-between pt-5 mt-6 border-t border-slate-100 text-xs font-bold">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span>⏱️</span>
                      <span>{post.reading_time} Min. Lesezeit</span>
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-teal-500 hover:text-teal-600 flex items-center gap-1 font-black group/link"
                    >
                      <span>Lesen</span>
                      <span className="inline-block transform group-hover/link:translate-x-0.5 transition-transform duration-200">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </section>
    </main>
  );
}