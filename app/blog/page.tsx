import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { supabase } from "@/src/lib/supabase";
import { localizePath } from "@/src/lib/i18n-routing";
import type { Language } from "@/src/lib/i18n";

import { absoluteLocalizedUrl } from "@/src/lib/i18n-routing";

export async function generateMetadata(): Promise<Metadata> {
  const language = (await headers()).get("x-language") === "en" ? "en" : "de";
  const title = language === "en" ? "Khao Lak Travel Blog & Insider Guides" : "Khao Lak Reiseblog & Insider-Ratgeber";
  const description = language === "en"
    ? "Travel guides, beach tips, excursions and practical advice for your Khao Lak holiday."
    : "Reiseberichte, Strandtipps, Ausflüge und praktische Ratgeber für deinen Khao-Lak-Urlaub.";
  const canonical = absoluteLocalizedUrl("/blog", language);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        de: absoluteLocalizedUrl("/blog", "de"),
        en: absoluteLocalizedUrl("/blog", "en"),
        "x-default": absoluteLocalizedUrl("/blog", "de"),
      },
    },
    openGraph: { title, description, url: canonical, type: "website" },
  };
}

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
  const language: Language = resolvedParams.lng === "en" ? "en" : "de";
  const href = (path: string) => localizePath(path, language);
  const value = (post: Record<string, unknown>, field: "title" | "excerpt" | "content" | "category") => {
    const primaryKey = language === "en" ? `${field}_en` : field;
    const fallbackKey = language === "en" ? field : `${field}_en`;
    const primary = post[primaryKey];
    const fallback = post[fallbackKey];
    return (typeof primary === "string" && primary.trim()) ||
      (typeof fallback === "string" && fallback.trim()) || "";
  };
  const copy = language === "en"
    ? {
        all: "All posts", back: "Back", next: "Next", guide: "Khao Lak Insider Guide",
        heading: "Plan your perfect trip to Khao Lak", intro: "Honest reports, hand-picked hotel recommendations and routes away from the crowds — researched locally.",
        highlight: "Featured", more: "More insider stories", page: "Page", minutes: "min read", details: "View details",
        deal: "Insider deal", dealTitle: "Ready for Thailand? The best hotel deals", dealText: "Compare accommodation and find flexible offers for your stay in Khao Lak.", hotels: "Find hotels in Khao Lak",
      }
    : {
        all: "Alle Beiträge", back: "Zurück", next: "Weiter", guide: "Khao Lak Insider Guide",
        heading: "Plane deine perfekte Reise nach Khao Lak", intro: "Ehrliche Berichte, handverlesene Hotelempfehlungen und Routen abseits der Massen – direkt vor Ort recherchiert.",
        highlight: "Aktuelles Highlight", more: "Weitere Insider-Berichte", page: "Seite", minutes: "Min. Lesezeit", details: "Details ansehen",
        deal: "Insider-Deal", dealTitle: "Bereit für Thailand? Die besten Hotel-Angebote", dealText: "Vergleiche Unterkünfte und finde flexible Angebote für deinen Aufenthalt in Khao Lak.", hotels: "Hotels in Khao Lak finden",
      };
  const categoryLabel = (name: string) => {
    if (language === "de") return name;
    return ({
      "Alle Beiträge": "All posts",
      "Strände": "Beaches",
      "Ausflüge": "Excursions",
      "Essen & Trinken": "Food & drink",
      "Unterkünfte": "Accommodation",
      "Reiseplanung": "Trip planning",
      "Geheimtipps": "Insider tips",
    } as Record<string, string>)[name] || name;
  };
  
  const categoryParam = resolvedParams.category;
  const activeCategory = typeof categoryParam === "string" ? categoryParam : "Alle Beiträge";
  
  const pageParam = resolvedParams.page;
  const currentPage = typeof pageParam === "string" ? Math.max(1, parseInt(pageParam) || 1) : 1;

  // Change this value to 3 or 6 for testing. Set back to 9 for production.
  const ITEMS_PER_PAGE = 9; 

  let countQuery = supabase
    .from("blog_posts")
    .select("*", { count: "exact", head: true });

  if (activeCategory !== "Alle Beiträge") {
    countQuery = countQuery.eq("category", activeCategory);
  }
  const { count } = await countQuery;
  const totalItems = count || 0;

  let from = 0;
  let to = ITEMS_PER_PAGE - 1;

  if (activeCategory === "Alle Beiträge") {
    if (currentPage === 1) {
      from = 0;
      to = ITEMS_PER_PAGE; 
    } else {
      from = (currentPage - 1) * ITEMS_PER_PAGE + 1;
      to = currentPage * ITEMS_PER_PAGE;
    }
  } else {
    from = (currentPage - 1) * ITEMS_PER_PAGE;
    to = currentPage * ITEMS_PER_PAGE - 1;
  }

  let query = supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (activeCategory !== "Alle Beiträge") {
    query = query.eq("category", activeCategory);
  }
  const { data: posts } = await query;
  const safePosts = posts || [];

  const featuredPost = activeCategory === "Alle Beiträge" && currentPage === 1 && safePosts.length > 0 ? safePosts[0] : null;
  const displayPosts = featuredPost ? safePosts.slice(1) : safePosts;

  const totalPages = activeCategory === "Alle Beiträge"
    ? Math.ceil(Math.max(0, totalItems - 1) / ITEMS_PER_PAGE)
    : Math.ceil(totalItems / ITEMS_PER_PAGE);

  const createPageLink = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (activeCategory !== "Alle Beiträge") params.set("category", activeCategory);
    params.set("page", pageNumber.toString());
    return href(`/blog?${params.toString()}`);
  };

  // SX for the pagination bar stored in a reusable variable
  const paginationComponent = totalPages > 1 ? (
    <div className="flex items-center justify-center gap-2">
      {/* Back Button */}
      <Link
        href={createPageLink(currentPage - 1)}
        className={`flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold border bg-white transition-all ${
          currentPage === 1
            ? "pointer-events-none opacity-40 border-slate-100 text-slate-300"
            : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 hover:shadow-sm"
        }`}
      >
        ← {copy.back}
      </Link>

      {/* Page Numbers */}
      {Array.from({ length: totalPages }, (_, i) => {
        const pageNum = i + 1;
        const isCurrent = pageNum === currentPage;
        return (
          <Link
            key={pageNum}
            href={createPageLink(pageNum)}
            className={`flex items-center justify-center w-11 h-11 rounded-xl text-sm font-bold transition-all ${
              isCurrent
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-[1.02]"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:shadow-sm"
            }`}
          >
            {pageNum}
          </Link>
        );
      })}

      {/* Next Button */}
      <Link
        href={createPageLink(currentPage + 1)}
        className={`flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold border bg-white transition-all ${
          currentPage === totalPages
            ? "pointer-events-none opacity-40 border-slate-100 text-slate-300"
            : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 hover:shadow-sm"
        }`}
      >
        {copy.next} →
      </Link>
    </div>
  ) : null;

  return (
    <main className="min-h-screen bg-white text-[#10233f] font-sans selection:bg-[#0eb4bb] selection:text-white antialiased">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#10233f] py-20 text-white md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(14,180,187,.24),transparent_28%),radial-gradient(circle_at_18%_85%,rgba(85,215,209,.12),transparent_30%)] pointer-events-none" />
        <div className="relative mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#74e1dc]">
              <span className="h-2 w-2 rounded-full bg-[#55d7d1]" />
              {copy.guide}
            </div>
            <h1 className="mb-6 text-4xl font-extrabold leading-[1.08] tracking-[-0.035em] text-white md:text-6xl">
              {copy.heading.replace(" Khao Lak", "")} <span className="text-[#55d7d1]">Khao Lak</span>
            </h1>
            <p className="max-w-2xl text-base font-normal leading-8 text-white/72 md:text-lg">
              {copy.intro}
            </p>
          </div>
        </div>
      </section>

      {/* FILTER & CONTENT AREA */}
      <section className="mx-auto max-w-[1180px] px-4 pb-28 pt-6 sm:px-6 lg:px-10">
        
        {/* CATEGORY BAR */}
        <div className="sticky top-0 z-40 mb-10 border-b border-[#e7edf2] bg-white/95 pb-4 pt-4 backdrop-blur-xl">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth">
            {CATEGORIES.map((cat) => {
              const isActive = cat.name === activeCategory;
              return (
                <Link
                  key={cat.name}
                  href={href(cat.name === "Alle Beiträge" ? "/blog" : `/blog?category=${encodeURIComponent(cat.name)}`)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shrink-0 border ${
                    isActive
                      ? "border-[#10233f] bg-[#10233f] text-white shadow-sm"
                      : "border-[#e7edf2] bg-white text-[#526176] hover:border-[#0eb4bb]/50 hover:text-[#079ca5]"
                  }`}
                >
                  <span className={`transition-transform duration-200 ${isActive ? "text-[#55d7d1]" : "text-[#8491a3]"}`}>
                    {cat.icon}
                  </span>
                  <span>{categoryLabel(cat.name)}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* FEATURED POST */}
        {featuredPost && (
          <div className="mb-12">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#079ca5]">
              <span className="h-[2px] w-4 bg-[#0eb4bb]" /> {copy.highlight}
            </div>
            <Link href={href(`/blog/${featuredPost.slug}`)} className="group block">
              <article className="grid grid-cols-1 gap-0 overflow-hidden rounded-[14px] border border-[#e8edf2] bg-white shadow-[0_8px_24px_rgba(15,35,62,.035)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_16px_38px_rgba(15,35,62,.09)] lg:grid-cols-16">
                <div className="relative aspect-[16/10] lg:aspect-auto lg:col-span-7 bg-white flex items-center justify-start min-h-[350px] overflow-hidden">
                  {featuredPost.image_url ? (
                    <Image
                      src={featuredPost.image_url}
                      alt={value(featuredPost, "title")}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-contain object-left group-hover:scale-[1.01] transition-transform duration-500 ease-out relative z-10"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center">
                      <span className="text-5xl">🏝️</span>
                    </div>
                  )}
                  <span className="absolute bottom-6 left-6 bg-slate-900/75 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg shadow-sm border border-white/10 z-20">
                    {value(featuredPost, "category")}
                  </span>
                </div>
                
                <div className="p-8 lg:p-12 lg:pl-4 lg:col-span-9 flex flex-col justify-between bg-white">
                  <div className="space-y-4 max-w-xl">
                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                      <span>{new Date(featuredPost.created_at).toLocaleDateString("de-DE", { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>⏱️ {featuredPost.reading_time || 5} Min. Lesezeit</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#10233f] group-hover:text-[#079ca5] transition-colors duration-300 leading-tight tracking-tight">
                    {value(featuredPost, "title")}
                    </h2>
                    <p className="text-slate-500 text-base font-normal leading-relaxed line-clamp-4">
                    {value(featuredPost, "excerpt")}
                    </p>
                  </div>
                  <div className="pt-6 border-t border-slate-100 flex items-center text-sm font-bold text-[#079ca5] group-hover:text-[#067f86] max-w-xl">
                    <span>{language === "en" ? "Read article" : "Beitrag lesen"}</span>
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
            
            {/* TOP PAGINATION: Rendered above the grid on every page */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-4 border-b border-slate-200/60">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-slate-400">
                <span className="w-4 h-[2px] bg-slate-300" /> 
                {currentPage === 1 ? copy.more : `${copy.more} • ${copy.page} ${currentPage}`}
              </div>
              
              {/* Upper page selector */}
              {totalPages > 1 && (
                <div className="scale-90 origin-right">{paginationComponent}</div>
              )}
            </div>
            
            {/* The blog grid itself */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayPosts.map((post) => (
                <Link href={href(`/blog/${post.slug}`)} key={post.id} className="group block h-full">
                  <article className="flex h-full flex-col overflow-hidden rounded-[14px] border border-[#e8edf2] bg-white shadow-[0_8px_24px_rgba(15,35,62,.035)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#d9e4e9] group-hover:shadow-[0_16px_36px_rgba(15,35,62,.09)]">
                    <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                      {post.image_url ? (
                        <Image
                          src={post.image_url}
                          alt={value(post, "title")}
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
                        {value(post, "category")}
                      </span>
                    </div>

                    <div className="p-6 flex flex-col flex-grow justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-400">
                          <span>{new Date(post.created_at).toLocaleDateString(language === "en" ? "en-GB" : "de-DE", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          <span>•</span>
                          <span>⏱️ {post.reading_time || 4} {copy.minutes}</span>
                        </div>
                        <h3 className="text-xl font-bold text-[#10233f] group-hover:text-[#079ca5] transition-colors duration-200 line-clamp-2 leading-snug tracking-tight">
                          {value(post, "title")}
                        </h3>
                        <p className="text-slate-400 text-sm font-normal line-clamp-3 leading-relaxed">
                          {value(post, "excerpt")}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-50 text-xs font-bold text-slate-500">
                        <span className="text-slate-400 group-hover:text-slate-600 transition-colors">{copy.details}</span>
                        <span className="text-teal-500 transform group-hover:translate-x-1 transition-transform duration-200">→</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}

              {/* HIGH-CONVERTING AFFILIATE BANNER */}
              {currentPage === 1 && (
                <article className="relative flex min-h-[340px] h-full flex-col justify-between overflow-hidden rounded-[14px] border border-white/10 bg-[#10233f] p-8 text-white shadow-[0_12px_30px_rgba(16,35,63,.16)]">
                  <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
                  <div className="relative space-y-4">
                    <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md">
                      {copy.deal} 🏨
                    </span>
                    <h3 className="text-2xl font-bold tracking-tight leading-tight pt-2">
                      {copy.dealTitle}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {copy.dealText}
                    </p>
                  </div>
                  <a 
                    href="https://www.booking.com/index.html?aid=DEINE_AFFILIATE_ID" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="relative w-full bg-teal-500 hover:bg-teal-400 text-slate-950 text-center font-bold text-sm py-3.5 rounded-xl transition-all duration-300 block shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 active:scale-[0.99]"
                  >
                    {copy.hotels}
                  </a>
                </article>
              )}
            </div>

            {/* BOTTOM PAGINATION: Remains centered at the bottom of the page */}
            {totalPages > 1 && (
              <div className="mt-16 border-t border-slate-200/60 pt-8">
                {paginationComponent}
              </div>
            )}

          </div>
        )}

      </section>
    </main>
  );
}
