"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, X } from "lucide-react";

interface SearchableSpot {
  id: string;
  title: string | null;
}

interface SpotSearchProps {
  spots: SearchableSpot[];
}

export default function SpotSearch({ spots }: SpotSearchProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("de-DE");
  const isSearchActive = normalizedQuery.length >= 3;

  const matches = useMemo(() => {
    if (!isSearchActive) return [];

    return spots.filter((spot) =>
      (spot.title || "").toLocaleLowerCase("de-DE").includes(normalizedQuery),
    );
  }, [isSearchActive, normalizedQuery, spots]);

  return (
    <div className="relative w-full md:max-w-md">
      <label className="relative flex min-h-11 items-center">
        <Search className="pointer-events-none absolute left-3.5 text-slate-400" size={17} />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Mindestens 3 Buchstaben eingeben ..."
          autoComplete="off"
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-10 text-sm text-[#10233f] outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Suche zurücksetzen"
            className="absolute right-3 flex border-0 bg-transparent p-0 text-slate-400 transition hover:text-slate-700"
          >
            <X size={16} />
          </button>
        )}
      </label>

      {isSearchActive && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_45px_rgba(16,35,63,0.16)]">
          {matches.length > 0 ? (
            <>
              <p className="mb-2 mt-1 px-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                {matches.length} {matches.length === 1 ? "Treffer" : "Treffer"}
              </p>
              {matches.map((spot) => (
                <Link
                  key={spot.id}
                  href={`/admin/editor/edit/${spot.id}`}
                  className="group flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#10233f] no-underline transition hover:bg-teal-50 hover:text-teal-800"
                >
                  <span className="truncate">{spot.title || "Unbenannter Spot"}</span>
                  <ChevronRight size={16} className="shrink-0 text-teal-600 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </>
          ) : (
            <p className="m-0 px-3 py-5 text-center text-sm text-slate-500">
              Keine passenden Spots gefunden.
            </p>
          )}
        </div>
      )}

      {!isSearchActive && query.length > 0 && (
        <p className="absolute right-1 top-[calc(100%+5px)] m-0 text-[10px] text-slate-400">
          Noch {3 - normalizedQuery.length} {3 - normalizedQuery.length === 1 ? "Zeichen" : "Zeichen"}
        </p>
      )}
    </div>
  );
}
