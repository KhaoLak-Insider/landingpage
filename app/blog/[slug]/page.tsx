// app/blog/[slug]/page.tsx
import Link from "next/link";
import Image from "next/image"; 
import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import type { ComponentProps } from "react";
import BlogImageMagnifier from "@/src/components/BlogImageMagnifier";
import { headers } from "next/headers";
import { absoluteLocalizedUrl, localizePath } from "@/src/lib/i18n-routing";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

// 1. DYNAMISCHE METADATEN FÜR GOOGLE
export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params;
  const language = (await headers()).get("x-language") === "en" ? "en" : "de";
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!post) return { title: "Beitrag nicht gefunden | Khao Lak Insider" };

  const title = language === "en" ? post.title_en?.trim() || post.title : post.title?.trim() || post.title_en;
  const description = language === "en" ? post.excerpt_en?.trim() || post.excerpt : post.excerpt?.trim() || post.excerpt_en;
  const canonical = absoluteLocalizedUrl(`/blog/${slug}`, language);

  return {
    title: `${title} | Khao Lak Insider`,
    description: description || (language === "en" ? `Insider tips and information about ${title}.` : `Insider-Tipps und Infos zu: ${title}.`),
    alternates: {
      canonical,
      languages: {
        de: absoluteLocalizedUrl(`/blog/${slug}`, "de"),
        en: absoluteLocalizedUrl(`/blog/${slug}`, "en"),
        "x-default": absoluteLocalizedUrl(`/blog/${slug}`, "de"),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
    },
  };
}

// 2. STATISCHE PFADE FÜR BUILD-OPTIMIERUNG (SSG)
export async function generateStaticParams() {
  const { data: posts } = await supabase.from("blog_posts").select("slug");
  if (!posts) return [];
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostDetailPage({ params }: PostPageProps) {
  const { slug } = await params;
  const language = (await headers()).get("x-language") === "en" ? "en" : "de";
  const href = (path: string) => localizePath(path, language);

  // Paralleler Abruf: Aktueller Post, User-Session und 3 interne Link-Vorschläge
  const [postResponse, userResponse, morePostsResponse] = await Promise.all([
    supabase.from("blog_posts").select("*").eq("slug", slug).single(),
    supabase.auth.getUser().catch(() => ({ data: { user: null } })),
    supabase.from("blog_posts").select("*").neq("slug", slug).limit(3)
  ]);

  const post = postResponse.data;
  const userData = userResponse?.data?.user;
  const morePosts = morePostsResponse.data || [];

  let userProfile = null;
  if (userData) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.id)
      .maybeSingle();
    userProfile = profileData;
  }

  if (!post) {
    return (
      <main style={{ padding: 40, textAlign: "center", minHeight: "100vh", background: "#F7F9FA" }}>
        {language === "en" ? "Post not found." : "Beitrag nicht gefunden."}
      </main>
    );
  }

  const localizedValue = (item: Record<string, unknown>, field: "title" | "excerpt" | "content" | "category") => {
    const primaryKey = language === "en" ? `${field}_en` : field;
    const fallbackKey = language === "en" ? field : `${field}_en`;
    const primary = item[primaryKey];
    const fallback = item[fallbackKey];
    return (typeof primary === "string" && primary.trim()) ||
      (typeof fallback === "string" && fallback.trim()) || "";
  };
  const title = localizedValue(post, "title");
  const excerpt = localizedValue(post, "excerpt");
  const content = localizedValue(post, "content");
  const category = localizedValue(post, "category");
  const copy = language === "en"
    ? {
        back: "Back to all posts", minutes: "min read", edit: "Edit post", direct: "Direct links",
        esimTitle: "Want to avoid roaming charges?", esimText: "Download an eSIM app before departure and get online as soon as you arrive in Thailand.",
        saily: "View Saily plans", yesim: "View Yesim plans", transparency: "Transparency notice",
        affiliate: "This page contains affiliate links. If you book an eSIM through one of them, we may receive a small commission at no extra cost to you.",
        more: "You may also like", read: "Read now", dataPackage: "Get a data plan from",
      }
    : {
        back: "Zurück zur Übersicht", minutes: "Minuten Lesezeit", edit: "Beitrag bearbeiten", direct: "Direkt-Links",
        esimTitle: "Keine Lust auf Roaming-Kosten?", esimText: "Lade dir die eSIM-App einfach vor Abflug herunter und surfe sofort nach der Landung in Thailand.",
        saily: "Tarife bei Saily ansehen", yesim: "Tarife bei Yesim ansehen", transparency: "Transparenz-Hinweis",
        affiliate: "Bei den Links auf dieser Seite handelt es sich um Affiliate-Links. Bei einer Buchung erhalten wir möglicherweise eine kleine Provision, ohne dass sich dein Preis ändert.",
        more: "Das könnte dich auch interessieren", read: "Jetzt lesen", dataPackage: "Jetzt Datenpaket sichern bei",
      };

  // STRUCTURED DATA (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": excerpt || title,
    "image": post.image_url ? [post.image_url] : [],
    "datePublished": post.created_at,
    "dateModified": post.created_at,
    "author": {
      "@type": "Organization",
      "name": "Khao Lak Insider",
      "url": "https://www.khaolak.app"
    }
  };

  const markdownComponents = {
    h2: ({ ...props }) => (
      <h2 className="mb-4 mt-10 text-2xl font-bold tracking-[-0.025em] text-[#10233f] md:text-3xl" {...props} />
    ),
    h3: ({ ...props }) => (
      <h3 className="text-2xl font-bold text-[#10233f] mt-8 mb-4 tracking-tight" {...props} />
    ),
    h4: ({ ...props }) => (
      <h4 className="text-xl font-bold text-[#10233f] mt-6 mb-3 tracking-tight" {...props} />
    ),
    p: ({ ...props }) => (
      <p className="mb-5 text-base font-normal leading-8 text-[#526176] md:text-[17px]" {...props} />
    ),
    li: ({ ...props }) => (
      <li className="ml-6 list-disc text-[#526176] mb-2 leading-7" {...props} />
    ),
    hr: ({ ...props }) => (
      <hr className="my-10 border-[#e7edf2]" {...props} />
    ),
    a: ({ href, children, ...props }: ComponentProps<"a">) => {
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
              className="inline-flex items-center gap-2 rounded-xl bg-[#0eb4bb] px-6 py-3.5 font-bold text-[#10233f] shadow-md shadow-[#0eb4bb]/10 transition-all duration-200 hover:bg-[#55d7d1] active:scale-[0.99] no-underline"
              {...props}
            >
              <span>🚀 {copy.dataPackage} {isYesimLink ? "Yesim" : "Saily"}</span>
              <span className="text-base">→</span>
            </a>
          </div>
        );
      }

      return (
        <a 
          href={url} 
          className="font-bold text-[#079ca5] underline transition-colors hover:text-[#067f86]"
          {...props}
        >
          {children}
        </a>
      );
    }
  };

  return (
    <main className="min-h-screen bg-white pb-28 text-[#10233f] antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* PREMIUM BREADCRUMB & BACK BUTTON */}
      <nav className="mx-auto max-w-[1180px] px-4 pb-6 pt-10 sm:px-6 lg:px-10">
        <Link 
          href={href("/blog")}
          className="group inline-flex items-center gap-2 text-sm font-bold text-[#718096] transition-colors hover:text-[#079ca5]"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
          {copy.back}
        </Link>
      </nav>

      {/* ARTICLE HERO SECTION */}
      <header className="mx-auto mb-10 max-w-[1180px] px-4 sm:px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-[14px] border border-white/10 bg-[#10233f] p-6 text-white shadow-[0_12px_32px_rgba(16,35,63,.16)] md:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(14,180,187,.22),transparent_32%)]" />
          <div className="relative">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <span className="rounded-full border border-[#55d7d1]/25 bg-[#55d7d1]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#74e1dc]">
                {category}
              </span>
              
              <h1 className="mb-6 mt-6 text-3xl font-extrabold leading-[1.12] tracking-[-0.035em] text-white md:text-5xl">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 border-t border-white/10 pt-6 text-xs font-semibold text-white/60">
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span>{new Date(post.created_at).toLocaleDateString(language === "en" ? "en-GB" : "de-DE", { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <span>⏱️</span>
                  <span>{post.reading_time || 5} {copy.minutes}</span>
                </div>
                <span>•</span>
                <span className="rounded-md border border-[#55d7d1]/20 bg-[#55d7d1]/10 px-2.5 py-1 text-[#74e1dc]">Verified Insider-Content</span>
              </div>
            </div>

            {/* Admin/Editor Button */}
            {(userProfile?.role === "admin" || userProfile?.role === "editor") && (
              <div className="shrink-0">
                <Link
                  href={`/admin/blog/${post.id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-white hover:text-[#10233f]"
                >
                  ✏️ {copy.edit}
                </Link>
              </div>
            )}
          </div>
          </div>
        </div>
      </header>

      {/* STICKY ESIM BAR */}
      <aside className="sticky top-0 z-30 mb-8 border-y border-white/10 bg-[#10233f]/95 text-white shadow-[0_10px_30px_rgba(16,35,63,.14)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:px-10">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full border border-[#55d7d1]/20 bg-[#55d7d1]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#74e1dc]">
                {copy.direct}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                {copy.transparency}
              </span>
            </div>
            <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">
              {copy.esimTitle}
            </h2>
            <p className="mt-1 text-xs leading-5 text-white/55">
              {copy.esimText} <span className="text-white/38">{copy.affiliate}</span>
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <a href="https://saily.tpk.lv/xKbnW9ID" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/15 bg-white px-5 py-3 text-center text-xs font-bold text-[#10233f] shadow-sm transition-colors hover:bg-slate-100">
              {copy.saily}
            </a>
            <a href="https://yesim.tpk.lv/CTkfUgOu" target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#0eb4bb] px-5 py-3 text-center text-xs font-bold text-[#10233f] shadow-sm transition-colors hover:bg-[#55d7d1]">
              {copy.yesim}
            </a>
          </div>
        </div>
      </aside>

      {/* FULL-WIDTH ARTICLE */}
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-10">
        
        {/* MAIN TEXT CONTENT */}
        <article className="prose prose-slate max-w-none rounded-[14px] border border-[#e8edf2] bg-white p-6 shadow-[0_8px_24px_rgba(15,35,62,.035)] md:p-10 lg:p-12">
          
          {post.image_url && (
            <BlogImageMagnifier src={post.image_url} alt={title} />
          )}

          {/* Der formatierte Haupttext via react-markdown */}
          <div className="focus:outline-none">
            <ReactMarkdown components={markdownComponents}>
              {content}
            </ReactMarkdown>
          </div>
        </article>

        {/* HIGH-CONVERSION MARKETING SIDEBAR */}
        <aside className="hidden">
          
          <div className="relative overflow-hidden rounded-[14px] border border-white/10 bg-[#10233f] p-6 text-white shadow-[0_12px_30px_rgba(16,35,63,.14)]">
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
            
            <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
              {copy.direct} 📱
            </span>
            
            <h4 className="text-xl font-bold tracking-tight mt-3 mb-2">
              {copy.esimTitle}
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              {copy.esimText}
            </p>

            <div className="space-y-3">
              <a 
                href="https://saily.tpk.lv/xKbnW9ID" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-white hover:bg-slate-100 text-slate-950 text-center font-bold text-xs py-3 rounded-xl transition-all block shadow-sm"
              >
                {copy.saily}
              </a>
              <a 
                href="https://yesim.tpk.lv/CTkfUgOu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 text-center font-bold text-xs py-3 rounded-xl transition-all block shadow-sm"
              >
                {copy.yesim}
              </a>
            </div>
          </div>

          <div className="rounded-[14px] border border-[#e8edf2] bg-white p-5 text-center shadow-[0_8px_24px_rgba(15,35,62,.035)]">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{copy.transparency}</p>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              {copy.affiliate}
            </p>
          </div>

        </aside>

      </div>

      {/* INTERNE VERLINKUNG / WEITERE BEITRÄGE */}
      {morePosts.length > 0 && (
        <section className="mx-auto mt-16 max-w-[1180px] border-t border-[#e7edf2] px-4 pt-12 sm:px-6 lg:px-10">
          <h3 className="mb-8 text-2xl font-extrabold tracking-tight text-[#10233f]">
            {copy.more} 🌴
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {morePosts.map((item) => (
              <Link 
                key={item.id} 
                href={href(`/blog/${item.slug}`)}
                className="group flex flex-col overflow-hidden rounded-[14px] border border-[#e8edf2] bg-white shadow-[0_8px_24px_rgba(15,35,62,.035)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,35,62,.09)]"
              >
                {item.image_url && (
                  <div className="relative w-full h-44 overflow-hidden bg-slate-100">
                    <Image
                      src={item.image_url}
                      alt={localizedValue(item, "title")}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-w-768px) 100vw, 300px"
                    />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider block mb-2">
                      {localizedValue(item, "category")}
                    </span>
                    <h4 className="font-bold text-[#10233f] group-hover:text-[#079ca5] transition-colors text-base leading-snug line-clamp-2">
                      {localizedValue(item, "title")}
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-slate-400 mt-4 inline-flex items-center gap-1 group-hover:text-slate-900 transition-colors">
                    {copy.read} <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
