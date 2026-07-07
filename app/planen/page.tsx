"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { SlidersHorizontal, MapPin, Navigation, Compass } from "lucide-react";

// Mapbox Token setzen
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function PlanenPage() {
  const [spots, setSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter-States
  const [selectedCategory, setSelectedCategory] = useState<string>("Alle");
  const [maxBudget, setMaxBudget] = useState<number>(5);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 1. Schlanke Daten aus der API laden
  useEffect(() => {
    fetch("/api/spots")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSpots(data.result);
      })
      .catch((e) => console.error("Fehler beim Laden der Spots für die Planungsvorschau:", e))
      .finally(() => setLoading(false));
  }, []);

  // 2. Alle verfügbaren Kategorien dynamisch sammeln
  const categories = useMemo(() => {
    const cats = new Set(spots.map((s) => s.category));
    return ["Alle", ...Array.from(cats)];
  }, [spots]);

  // 3. Spots filtern (wird an die Map-Marker übergeben)
  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      const matchCategory = selectedCategory === "Alle" || spot.category === selectedCategory;
      const spotPrice = parseInt(spot.price_level) || 0;
      const matchPrice = spotPrice === 0 || spotPrice <= maxBudget; 
      
      return matchCategory && matchPrice;
    });
  }, [spots, selectedCategory, maxBudget]);

  // 4. Mapbox-Lebenszyklus steuern
  useEffect(() => {
    if (loading) return;

    // Karte initialisieren (Zentrum: Region Khao Lak)
    const map = new mapboxgl.Map({
      container: "planning-fullscreen-map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [98.245, 8.642], 
      zoom: 11.5,
    });

    // Zoom- und Kompass-Steuerung hinzufügen
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const activeMarkers: mapboxgl.Marker[] = [];

    // Marker für gefilterte Auswahl rendern
    filteredSpots.forEach((spot) => {
      if (!spot.latitude || !spot.longitude) return;

      // Popup-HTML mit Bild, Kategorie und direktem Link zur Spotseite
      const popupHTML = `
        <div style="font-family: 'Poppins', sans-serif; padding: 4px; max-width: 210px;">
          <img src="${spot.image_url}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 10px; margin-bottom: 8px;"/>
          <b style="font-size: 14px; display: block; color: #1e293b; margin-bottom: 2px;">${spot.title}</b>
          <span style="font-size: 10px; color: #14b8a6; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${spot.category}</span>
          <p style="font-size: 11px; color: #64748b; margin: 4px 0 8px 0; line-height: 1.4;">${spot.description}</p>
          <a href="/spot/${spot.slug}" style="display: inline-block; background: #14b8a6; color: white; padding: 5px 12px; border-radius: 6px; font-size: 11px; text-decoration: none; font-weight: 700; width: 100%; text-align: center; box-sizing: border-box;">Details ansehen</a>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHTML);

      // Dynamische Farbcodierung der Pins je nach Hauptkategorie
      let markerColor = "#1e293b"; // Standard: Dunkelgrau
      const catLower = spot.category?.toLowerCase() || "";
      if (catLower.includes("strand")) markerColor = "#14b8a6"; // Teal für Strände
      if (catLower.includes("bar") || catLower.includes("restaurant")) markerColor = "#f97316"; // Orange für Gastro
      if (catLower.includes("hotel")) markerColor = "#3b82f6"; // Blau für Unterkünfte

      const marker = new mapboxgl.Marker({ color: markerColor })
        .setLngLat([spot.longitude, spot.latitude])
        .setPopup(popup)
        .addTo(map);

      activeMarkers.push(marker);
    });

    // Cleanup-Funktion: Löscht alte Pins und Map-Instanz, wenn Filter wechseln oder Seite verlassen wird
    return () => {
      activeMarkers.forEach((m) => m.remove());
      map.remove();
    };
  }, [filteredSpots, loading]);

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "'Poppins', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <Compass size={40} className="animate-spin" style={{ color: "#14b8a6", margin: "0 auto 12px auto" }} />
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>Interaktive Karte wird geladen...</h2>
        </div>
      </div>
    );
  }

  return (
    <main style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", fontFamily: "'Poppins', sans-serif" }}>
      
      {/* FULLSCREEN MAP */}
      <div id="planning-fullscreen-map" style={{ width: "100%", height: "100%" }} />

      {/* FLOAT BUTTON: SIDEBAR ÖFFNEN/SCHLIESSEN */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 40,
          background: "#1e293b",
          color: "#fff",
          border: "none",
          padding: "12px 18px",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "14px",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
          transition: "transform 0.2s"
        }}
      >
        <SlidersHorizontal size={16} />
        {isSidebarOpen ? "Filter ausblenden" : "Routen-Planer & Filter"}
      </button>

      {/* OVERLAY SIDEBAR CONTROL */}
      {isSidebarOpen && (
        <div
          style={{
            position: "absolute",
            top: "85px",
            left: "20px",
            bottom: "30px",
            width: "340px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(8px)",
            borderRadius: "24px",
            zIndex: 30,
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            overflowY: "auto"
          }}
        >
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b", margin: 0 }}>Tour-Planer</h1>
            <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Filtere alle eingetragenen Spots live auf der interaktiven Karte.</p>
          </div>

          <hr style={{ border: 0, borderTop: "1px solid #e2e8f0", margin: 0 }} />

          {/* KATEGORIEN-WÄHLER */}
          <div>
            <label style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>Kategorie filtern</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor: selectedCategory === cat ? "#14b8a6" : "#e2e8f0",
                    background: selectedCategory === cat ? "#f0fdfa" : "#fff",
                    color: selectedCategory === cat ? "#0d9488" : "#475569",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <MapPin size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* BUDGET SCHIEBEREGLER */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", margin: 0 }}>Maximales Budget / Index</label>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#14b8a6", background: "#f0fdfa", padding: "2px 8px", borderRadius: "6px" }}>Level {maxBudget}</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={maxBudget}
              onChange={(e) => setMaxBudget(parseInt(e.target.value))}
              style={{
                width: "100%",
                accentColor: "#14b8a6",
                cursor: "pointer",
                marginTop: "4px"
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#94a3b8", marginTop: "4px", fontWeight: 600 }}>
              <span>1 (Günstig)</span>
              <span>5 (Exklusiv)</span>
            </div>
          </div>

          <hr style={{ border: 0, borderTop: "1px solid #e2e8f0", margin: 0 }} />

          {/* STATS UNTEN IN DER SIDEBAR */}
          <div style={{ marginTop: "auto", background: "#f8fafc", padding: "14px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Navigation size={18} color="#14b8a6" />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>
              {filteredSpots.length} von {spots.length} Spots werden auf der Karte angezeigt.
            </span>
          </div>

        </div>
      )}
    </main>
  );
}