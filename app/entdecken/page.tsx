"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { Heart, UserPlus, LogIn } from "lucide-react";
import MapBoxMini from "@/src/components/MapBoxMini";

export default function EntdeckenPage() {
  const [spots, setSpots] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Alle");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([{ name: "Alle", icon: "LayoutGrid" }]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [maxDistance, setMaxDistance] = useState<number>(100);
  const [showOnlyFavs, setShowOnlyFavs] = useState(false);

  const IconComponent = ({ name, size = 16 }: { name: string, size?: number }) => {
    const LucideIcon = (LucideIcons as any)[name];
    return LucideIcon ? <LucideIcon size={size} /> : null;
  };

  const calculateDistance = (lat2: number, lon2: number) => {
    const hotelData = Array.isArray(userProfile?.hotels) ? userProfile.hotels[0] : userProfile?.hotels;
    const lat1 = userProfile?.hotel_id ? hotelData?.lat : userProfile?.custom_hotel_lat;
    const lon1 = userProfile?.hotel_id ? hotelData?.lng : userProfile?.custom_hotel_lng;
    if (!lat1 || !lon1) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
  };

  useEffect(() => {
    async function loadInitialData() {
      const { data: catData } = await supabase.from("categories").select("name, icon").order("name");
      if (catData) setCategories([{ name: "Alle", icon: "LayoutGrid" }, ...catData]);

      const { data: { user } } = await supabase.auth.getUser();
      setSession(user);

      if (user) {
        const { data: favData } = await supabase.from("favorites").select("spot_id").eq("user_id", user.id);
        if (favData) setFavorites(favData.map(f => f.spot_id));
        const { data: profile } = await supabase.from("profiles").select("hotel_id, custom_hotel_lat, custom_hotel_lng, hotels(lat, lng)").eq("id", user.id).maybeSingle();
        setUserProfile(profile);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    loadSpots();
  }, [category, search, maxDistance, showOnlyFavs]);

  async function loadSpots() {
    let query = supabase.from("spots").select("*").eq("is_published", true);
    if (category !== "Alle") query = query.eq("category", category);
    if (search.length > 0) query = query.ilike("title", `%${search}%`);
    
    let { data } = await query;
    let filteredSpots = data || [];

    if (showOnlyFavs) {
      filteredSpots = filteredSpots.filter(s => favorites.includes(s.id));
    }

    if (userProfile && maxDistance < 100) {
      filteredSpots = filteredSpots.filter(s => {
        const dist = calculateDistance(s.latitude, s.longitude);
        return dist !== null && dist <= maxDistance;
      });
    }

    setSpots(filteredSpots);
  }

  function getIconForCategory(catName: string) {
    const found = categories.find((c) => c.name === catName);
    return found ? found.icon : "MapPin";
  }

  async function handleSearch(value: string) {
    setSearch(value);
    if (value.length < 2) { setSuggestions([]); return; }
    const { data } = await supabase.from("spots").select("id, title, slug, image_url").ilike("title", `${value}%`).limit(5);
    setSuggestions(data || []);
  }

  async function toggleFav(id: string) {
    if (!session) return alert("Bitte logge dich ein.");
    if (favorites.includes(id)) {
      await supabase.from("favorites").delete().eq("spot_id", id).eq("user_id", session.id);
      setFavorites(favorites.filter(f => f !== id));
    } else {
      await supabase.from("favorites").insert([{ spot_id: id, user_id: session.id }]);
      setFavorites([...favorites, id]);
    }
  }

  return (
    <main style={{ background: "#f8fafc", minHeight: "100vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: "280px 1fr 320px", gap: "32px" }}>
        
        <aside>
          <div style={{ background: "#fff", padding: "24px", borderRadius: 20, border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>Filter</h2>
              <button onClick={() => { setCategory("Alle"); setMaxDistance(100); setShowOnlyFavs(false); }} style={{ background: "none", border: "none", fontSize: "0.85rem", color: "#64748b", cursor: "pointer" }}>Zurücksetzen</button>
            </div>
            
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "12px", color: "#0f172a" }}>Kategorie</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
              {categories.map((cat) => (
                <button key={cat.name} onClick={() => setCategory(cat.name)} 
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", borderRadius: 10, background: category === cat.name ? "#f0fdfa" : "transparent", color: category === cat.name ? "#0d9488" : "#475569", border: category === cat.name ? "1px solid #0d9488" : "1px solid transparent", cursor: "pointer", fontWeight: 600, transition: "all 0.2s" }}>
                  <IconComponent name={cat.icon} size={18} /> {cat.name}
                </button>
              ))}
            </div>

            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "12px", color: "#0f172a" }}>Entfernung: {maxDistance} km</h3>
            <input type="range" min="1" max="100" value={maxDistance} onChange={(e) => setMaxDistance(Number(e.target.value))} style={{ width: "100%", marginBottom: "24px" }} />

            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "12px", color: "#0f172a" }}>Nur Favoriten</h3>
            <button onClick={() => setShowOnlyFavs(!showOnlyFavs)} style={{ width: 40, height: 20, borderRadius: 50, border: "none", background: showOnlyFavs ? "#0d9488" : "#e2e8f0", position: "relative", cursor: "pointer" }}>
              <div style={{ width: 16, height: 16, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: showOnlyFavs ? 22 : 2, transition: "all 0.2s" }}></div>
            </button>
          </div>
        </aside>

        <section>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>Entdecke Khao Lak 🌴</h1>
          <p style={{ color: "#64748b", fontSize: "1.1rem", marginBottom: "32px" }}>Finde die besten Spots in Khao Lak.</p>
          <input value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Wonach suchst du?..." style={{ width: "100%", padding: "16px", borderRadius: 16, border: "1px solid #e2e8f0", marginBottom: "24px" }} />
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
            {spots.map((spot) => (
              <div key={spot.id} style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #f1f5f9", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", position: "relative" }}>
                <Link href={`/spot/${spot.slug}`}>
                  <div style={{ position: "absolute", top: 16, left: 16, zIndex: 10, background: "rgba(255,255,255,0.9)", padding: "6px 12px", borderRadius: 50, fontSize: 12, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                    <IconComponent name={getIconForCategory(spot.category)} /> {spot.category}
                  </div>
                  <img src={spot.image_url} style={{ width: "100%", height: 200, objectFit: "cover" }} />
                </Link>
                <div style={{ padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <h3 style={{ margin: "0 0 8px 0", color: "#0f172a", fontSize: "1.25rem" }}>{spot.title}</h3>
                    <button onClick={() => toggleFav(spot.id)} style={{ border: "none", background: "transparent", cursor: "pointer", color: favorites.includes(spot.id) ? "#ef4444" : "#cbd5e1" }}>
                      <Heart size={24} fill={favorites.includes(spot.id) ? "#ef4444" : "none"} />
                    </button>
                  </div>
                  {session && (
                    <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "8px" }}>
                      {calculateDistance(spot.latitude, spot.longitude) ? `${calculateDistance(spot.latitude, spot.longitude)} km von der Unterkunft entfernt` : "Unterkunft nicht festgelegt"}
                    </div>
                  )}
                  <p style={{ fontSize: "0.95rem", color: "#64748b", margin: 0, lineHeight: 1.5 }}>{spot.description?.slice(0, 100)}...</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <div style={{ background: "#fff", padding: "20px", borderRadius: 20, border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontWeight: 800, marginBottom: "15px" }}>Karte & Entdecken</h3>
            <div style={{ height: 150, borderRadius: 12, overflow: "hidden" }}>
              {session ? (
                (userProfile?.hotels?.lat || userProfile?.custom_hotel_lat) ? (
                  <MapBoxMini lat={userProfile.hotels?.lat || userProfile.custom_hotel_lat} lng={userProfile.hotels?.lng || userProfile.custom_hotel_lng} />
                ) : (
                  <Link href="/profil" style={{ textDecoration: "none", display: "block", height: "100%" }}>
                    <div style={{ height: "100%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", textAlign: "center", fontSize: "0.8rem", color: "#0d9488", fontWeight: 600, cursor: "pointer" }}>
                      📍 Klicke hier, um eine Unterkunft im Profil auszuwählen und Distanzen zu sehen.
                    </div>
                  </Link>
                )
              ) : (
                <div style={{ height: "100%", background: "#f1f5f9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px", textAlign: "center", gap: "12px" }}>
                  <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>Melde dich an, um die Karte und Distanzen zu sehen.</div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Link href="/login"><button style={{ padding: "8px 12px", borderRadius: "8px", background: "#0d9488", color: "white", border: "none", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}><LogIn size={16} /> Anmelden</button></Link>
                    <Link href="/registrieren"><button style={{ padding: "8px 12px", borderRadius: "8px", background: "white", color: "#0d9488", border: "1px solid #e2e8f0", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}><UserPlus size={16} /> Registrieren</button></Link>
                  </div>
                </div>
              )}
            </div>
            <Link href="/map" style={{ display: "block", marginTop: "12px", textAlign: "center", fontSize: "0.85rem", fontWeight: 700, color: "#0d9488", textDecoration: "none" }}>Karte öffnen ➔</Link>
          </div>
          <div style={{ background: "#fff", padding: "20px", borderRadius: 20, border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontWeight: 800, marginBottom: "15px" }}>Top Kategorien</h3>
            {categories.slice(1, 6).map(c => <div key={c.name} style={{ padding: "8px 0", color: "#475569", fontSize: "0.9rem" }}>{c.name}</div>)}
          </div>
        </aside>
      </div>
    </main>
  );
}