"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import Link from "next/link";

const BRAND_GREEN = "#16a34a";

export default function EntdeckenPage() {
  const [spots, setSpots] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
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

  // 🔥 LOAD SPOTS
  useEffect(() => {
    loadSpots();
  }, [category]);

  async function loadSpots() {
    let query = supabase
      .from("spots")
      .select("*")
      .eq("is_published", true);

    if (category !== "Alle") {
      query = query.eq("category", category);
    }

    const { data } = await query;
    setSpots(data || []);
  }

  // 🔍 LIVE SEARCH (AUTOCOMPLETE)
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

  // ❤️ FAVORITES
  function toggleFav(id: string) {
    const favs = JSON.parse(localStorage.getItem("favs") || "[]");

    if (favs.includes(id)) {
      localStorage.setItem(
        "favs",
        JSON.stringify(favs.filter((f: string) => f !== id))
      );
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

      {/* HEADER */}
      <div style={{
        background: "white",
        borderBottom: "1px solid #eee",
        padding: "14px 24px",
        position: "sticky",
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ fontWeight: 700 }}>
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

      {/* CONTENT */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>

        <h1>Entdecken 🌴</h1>

        {/* SEARCH */}
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
          }}
        />

        {/* SUGGESTIONS */}
        {suggestions.length > 0 && (
          <div style={{
            background: "white",
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
                  textDecoration: "none",
                  color: "black"
                }}
              >
                <img
                  src={s.image_url}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    objectFit: "cover"
                  }}
                />
                <div>{s.title}</div>
              </Link>
            ))}
          </div>
        )}

        {/* CATEGORY FILTER */}
        <div style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          marginTop: 16
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: "1px solid #ddd",
                background: category === cat ? BRAND_GREEN : "white",
                color: category === cat ? "white" : "black",
                cursor: "pointer",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GRID */}
        <div style={{
          marginTop: 20,
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
                  justifyContent: "space-between"
                }}>
                  <h3 style={{ margin: 0 }}>{spot.title}</h3>

                  <button
                    onClick={() => toggleFav(spot.id)}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    {isFav(spot.id) ? "❤️" : "🤍"}
                  </button>
                </div>

                <p style={{
                  fontSize: 13,
                  color: "#666"
                }}>
                  {spot.description?.slice(0, 80)}...
                </p>

              </div>

            </div>
          ))}
        </div>

      </div>
    </main>
  );
}