"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { Heart } from "lucide-react";

export default function EntdeckenPage() {
  const [spots, setSpots] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Alle");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([{ name: "Alle", icon: "LayoutGrid" }]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Hilfsfunktion für Icons
  const IconComponent = ({ name }: { name: string }) => {
    const LucideIcon = (LucideIcons as any)[name];
    return LucideIcon ? <LucideIcon size={14} /> : null;
  };

  useEffect(() => {
    async function loadInitialData() {
      const { data: catData } = await supabase.from("categories").select("name, icon").order("name");
      if (catData) setCategories([{ name: "Alle", icon: "LayoutGrid" }, ...catData]);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: favData } = await supabase.from("favorites").select("spot_id").eq("user_id", user.id);
        if (favData) setFavorites(favData.map(f => f.spot_id));
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    loadSpots();
  }, [category, search]);

  async function loadSpots() {
    let query = supabase
      .from("spots")
      .select("*")
      .eq("is_published", true);

    if (category !== "Alle") {
      query = query.eq("category", category);
    }

    if (search.length > 0) {
      query = query.ilike("title", `%${search}%`);
    }

    const { data } = await query;
    setSpots(data || []);
  }

  function getIconForCategory(catName: string) {
    const found = categories.find((c) => c.name === catName);
    return found ? found.icon : "MapPin";
  }

  async function handleSearch(value: string) {
    setSearch(value);
    if (value.length < 2) {
      setSuggestions([]);
      return;
    }
    const { data } = await supabase
      .from("spots")
      .select("id, title, slug, image_url")
      .ilike("title", `${value}%`)
      .limit(5);
    setSuggestions(data || []);
  }

  async function toggleFav(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Bitte logge dich ein.");

    if (favorites.includes(id)) {
      await supabase.from("favorites").delete().eq("spot_id", id).eq("user_id", user.id);
      setFavorites(favorites.filter(f => f !== id));
    } else {
      await supabase.from("favorites").insert([{ spot_id: id, user_id: user.id }]);
      setFavorites([...favorites, id]);
    }
  }

  return (
    <main style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: "80px" }}>
      {/* PAGE HEADER */}
      <div style={{ padding: "40px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
          Entdecke Khao Lak
        </h1>
        <p style={{ color: "#64748b", fontSize: "1.1rem", marginBottom: "32px" }}>Finde die besten Spots in Khao Lak.</p>

        {/* SEARCH INPUT */}
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Wonach suchst du?..."
          style={{
            width: "100%",
            padding: "16px 20px",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            background: "#fff",
            fontSize: "16px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
          }}
        />

        {/* 🔥 AUTOCOMPLETE DROPDOWN */}
        {suggestions.length > 0 && (
          <div style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            marginTop: 8,
            overflow: "hidden",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)"
          }}>
            {suggestions.map((s) => (
              <Link
                key={s.id}
                href={`/spot/${s.slug}`}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: 12,
                  alignItems: "center",
                  textDecoration: "none",
                  color: "#334155"
                }}
              >
                <img
                  src={s.image_url}
                  style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }}
                />
                <div style={{ fontSize: 15, fontWeight: 600 }}>{s.title}</div>
              </Link>
            ))}
          </div>
        )}

        {/* MAP BUTTON */}
        <div style={{ marginTop: 20 }}>
          <button style={{
            padding: "12px 20px",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            background: "#fff",
            cursor: "pointer",
            fontWeight: 600,
            color: "#475569"
          }}>
            🗺 Karte öffnen
          </button>
        </div>

        {/* CATEGORY FILTER */}
        <div style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          marginTop: 24,
          paddingBottom: 4
        }}>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setCategory(cat.name)}
              style={{
                padding: "10px 22px",
                borderRadius: 50,
                border: category === cat.name ? "none" : "1px solid #e2e8f0",
                background: category === cat.name ? "#0f172a" : "#fff",
                color: category === cat.name ? "#fff" : "#475569",
                fontWeight: 600,
                whiteSpace: "nowrap",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <IconComponent name={cat.icon || "LayoutGrid"} />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "0 24px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "24px",
      }}>
        {spots.map((spot) => (
          <div
            key={spot.id}
            style={{
              background: "#fff",
              borderRadius: 20,
              overflow: "hidden",
              border: "1px solid #f1f5f9",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
              transition: "transform 0.2s",
              position: "relative"
            }}
          >
            <Link href={`/spot/${spot.slug}`}>
              {/* KATEGORIE BADGE */}
              <div style={{
                position: "absolute",
                top: 16,
                left: 16,
                zIndex: 10,
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(4px)",
                padding: "6px 12px",
                borderRadius: 50,
                fontSize: 12,
                fontWeight: 700,
                color: "#0f172a",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <IconComponent name={getIconForCategory(spot.category)} />
                {spot.category}
              </div>

              <img
                src={spot.image_url}
                style={{ width: "100%", height: 200, objectFit: "cover" }}
              />
            </Link>

            <div style={{ padding: 20 }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start"
              }}>
                <h3 style={{ margin: "0 0 8px 0", color: "#0f172a", fontSize: "1.25rem" }}>
                  {spot.title}
                </h3>

                <button
                  onClick={() => toggleFav(spot.id)}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: favorites.includes(spot.id) ? "#ef4444" : "#cbd5e1"
                  }}
                >
                  <Heart size={24} fill={favorites.includes(spot.id) ? "#ef4444" : "none"} />
                </button>
              </div>

              <p style={{
                fontSize: "0.95rem",
                color: "#64748b",
                margin: 0,
                lineHeight: 1.5
              }}>
                {spot.description?.slice(0, 100)}...
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}