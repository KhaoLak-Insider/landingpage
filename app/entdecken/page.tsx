"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import Link from "next/link";

export default function EntdeckenPage() {
  const [spots, setSpots] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Alle");

  const categories = [
    "Alle",
    "Strand",
    "Natur",
    "Restaurant",
    "Markt",
    "Tempel",
    "Geheimtipp",
  ];

  // 🔥 LOAD DATA
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

  // ❤️ FAVORITES (local)
  function toggleFav(id: string) {
    const favs = JSON.parse(localStorage.getItem("favs") || "[]");

    if (favs.includes(id)) {
      const updated = favs.filter((f: string) => f !== id);
      localStorage.setItem("favs", JSON.stringify(updated));
    } else {
      favs.push(id);
      localStorage.setItem("favs", JSON.stringify(favs));
    }
  }

  function isFav(id: string) {
    if (typeof window === "undefined") return false;
    const favs = JSON.parse(localStorage.getItem("favs") || "[]");
    return favs.includes(id);
  }

  return (
    <main style={{ background: "#f6f7fb", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32 }}>Entdecken 🌴</h1>

        {/* SEARCH */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suche nach Orten..."
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
            marginTop: 12,
          }}
        />

        {/* MAP BUTTON */}
        <div style={{ marginTop: 10 }}>
          <button
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "white",
            }}
          >
            🗺 Karte öffnen
          </button>
        </div>

        {/* CATEGORY FILTER */}
        <div style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          marginTop: 14,
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: "1px solid #ddd",
                background: category === cat ? "#22c55e" : "white",
                color: category === cat ? "white" : "black",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 24px 40px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 18,
      }}>
        {spots.map((spot) => (
          <div
            key={spot.id}
            style={{
              background: "white",
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
            }}
          >

            {/* IMAGE */}
            <Link href={`/spot/${spot.slug}`}>
              <img
                src={spot.image_url}
                style={{
                  width: "100%",
                  height: 180,
                  objectFit: "cover",
                }}
              />
            </Link>

            {/* CONTENT */}
            <div style={{ padding: 12 }}>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <h3 style={{ margin: 0 }}>{spot.title}</h3>

                {/* HEART */}
                <button
                  onClick={() => toggleFav(spot.id)}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 18,
                    cursor: "pointer",
                  }}
                >
                  {isFav(spot.id) ? "❤️" : "🤍"}
                </button>
              </div>

              <p style={{
                fontSize: 13,
                color: "#666",
                marginTop: 6
              }}>
                {spot.description?.slice(0, 80)}...
              </p>

            </div>

          </div>
        ))}
      </div>

    </main>
  );
}