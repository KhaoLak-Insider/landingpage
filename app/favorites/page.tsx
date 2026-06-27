"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import Link from "next/link";
import { MapPin, Heart } from "lucide-react";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Daten abrufen: Favoriten verknüpft mit Spot-Details
      const { data, error } = await supabase
        .from("favorites")
        .select("spot_id, spots(id, title, image_url, category, slug)")
        .eq("user_id", user.id);

      if (data) {
        setFavorites(data.map(f => f.spots));
      }
      setLoading(false);
    }
    fetchFavorites();
  }, []);

  const removeFavorite = async (spotId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from("favorites").delete().eq("spot_id", spotId).eq("user_id", user.id);
    setFavorites(favorites.filter(f => f.id !== spotId));
  };

  if (loading) return <main style={{ padding: 40, textAlign: "center" }}>Favoriten werden geladen...</main>;

  return (
    <main style={{ maxWidth: "1280px", margin: "40px auto", padding: "0 20px", fontFamily: "'Poppins', sans-serif" }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 30 }}>Deine Favoriten</h1>

      {favorites.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", background: "#f8fafc", borderRadius: 24 }}>
          <p>Du hast noch keine Favoriten gespeichert.</p>
          <Link href="/entdecken" style={{ color: "#14b8a6", fontWeight: 700 }}>Jetzt Spots entdecken</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
          {favorites.map((spot) => (
            <Link href={`/spot/${spot.slug}`} key={spot.id} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ borderRadius: 24, overflow: "hidden", background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", position: "relative" }}>
                <div style={{ height: 200, overflow: "hidden" }}>
                  <img src={spot.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <button 
                  onClick={(e) => removeFavorite(spot.id, e)}
                  style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.9)", border: "none", padding: "8px", borderRadius: "50%", cursor: "pointer", color: "#ef4444" }}
                >
                  <Heart size={20} fill="#ef4444" />
                </button>
                <div style={{ padding: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#14b8a6", textTransform: "uppercase" }}>{spot.category}</div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: "8px 0" }}>{spot.title}</h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}