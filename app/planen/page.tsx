"use client";

import { useEffect, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { renderToStaticMarkup } from "react-dom/server"; // Für das Rendern der SVGs in Mapbox
import * as LucideIcons from "lucide-react"; // Dynamischer Import für die Sidebar & Karte
import { SlidersHorizontal, MapPin, Navigation, Compass } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { getLanguageFromPathname, localizePath } from "@/src/lib/i18n-routing";

interface PlanningCategory {
  id: string;
  name: string;
  name_en: string | null;
  slug: string;
  icon: string | null;
  color: string | null;
  parent_id: string | null;
  sort_order: number;
}

interface PlanningCategoryItem extends PlanningCategory {
  displayName: string;
  childNames: string[];
}

interface PlanningSpot {
  id: string;
  title: string;
  title_en: string | null;
  slug: string;
  category: string | null;
  category_en: string | null;
  description: string | null;
  description_en: string | null;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  price_level: number | string | null;
  categories: Omit<PlanningCategory, "id"> | null;
}

const ALL_CATEGORIES = "__all__";

// Mapbox Token setzen
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// Hilfskomponente, um Lucide-Icons dynamisch anhand des Strings aus deiner DB in der Sidebar zu rendern
function DynamicSidebarIcon({ name }: { name: string }) {
  if (!name) return <LucideIcons.MapPin size={16} />;
  
  // Sucht das Icon (z.B. "ChefHat" oder "Parasol") im Lucide-Paket
  const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[name];
  
  if (!IconComponent) return <LucideIcons.MapPin size={16} />; // Fallback-Pin
  return <IconComponent size={16} />;
}

export default function PlanenPage() {
  const [spots, setSpots] = useState<PlanningSpot[]>([]);
  const [categoryRecords, setCategoryRecords] = useState<PlanningCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const language = getLanguageFromPathname(usePathname());
  const copy = language === "en"
    ? {
        loading: "Loading interactive map...",
        loadError: "Could not load places",
        hideFilters: "Hide filters",
        showFilters: "Route planner & filters",
        title: "Trip planner",
        intro: "Filter all listed places live on the map.",
        categories: "Filter categories",
        all: "All",
        budget: "Maximum budget",
        level: "Level",
        spots: "{filtered} of {total} places on the map.",
        details: "View details",
      }
    : {
        loading: "Interaktive Karte wird geladen...",
        loadError: "Spots konnten nicht geladen werden",
        hideFilters: "Filter ausblenden",
        showFilters: "Routen-Planer & Filter",
        title: "Tour-Planer",
        intro: "Filtere alle eingetragenen Spots live auf der Karte.",
        categories: "Kategorien filtern",
        all: "Alle",
        budget: "Maximales Budget",
        level: "Level",
        spots: "{filtered} von {total} Spots auf der Karte.",
        details: "Details ansehen",
      };
  
  // Filter-States (Mehrfachauswahl für Kategorien & Budget)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([ALL_CATEGORIES]);
  const [maxBudget, setMaxBudget] = useState<number>(5);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 1. Daten aus deiner angepassten API-Route laden
  useEffect(() => {
    fetch("/api/spots")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSpots(data.result);
          setCategoryRecords(data.categories || []);
        } else {
          console.error(copy.loadError, data.error);
        }
      })
      .catch((e) => console.error("Fehler beim Laden der Spots:", e))
      .finally(() => setLoading(false));
  }, [copy.loadError]);

  // 2. Einzigartige Kategorien für die Sidebar sammeln (inklusive Icon und Farbe)
  const categoriesList = useMemo<PlanningCategoryItem[]>(() => {
    const mapped = categoryRecords.map((item) => ({
      ...item,
      displayName:
        language === "en" ? item.name_en?.trim() || item.name : item.name,
      childNames: categoryRecords
        .filter((candidate) => candidate.parent_id === item.id)
        .map((candidate) => candidate.name),
    }));

    return mapped
      .filter((item) => item.parent_id === null)
      .flatMap((parent) => [
        parent,
        ...mapped
          .filter((item) => item.parent_id === parent.id)
          .sort((a, b) => a.sort_order - b.sort_order),
      ]);
  }, [categoryRecords, language]);

  // Funktion zur Steuerung der Mehrfachauswahl in der Sidebar
  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategories((prev) => {
      if (categoryName === ALL_CATEGORIES) return [ALL_CATEGORIES];
      const ohneAlle = prev.filter((c) => c !== ALL_CATEGORIES);
      
      if (ohneAlle.includes(categoryName)) {
        const neuesArray = ohneAlle.filter((c) => c !== categoryName);
        return neuesArray.length === 0 ? [ALL_CATEGORIES] : neuesArray;
      } else {
        return [...ohneAlle, categoryName];
      }
    });
  };

  // 3. Spots filtern anhand der Sidebar-Auswahl
  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      const spotCatName = spot.categories?.name || spot.category || "";
      const selectedCategoryRecords = categoriesList.filter((item) =>
        selectedCategories.includes(item.name)
      );
      const matchCategory =
        selectedCategories.includes(ALL_CATEGORIES) ||
        selectedCategories.includes(spotCatName) ||
        selectedCategoryRecords.some((item) =>
          item.childNames.includes(spotCatName)
        );
      
      const spotPrice = Number(spot.price_level) || 0;
      const matchPrice = spotPrice === 0 || spotPrice <= maxBudget; 
      
      return matchCategory && matchPrice;
    });
  }, [spots, selectedCategories, maxBudget, categoriesList]);

  // 4. Mapbox-Lebenszyklus steuern
  useEffect(() => {
    if (loading) return;

    // Karte initialisieren
    const map = new mapboxgl.Map({
      container: "planning-fullscreen-map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [98.245, 8.642], 
      zoom: 11.5,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    const activeMarkers: mapboxgl.Marker[] = [];

    // Marker für gefilterte Auswahl auf der Karte rendern
    filteredSpots.forEach((spot) => {
      if (!spot.latitude || !spot.longitude) return;

      const spotCatName = spot.categories?.name || spot.category || "";
      const spotCategory = categoriesList.find(
        (item) => item.name === spotCatName
      );
      const localizedCategory = spotCategory?.displayName || spotCatName;
      const localizedTitle =
        language === "en" ? spot.title_en?.trim() || spot.title : spot.title;
      const localizedDescription =
        language === "en"
          ? spot.description_en?.trim() || spot.description
          : spot.description;
      const markerColor = spot.categories?.color || "#1e293b";

      // --- LUXUS-MARKER: LUCIDE-ICON IN REINES SVG WANDELN ---
      const iconName = spot.categories?.icon || "MapPin";
      const IconComponent =
        (LucideIcons as unknown as Record<string, LucideIcon>)[iconName] ||
        LucideIcons.MapPin;
      
      // Wandelt das React-Icon in einen reinen, sauberen HTML-SVG-String um (Weiß, 18px groß)
      const svgMarkup = renderToStaticMarkup(<IconComponent size={18} color="#ffffff" strokeWidth={2.5} />);

      // --- HTML-ELEMENT FÜR DEN MODERNEN KREIS-MARKER ERSTELLEN ---
      const el = document.createElement("div");
      el.className = "custom-luxury-vector-marker";
      el.style.backgroundColor = markerColor;
      el.style.width = "38px";
      el.style.height = "38px";
      el.style.borderRadius = "50%";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
      el.style.border = "2px solid #ffffff";
      el.style.cursor = "pointer";
      
      // WICHTIG: Verhindert das Springen nach oben links bei Größenänderungen
      el.style.transformOrigin = "center";
      el.style.transition = "all 0.2s ease";
      
      // Setzt das weiße Vektor-Icon direkt zentriert in die Mitte des Kreises
      el.innerHTML = svgMarkup;

      // Sicherer Hover-Effekt: Verändert width/height statt des CSS-Transforms, 
      // damit die Position auf der Karte bombenfest bleibt.
      el.addEventListener("mouseenter", () => {
        el.style.width = "44px";
        el.style.height = "44px";
        el.style.boxShadow = "0 6px 16px rgba(0,0,0,0.35)";
      });
      
      el.addEventListener("mouseleave", () => {
        el.style.width = "38px";
        el.style.height = "38px";
        el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
      });

      // Popup-HTML definieren
      const popupHTML = `
        <div style="font-family: 'Poppins', sans-serif; padding: 4px; max-width: 210px;">
          <img src="${spot.image_url}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 10px; margin-bottom: 8px;"/>
          <b style="font-size: 14px; display: block; color: #1e293b; margin-bottom: 2px;">${localizedTitle}</b>
          <div style="margin-bottom: 4px;">
            <span style="font-size: 10px; color: ${markerColor}; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${localizedCategory}</span>
          </div>
          <p style="font-size: 11px; color: #64748b; margin: 4px 0 8px 0; line-height: 1.4;">${localizedDescription || ""}</p>
          <a href="${localizePath(`/spot/${spot.slug}`, language)}" style="display: inline-block; background: #14b8a6; color: white; padding: 5px 12px; border-radius: 6px; font-size: 11px; text-decoration: none; font-weight: 700; width: 100%; text-align: center; box-sizing: border-box;">${copy.details}</a>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(popupHTML);

      // Marker mit dem Custom-HTML-Vektor-Kreis anstelle der Standard-Nadel hinzufügen
      const marker = new mapboxgl.Marker(el)
        .setLngLat([spot.longitude, spot.latitude])
        .setPopup(popup)
        .addTo(map);

      activeMarkers.push(marker);
    });

    // Cleanup bei Filter-Wechseln
    return () => {
      activeMarkers.forEach((m) => m.remove());
      map.remove();
    };
  }, [categoriesList, copy.details, filteredSpots, language, loading]);

  // Ladebildschirm
  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "'Poppins', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <Compass size={40} className="animate-spin" style={{ color: "#14b8a6", margin: "0 auto 12px auto" }} />
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>{copy.loading}</h2>
        </div>
      </div>
    );
  }

  return (
    <main style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", fontFamily: "'Poppins', sans-serif" }}>
      
      {/* MAP CONTAINER */}
      <div id="planning-fullscreen-map" style={{ width: "100%", height: "100%" }} />

      {/* SIDEBAR STRG BUTTON */}
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
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)"
        }}
      >
        <SlidersHorizontal size={16} />
        {isSidebarOpen ? copy.hideFilters : copy.showFilters}
      </button>

      {/* INTERAKTIVE FILTER SIDEBAR */}
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
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            overflowY: "auto"
          }}
        >
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b", margin: 0 }}>{copy.title}</h1>
            <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>{copy.intro}</p>
          </div>

          <hr style={{ border: 0, borderTop: "1px solid #e2e8f0", margin: 0 }} />

          {/* KATEGORIEN-LISTE */}
          <div>
            <label style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>{copy.categories}</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <button
                onClick={() => handleCategoryClick(ALL_CATEGORIES)}
                style={{
                  width: "100%", textAlign: "left", padding: "10px 14px",
                  borderRadius: "12px", border: "1px solid",
                  borderColor: selectedCategories.includes(ALL_CATEGORIES) ? "#14b8a6" : "#e2e8f0",
                  background: selectedCategories.includes(ALL_CATEGORIES) ? "#f0fdfa" : "#fff",
                  color: "#1e293b", fontWeight: 600, fontSize: "13px",
                  cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Compass size={16} color="#14b8a6" /> {copy.all}
                </span>
                {selectedCategories.includes(ALL_CATEGORIES) && <MapPin size={14} color="#14b8a6" />}
              </button>

              {categoriesList.map((cat) => {
                const catName = cat.name;
                const isSelected = selectedCategories.includes(catName);
                const color = cat.color || "#1e293b";

                return (
                  <button
                    key={catName}
                    onClick={() => handleCategoryClick(catName)}
                    style={{
                      width: cat.parent_id ? "calc(100% - 16px)" : "100%",
                      marginLeft: cat.parent_id ? "16px" : 0,
                      textAlign: "left",
                      padding: "10px 14px",
                      borderRadius: "12px",
                      border: "1px solid",
                      borderColor: isSelected ? color : "#e2e8f0",
                      background: isSelected ? "#f8fafc" : "#fff",
                      color: isSelected ? "#1e293b" : "#475569",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {/* Icon leuchtet in DB-Farbe, wenn aktiv */}
                      <div style={{ color: isSelected ? color : "#94a3b8", display: "flex", alignItems: "center" }}>
                        <DynamicSidebarIcon name={cat.icon || "MapPin"} />
                      </div>
                      <span>{cat.displayName}</span>
                    </div>
                    {isSelected && <MapPin size={14} style={{ color }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* BUDGET SCHIEBEREGLER */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", margin: 0 }}>{copy.budget}</label>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#14b8a6", background: "#f0fdfa", padding: "2px 8px", borderRadius: "6px" }}>{copy.level} {maxBudget}</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={maxBudget}
              onChange={(e) => setMaxBudget(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "#14b8a6", cursor: "pointer" }}
            />
          </div>

          <hr style={{ border: 0, borderTop: "1px solid #e2e8f0", margin: 0 }} />

          {/* TOUR STATS UNTEN */}
          <div style={{ marginTop: "auto", background: "#f8fafc", padding: "14px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Navigation size={18} color="#14b8a6" />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>
              {copy.spots
                .replace("{filtered}", String(filteredSpots.length))
                .replace("{total}", String(spots.length))}
            </span>
          </div>

        </div>
      )}
    </main>
  );
}
