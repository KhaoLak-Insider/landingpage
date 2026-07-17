"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/src/lib/supabase";

interface SpotDeleteButtonProps {
  spotId: string;
  spotTitle: string | null;
}

export default function SpotDeleteButton({ spotId, spotTitle }: SpotDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const displayTitle = spotTitle || "Unbenannter Spot";
    const confirmed = window.confirm(
      `Spot „${displayTitle}“ wirklich dauerhaft löschen?\n\nDer Spot wird vollständig aus der Datenbank entfernt und erscheint nicht mehr auf der Homepage. Diese Aktion kann nicht rückgängig gemacht werden.`,
    );

    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);

    const { data, error: deleteError } = await supabase
      .from("spots")
      .delete()
      .eq("id", spotId)
      .select("id");

    if (deleteError) {
      setError(`Löschen fehlgeschlagen: ${deleteError.message}`);
      setIsDeleting(false);
      return;
    }

    if (!data?.length) {
      setError("Der Spot konnte nicht gelöscht werden. Bitte prüfe deine Berechtigung und versuche es erneut.");
      setIsDeleting(false);
      return;
    }

    router.refresh();
  };

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label={`${spotTitle || "Unbenannten Spot"} löschen`}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-wait disabled:opacity-60"
      >
        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        <span className="hidden sm:inline">{isDeleting ? "Wird gelöscht …" : "Löschen"}</span>
      </button>
      {error && <p className="m-0 max-w-64 text-right text-[11px] leading-4 text-red-700">{error}</p>}
    </div>
  );
}
