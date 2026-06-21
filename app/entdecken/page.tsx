"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import Link from "next/link";

export default function EntdeckenPage() {
  const [spots, setSpots] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Alle");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const categories = [
    "Alle",
    "Strand",
    "Natur",
    "Restaurant",
    "Markt",
    "Tempel",
    "Geheimtipp",
  ];

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

  // 🔍 AUTOCOMPLETE SEARCH (NEU)
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

  function toggleFav(id: string) {
    const favs = JSON.parse(localStorage.getItem("favs") || "[]");

    if (favs.includes(id)) {
      const updated = favs.filter((f: string) => f !== id);
      localStorage.setItem("favs", JSON.stringify(updated));
    } else {
      localStorage.setItem("favs", JSON.stringify([...favs, id]));
    }
  }

  function isFav(id: string) {
    if (typeof window === "undefined") return false;
    const favs = JSON.parse(localStorage.getItem("favs") || "[]");
    return favs.includes(id);
  }

  return (
    <main style={{ background: "#f6f7fb", minHeight: "100vh" }}>

      {/* HEADER NAV (aus Landingpage) */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#ffffff",
        borderBottom: "1px solid #ddd"
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          
          <div style={{ fontWeight: 800, color: "#000" }}>
            Khao Lak Insider 🌴
          </div>

          <nav style={{ display: "flex", gap: 18, fontSize: 14 }}>
            <Link href="/entdecken">Entdecken</Link>
            <Link href="/planen">Planen</Link>
            <Link href="/erleben">Erleben</Link>
            <Link href="/favoriten">Favoriten</Link>
            <Link href="/community">Community</Link>
          </nav>

        </div>
      </div>

      {/* PAGE HEADER */}
      <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, color: "#000" }}>
          Entdecken 🌴
        </h1>

        {/* SEARCH INPUT */}
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Suche nach Orten..."
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
            marginTop: 12,
            background: "#fff",
            color: "#000"
          }}
        />

        {/* 🔥 AUTOCOMPLETE DROPDOWN */}
        {suggestions.length > 0 && (
          <div style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 12,
            marginTop: 6,
            overflow: "hidden"
          }}>
            {suggestions.map((s) => (
              <Link
                key={s.id}
                href={`/spot/${s.slug}`}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: 10,
                  alignItems: "center",
                  textDecoration: "none",
                  color: "#000"
                }}
              >
                <img
                  src={s.image_url}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                />
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  {s.title}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* MAP BUTTON */}
        <div style={{ marginTop: 10 }}>
          <button style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
            background: "#fff",
            cursor: "pointer"
          }}>
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
                background: category === cat ? "#14b8a6" : "#fff",
                color: category === cat ? "#fff" : "#000",
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
              background: "#fff",
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
              border: "1px solid #eee"
            }}
          >

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

            <div style={{ padding: 12 }}>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <h3 style={{ margin: 0, color: "#000" }}>
                  {spot.title}
                </h3>

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