"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Edit3,
  ExternalLink,
  FilePlus2,
  FileText,
  Search,
} from "lucide-react";
import { supabase } from "@/src/lib/supabase";

interface BlogPostSummary {
  id: string;
  slug: string;
  title: string | null;
  title_en: string | null;
  category: string | null;
  category_en: string | null;
  created_at: string | null;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadPosts() {
      const { data, error: loadError } = await supabase
        .from("blog_posts")
        .select("id, slug, title, title_en, category, category_en, created_at")
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (loadError) {
        setError(loadError.message);
      } else {
        setPosts((data as BlogPostSummary[]) || []);
      }

      setIsLoading(false);
    }

    void loadPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredPosts = normalizedSearch
    ? posts.filter((post) =>
        [post.title, post.title_en, post.category, post.category_en]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedSearch)),
      )
    : posts;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#079ca5]">
            Content-Management
          </span>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-[#10233f]">
            Blog verwalten
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Deutsche und englische Blogbeiträge erstellen, prüfen und bearbeiten.
          </p>
        </div>

        <Link
          href="/admin/blog/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#079ca5] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#078b93]"
        >
          <FilePlus2 size={17} /> Neuer Blogbeitrag
        </Link>
      </header>

      <section className="mt-9 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Titel oder Kategorie suchen …"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#079ca5] focus:bg-white"
            />
          </div>

          <span className="text-xs font-bold text-slate-400">
            {filteredPosts.length} {filteredPosts.length === 1 ? "Beitrag" : "Beiträge"}
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-400">Blogbeiträge werden geladen …</div>
        ) : error ? (
          <div className="m-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            Blogbeiträge konnten nicht geladen werden: {error}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <FileText size={30} className="text-slate-300" />
            <strong className="mt-4 text-slate-700">Keine Blogbeiträge gefunden</strong>
            <p className="mt-2 text-sm text-slate-400">Erstelle einen neuen Beitrag oder passe die Suche an.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredPosts.map((post) => (
              <article key={post.id} className="flex flex-col gap-5 p-5 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#079ca5]">
                    <span>{post.category || "Ohne Kategorie"}</span>
                    {post.category_en && <span className="text-slate-400">/ {post.category_en}</span>}
                  </div>
                  <h2 className="mt-2 truncate text-base font-extrabold text-[#10233f]">
                    {post.title || "Unbenannter Beitrag"}
                  </h2>
                  {post.title_en && <p className="mt-1 truncate text-sm text-slate-500">EN: {post.title_en}</p>}
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                    <CalendarDays size={14} />
                    {post.created_at
                      ? new Date(post.created_at).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "Kein Datum"}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link
                    href={`/de/blog/${encodeURIComponent(post.slug)}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300"
                  >
                    <ExternalLink size={14} /> Vorschau
                  </Link>
                  <Link
                    href={`/admin/blog/${encodeURIComponent(post.id)}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#10233f] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#173b60]"
                  >
                    <Edit3 size={14} /> Bearbeiten
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
