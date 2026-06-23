import { supabase } from "@/src/lib/supabase";
import Link from "next/link";

export default async function SpotListPage() {
  // Wir holen die Daten direkt serverseitig
  const { data: spots, error } = await supabase
    .from("spots")
    .select("id, title")
    .order("title");

  if (error) {
    return (
      <div className="p-10 text-center text-red-600">
        <h2 className="text-xl font-bold">Fehler beim Laden</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Spots bearbeiten</h1>
        <p className="text-slate-500">Wähle einen Spot aus, um ihn zu bearbeiten.</p>
      </header>

      <div className="grid gap-4">
        {spots && spots.length > 0 ? (
          spots.map((spot) => (
            <Link 
              href={`/editor/edit/${spot.id}`} 
              key={spot.id} 
              className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-teal-500 hover:shadow-md transition-all flex justify-between items-center"
            >
              <span className="font-bold text-slate-800 text-lg">{spot.title}</span>
              <span className="text-teal-600 font-bold text-sm">Bearbeiten →</span>
            </Link>
          ))
        ) : (
          <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">Noch keine Spots angelegt.</p>
          </div>
        )}
      </div>
    </div>
  );
}