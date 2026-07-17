import Link from "next/link";
import {
  AlertTriangle,
  ChevronRight,
  FilePlus2,
  MapPin,
} from "lucide-react";
import { supabase } from "@/src/lib/supabase";
import SpotSearch from "@/src/components/editor/SpotSearch";
import SpotDeleteButton from "@/src/components/editor/SpotDeleteButton";

export default async function SpotListPage() {
  const { data: spots, error } = await supabase
    .from("spots")
    .select("id, title")
    .order("title");

  return (
    <div className="mx-auto max-w-[1220px]">
      <header className="flex flex-col gap-6 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-teal-600">
            Content-Verwaltung
          </span>
          <h1 className="m-0 text-3xl font-extrabold tracking-[-0.04em] text-[#10233f] sm:text-4xl">
            Spots bearbeiten
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Verwalte die Inhalte deiner bestehenden Orte und Ausflugsziele.
          </p>
        </div>

        <Link
          href="/admin/editor"
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-teal-600 px-4 text-xs font-bold text-white no-underline shadow-[0_8px_20px_rgba(7,156,165,0.2)] transition hover:bg-teal-700 sm:self-auto"
        >
          <FilePlus2 size={17} />
          Neuen Spot anlegen
        </Link>
      </header>

      <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_30px_rgba(16,35,63,0.04)] md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <MapPin size={19} />
          </span>
          <div>
            <strong className="block text-sm text-[#10233f]">Alle Spots</strong>
            <span className="text-xs text-slate-500">
              {spots?.length ?? 0} {spots?.length === 1 ? "Spot" : "Spots"} gefunden
            </span>
          </div>
        </div>

        <SpotSearch spots={spots ?? []} />
      </section>

      {error ? (
        <section className="mt-5 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <AlertTriangle className="mt-0.5 shrink-0" size={20} />
          <div>
            <h2 className="m-0 text-sm font-bold">Spots konnten nicht geladen werden</h2>
            <p className="mb-0 mt-1 text-xs leading-5">{error.message}</p>
          </div>
        </section>
      ) : spots && spots.length > 0 ? (
        <section className="mt-5 grid gap-3">
          {spots.map((spot, index) => (
            <article
              key={spot.id}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_30px_rgba(16,35,63,0.04)] transition duration-200 hover:border-teal-300 hover:shadow-[0_14px_35px_rgba(16,35,63,0.09)] sm:gap-4 sm:p-4"
            >
              <Link
                href={`/admin/editor/edit/${spot.id}`}
                className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 no-underline transition hover:bg-teal-50/60 sm:gap-4 sm:p-2"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-extrabold text-slate-500 transition group-hover:bg-teal-50 group-hover:text-teal-700">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0 flex-1">
                  <h2 className="m-0 truncate text-base font-bold text-[#10233f] sm:text-lg">
                    {spot.title || "Unbenannter Spot"}
                  </h2>
                  <p className="mb-0 mt-1 text-xs text-slate-500">
                    Spot-Inhalte und Details bearbeiten
                  </p>
                </div>

                <span className="hidden items-center gap-1 text-xs font-bold text-teal-700 lg:flex">
                  Bearbeiten
                  <ChevronRight size={17} className="transition-transform group-hover:translate-x-0.5" />
                </span>
                <ChevronRight size={19} className="hidden shrink-0 text-teal-700 sm:block lg:hidden" />
              </Link>

              <SpotDeleteButton spotId={spot.id} spotTitle={spot.title} />
            </article>
          ))}
        </section>
      ) : (
        <section className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <MapPin size={26} strokeWidth={1.7} />
          </span>
          <h2 className="mb-0 mt-4 text-lg font-bold text-[#10233f]">Noch keine Spots angelegt</h2>
          <p className="mx-auto mb-0 mt-2 max-w-md text-sm leading-6 text-slate-500">
            Lege deinen ersten Spot an, damit er hier zur Bearbeitung erscheint.
          </p>
        </section>
      )}
    </div>
  );
}
