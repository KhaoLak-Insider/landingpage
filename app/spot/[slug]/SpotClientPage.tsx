"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/src/lib/supabase";
import MapBoxMini from "@/src/components/MapBoxMini";
import {
  MapPin,
  Tag,
  Navigation,
  DollarSign,
  Clock,
  Car,
  Play,
  AlertCircle,
  Sparkles,
  Sun,
  Heart,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { iconMap } from "@/src/components/IconLibrary";
import Link from "next/link";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface SpotClientPageProps {
  initialSpot: any;
  initialRandomSpots: any[];
}

export default function SpotClientPage({
  initialSpot,
  initialRandomSpots,
}: SpotClientPageProps) {
  const [spot, setSpot] = useState<any>(initialSpot);
  const [gallery, setGallery] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [routeDist, setRouteDist] = useState<string | null>(null);
  const [routeTime, setRouteTime] = useState<number | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
  const [tours, setTours] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [randomSpots, setRandomSpots] = useState<any[]>(initialRandomSpots);
  const scrollRef = useRef<HTMLDivElement>(null);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  };

  const fetchDrivingDistance = async (
    start: { lat: number; lng: number },
    end: { lat: number; lng: number }
  ) => {
    setIsRouting(true);
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?access_token=${token}&geometries=geojson&overview=full`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        setRouteDist((data.routes[0].distance / 1000).toFixed(1));
        setRouteTime(Math.round(data.routes[0].duration / 60));
        setRouteGeoJSON(data.routes[0].geometry);
      }
    } catch (e) {
      console.error("Routing Fehler:", e);
    } finally {
      setIsRouting(false);
    }
  };

  useEffect(() => {
    async function initPage() {
      window.scrollTo(0, 0);

      if (spot) {
        let parsedGallery = [];

        if (spot.gallery_urls) {
          try {
            parsedGallery = Array.isArray(spot.gallery_urls)
              ? spot.gallery_urls
              : JSON.parse(spot.gallery_urls);
          } catch (e) {
            parsedGallery = [];
          }
        }

        setGallery(parsedGallery);

        fetch(`/api/tours?location=${spot.title}`)
          .then((res) => res.json())
          .then((data) => setTours(data.result || []))
          .catch((e) => console.error("Tour Ladefehler:", e));

        const {
          data: { user: userData },
        } = await supabase.auth.getUser();

        if (userData) {
          const { data: fav } = await supabase
            .from("favorites")
            .select("id")
            .eq("spot_id", spot.id)
            .eq("user_id", userData.id)
            .maybeSingle();

          if (fav) setIsFavorite(true);

          const { data: profileData } = await supabase
            .from("profiles")
            .select("role, hotel_id, custom_hotel_lat, custom_hotel_lng, hotels(lat, lng)")
            .eq("id", userData.id)
            .maybeSingle();

          setUserProfile(profileData);

          const hotelData = Array.isArray(profileData?.hotels)
            ? profileData.hotels[0]
            : (profileData?.hotels as any);

          const hLat = profileData?.hotel_id
            ? hotelData?.lat
            : profileData?.custom_hotel_lat;

          const hLng = profileData?.hotel_id
            ? hotelData?.lng
            : profileData?.custom_hotel_lng;

          if (hLat && hLng) {
            fetchDrivingDistance(
              { lat: hLat, lng: hLng },
              { lat: spot.latitude, lng: spot.longitude }
            );
          }
        }
      }
    }

    initPage();
  }, [initialSpot]);

  const toggleFavorite = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return alert("Bitte logge dich ein.");

    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("spot_id", spot.id)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("favorites")
        .insert([{ spot_id: spot.id, user_id: user.id }]);
    }

    setIsFavorite(!isFavorite);
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  if (!spot) {
    return (
      <main style={{ padding: 40, textAlign: "center", minHeight: "100vh" }}>
        Spot wird geladen....
      </main>
    );
  }

  const slides = gallery.map((url: string) => ({ src: url }));

  const descArray = Array.isArray(spot.long_description)
    ? spot.long_description
    : [];

  const visibleBlocks = descArray.slice(0, 2);
  const hiddenBlocks = descArray.slice(2);

  const hotelLat =
    userProfile?.custom_hotel_lat ||
    (Array.isArray(userProfile?.hotels)
      ? userProfile?.hotels?.[0]?.lat
      : userProfile?.hotels?.lat);

  const hotelLng =
    userProfile?.custom_hotel_lng ||
    (Array.isArray(userProfile?.hotels)
      ? userProfile?.hotels?.[0]?.lng
      : userProfile?.hotels?.lng);

  return (
    <main
      style={{
        background: "#f6f7fb",
        minHeight: "100vh",
        fontFamily: "'Poppins', sans-serif",
        paddingBottom: 60,
        color: "#1e293b",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          background: "#ffffff",
          minHeight: "100vh",
          boxShadow: "0 0 20px rgba(0,0,0,0.05)",
          overflow: "visible",
        }}
      >
        {/* HERO */}
        <div style={{ position: "relative", width: "100%", height: "450px" }}>
          <img
            src={spot.image_url}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />

          {spot.image_url?.includes("google") && (
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                left: "10px",
                fontSize: "10px",
                color: "rgba(255,255,255,0.7)",
                background: "rgba(0,0,0,0.3)",
                padding: "2px 6px",
                borderRadius: "4px",
                zIndex: 10,
              }}
            >
              Powered by Google
            </div>
          )}

          <Link
            href="/entdecken"
            style={{
              position: "absolute",
              top: "30px",
              left: "30px",
              zIndex: 20,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.9)",
              padding: "10px 20px",
              borderRadius: "50px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#333",
              textDecoration: "none",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            <ChevronLeft size={16} />
            Zurück zu allen Spots
          </Link>

          <div
            style={{
              position: "absolute",
              bottom: "40px",
              left: "40px",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              alignItems: "flex-start",
              maxWidth: "calc(100% - 400px)",
            }}
          >
            <div
              style={{
                background: "#14b8a6",
                color: "#fff",
                padding: "6px 16px",
                borderRadius: "50px",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
                width: "fit-content",
              }}
            >
              {spot.category}
            </div>

            <h1
              style={{
                color: "#fff",
                fontSize: 48,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                margin: 0,
                textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              }}
            >
              {spot.title}
            </h1>

            <p
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: 300,
                margin: 0,
                opacity: 0.9,
                textShadow: "0 1px 5px rgba(0,0,0,0.5)",
              }}
            >
              {spot.description}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "40px",
            padding: "40px",
            alignItems: "start",
          }}
        >
          {/* MAIN COLUMN */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* GALERIE */}
            {gallery.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "10px",
                  marginBottom: "40px",
                }}
              >
                {gallery.slice(0, 3).map((url: string, i: number) => (
                  <div
                    key={i}
                    onClick={() => {
                      setIndex(i);
                      setOpen(true);
                    }}
                    style={{
                      height: "120px",
                      borderRadius: "12px",
                      overflow: "hidden",
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    <img
                      src={url}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />

                    {url.includes("google") && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "4px",
                          right: "4px",
                          fontSize: "8px",
                          color: "white",
                          background: "rgba(0,0,0,0.5)",
                          padding: "1px 4px",
                          borderRadius: "2px",
                        }}
                      >
                        Google
                      </div>
                    )}
                  </div>
                ))}

                <div
                  onClick={() => {
                    setIndex(3);
                    setOpen(true);
                  }}
                  style={{
                    height: "120px",
                    borderRadius: "12px",
                    background: "#1f2937",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                    {gallery.length > 3 ? `+${gallery.length - 3}` : "Mehr"}
                  </span>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              {/* FEATURES */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                }}
              >
                {spot.details_config?.features?.map((f: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      background: "#f9fafb",
                      padding: "10px",
                      borderRadius: "12px",
                      border: "1px solid #e5e5e5",
                    }}
                  >
                    <div style={{ color: "#14b8a6" }}>{getIcon(f.icon)}</div>
                    <div>
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          color: "#94a3b8",
                        }}
                      >
                        {(f.label || "").toUpperCase()}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>
                        {f.value || "-"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* REISEZEIT */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 24,
                  padding: "20px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              >
                <h3
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    marginBottom: 16,
                  }}
                >
                  Beste Reisezeit
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, 1fr)",
                    gap: "8px",
                  }}
                >
                  {[
                    "Januar",
                    "Februar",
                    "März",
                    "April",
                    "Mai",
                    "Juni",
                    "Juli",
                    "August",
                    "September",
                    "Oktober",
                    "November",
                    "Dezember",
                  ].map((m, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "10px 0",
                        borderRadius: "8px",
                        textAlign: "center",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: spot.best_months?.includes(i)
                          ? "#14b8a6"
                          : "#f1f5f9",
                        color: spot.best_months?.includes(i)
                          ? "#fff"
                          : "#94a3b8",
                      }}
                    >
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* LAGE */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 24,
                  padding: "20px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "20px",
                  }}
                >
                  <MapPin size={22} color="#14b8a6" />
                  <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                    Lage
                  </h2>
                </div>

                <div style={{ height: 300, borderRadius: 16, overflow: "hidden" }}>
                  <MapBoxMini
                    lat={spot.latitude}
                    lng={spot.longitude}
                    route={routeGeoJSON}
                  />
                </div>
              </div>

              {/* BESCHREIBUNG */}
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: "20px" }}>
                  Über {spot.title}
                </h2>

                {visibleBlocks.map((block: any, i: number) => (
                  <div key={i}>
                    {block.type === "heading" ? (
                      <h3
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          marginTop: "24px",
                          marginBottom: "12px",
                        }}
                      >
                        {block.content}
                      </h3>
                    ) : (
                      <p
                        style={{
                          color: "#475569",
                          lineHeight: 1.8,
                          fontSize: "15px",
                          marginBottom: "16px",
                        }}
                      >
                        {block.content}
                      </p>
                    )}
                  </div>
                ))}

                {isExpanded &&
                  hiddenBlocks.map((block: any, i: number) => (
                    <div key={`extra-${i}`}>
                      {block.type === "heading" ? (
                        <h3
                          style={{
                            fontSize: 20,
                            fontWeight: 700,
                            marginTop: "24px",
                            marginBottom: "12px",
                          }}
                        >
                          {block.content}
                        </h3>
                      ) : (
                        <p
                          style={{
                            color: "#475569",
                            lineHeight: 1.8,
                            fontSize: "15px",
                            marginBottom: "16px",
                        }}
                        >
                          {block.content}
                        </p>
                      )}
                    </div>
                  ))}

                {hiddenBlocks.length > 0 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                      color: "#14b8a6",
                      fontWeight: 700,
                      fontSize: "15px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    {isExpanded ? "Weniger erfahren" : "Mehr erfahren..."}
                  </button>
                )}
              </div>

              {/* WEITERE ENTDECKUNGEN */}
              <div style={{ marginTop: 40, width: "100%", position: "relative" }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>
                  Weitere Entdeckungen
                </h2>

                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <button
                    onClick={() => scroll("left")}
                    style={{
                      position: "absolute",
                      left: -20,
                      zIndex: 10,
                      background: "white",
                      padding: 10,
                      borderRadius: "50%",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                      cursor: "pointer",
                    }}
                  >
                    <ChevronLeft />
                  </button>

                  <div
                    ref={scrollRef}
                    style={{
                      display: "flex",
                      gap: 20,
                      overflowX: "hidden",
                      scrollBehavior: "smooth",
                      width: "100%",
                    }}
                  >
                    {randomSpots.map((s, i) => {
                      const hotelData = Array.isArray(userProfile?.hotels)
                        ? userProfile.hotels[0]
                        : (userProfile?.hotels as any);

                      const hLat = userProfile?.hotel_id
                        ? hotelData?.lat
                        : userProfile?.custom_hotel_lat;

                      const hLng = userProfile?.hotel_id
                        ? hotelData?.lng
                        : userProfile?.custom_hotel_lng;

                      const distToSpot = calculateDistance(
                        spot.latitude,
                        spot.longitude,
                        s.latitude,
                        s.longitude
                      );

                      const distToHotel =
                        hLat && hLng
                          ? calculateDistance(hLat, hLng, s.latitude, s.longitude)
                          : null;

                      return (
                        <Link
                          key={i}
                          href={`/spot/${s.slug}`}
                          style={{
                            textDecoration: "none",
                            flex: "0 0 calc(33.333% - 14px)",
                            minWidth: "calc(33.333% - 14px)",
                          }}
                        >
                          <div
                            style={{
                              background: "#fff",
                              borderRadius: 16,
                              overflow: "hidden",
                              border: "1px solid #e5e5e5",
                            }}
                          >
                            <div style={{ height: 160, position: "relative" }}>
                              <img
                                src={s.image_url}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />

                              <div
                                style={{
                                  position: "absolute",
                                  top: 10,
                                  left: 10,
                                  background: "rgba(20, 184, 166, 0.9)",
                                  color: "white",
                                  padding: "4px 10px",
                                  borderRadius: 20,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  letterSpacing: "1px",
                                }}
                              >
                                {s.category}
                              </div>
                            </div>

                            <div style={{ padding: 16 }}>
                              <h3
                                style={{
                                  fontSize: 16,
                                  fontWeight: 700,
                                  color: "#1e293b",
                                  margin: "0 0 8px 0",
                                }}
                              >
                                {s.title}
                              </h3>

                              <p
                                style={{
                                  fontSize: 12,
                                  color: "#64748b",
                                  margin: "0 0 12px 0",
                                  height: 36,
                                  overflow: "hidden",
                                }}
                              >
                                {s.description}
                              </p>

                              <div
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: "#14b8a6",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 2,
                                }}
                              >
                                <span>{distToSpot} km von hier</span>
                                {distToHotel && (
                                  <span>{distToHotel} km von Deiner Unterkunft</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => scroll("right")}
                    style={{
                      position: "absolute",
                      right: -20,
                      zIndex: 10,
                      background: "white",
                      padding: 10,
                      borderRadius: "50%",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                      cursor: "pointer",
                    }}
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside
            style={{
              width: 320,
              position: "sticky",
              top: "20px",
              marginTop: "-430px",
              alignSelf: "start",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: 24,
                padding: "32px",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
                border: "1px solid #f1f5f9",
              }}
            >
              {(userProfile?.role === "admin" || userProfile?.role === "editor") && (
                <Link
                  href={`/editor/edit/${spot.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    width: "100%",
                    marginBottom: 32,
                    padding: "12px",
                    background: "#f1f5f9",
                    borderRadius: 14,
                    fontWeight: 700,
                    color: "#e11d48",
                    textDecoration: "none",
                    border: "1px solid #e11d48",
                  }}
                >
                  ✏️ Spot bearbeiten
                </Link>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 32,
                }}
              >
                <h3
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    margin: 0,
                  }}
                >
                  Spot Informationen
                </h3>

                <button
                  onClick={toggleFavorite}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: isFavorite ? "#ef4444" : "#cbd5e1",
                  }}
                >
                  <Heart size={24} fill={isFavorite ? "#ef4444" : "none"} />
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 24,
                  marginBottom: 40,
                }}
              >
                {spot.category && (
                  <InfoItem icon={<Tag size={16} />} label="Kategorie" value={spot.category} />
                )}

                {spot.stars && (
                  <div className="group relative flex items-center gap-[12px]">
                    <div
                      style={{
                        color: "#14b8a6",
                        background: "#f0fdfa",
                        padding: "8px",
                        borderRadius: "8px",
                      }}
                    >
                      <Sparkles size={16} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span
                        className="flex items-center gap-1"
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                        }}
                      >
                        Landeskategorie
                        <HelpCircle size={12} className="text-slate-400 cursor-help" />
                      </span>

                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#334155",
                        }}
                      >
                        {spot.stars} Sterne
                      </span>
                    </div>

                    <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50 transition-all opacity-0 group-hover:opacity-100 font-medium leading-relaxed">
                      Diese Sternebewertung basiert auf der offiziellen Landeskategorie vor
                      Ort und kann von der deutschen Hotelklassifizierung abweichen.
                    </div>
                  </div>
                )}

                <InfoItem
                  icon={<Navigation size={16} />}
                  label="Fahrtweg"
                  value={
                    isRouting ? (
                      "..."
                    ) : routeDist ? (
                      `${routeDist} km (${routeTime} Min.)`
                    ) : (
                      <Link href="/profile" className="text-teal-600 underline font-bold">
                        Hotel festlegen
                      </Link>
                    )
                  }
                />

                {/* HIER DIE REINE ABSICHERUNG: Wir wandeln spot.price_level vor dem Check in einen String um */}
                {spot.price_level !== undefined && spot.price_level !== null && spot.price_level.toString().trim() !== "" && (
                  <InfoItem
                    icon={<DollarSign size={16} />}
                    label="Budget"
                    value={spot.price_level.toString()}
                  />
                )}

                {spot.opening_hours && spot.opening_hours.trim() !== "" && (
                  <InfoItem
                    icon={<Clock size={16} />}
                    label="Öffnungszeiten"
                    value={spot.opening_hours}
                  />
                )}

                {spot.best_time && spot.best_time.trim() !== "" && (
                  <InfoItem
                    icon={<Sun size={16} />}
                    label="Beste Besuchszeit"
                    value={spot.best_time}
                  />
                )}

                {spot.parking_info?.name && spot.parking_info.name.trim() !== "" && (
                  <>
                    <InfoItem
                      icon={<Car size={16} />}
                      label="Parkplatz"
                      value={spot.parking_info.name}
                    />

                    {spot.parking_info.price && spot.parking_info.price.trim() !== "" && (
                      <InfoItem
                        icon={<DollarSign size={16} />}
                        label="Parkkosten"
                        value={spot.parking_info.price}
                      />
                    )}

                    {spot.parking_info.details && spot.parking_info.details.trim() !== "" && (
                      <InfoItem
                        icon={<MapPin size={16} />}
                        label="Details"
                        value={spot.parking_info.details}
                      />
                    )}
                  </>
                )}
              </div>

              {/* PREMIUM BUTTONS */}
              <PremiumActionButton
                href={`https://www.google.com/maps/dir/?api=1&origin=${hotelLat},${hotelLng}&destination=${spot.parking_info?.lat || spot.latitude},${spot.parking_info?.lng || spot.longitude}&travelmode=driving`}
                icon={<Navigation size={22} />}
                title="Route starten"
                subtitle="In Google Maps öffnen"
                variant="navy"
              />

              {spot.youtube_url && (
                <PremiumActionButton
                  href={
                    spot.youtube_url.includes("?")
                      ? `${spot.youtube_url}&t=${spot.youtube_timestamp || 0}`
                      : `${spot.youtube_url}?t=${spot.youtube_timestamp || 0}`
                  }
                  icon={<Play size={22} fill="white" />}
                  title="YouTube Video"
                  subtitle="Video zum Spot ansehen"
                  variant="red"
                />
              )}

              {spot.tour_link && (
                <PremiumActionButton
                  href={`${spot.tour_link}${spot.tour_link.includes("?") ? "&" : "?"}partner_id=JAPXTFH`}
                  icon={<Sparkles size={22} />}
                  title="Tourempfehlungen*"
                  subtitle="Passende Ausflüge entdecken"
                  variant="orange"
                />
              )}

              {spot.booking_link && (
                <a
                  href={
                    spot.booking_link.startsWith("http")
                      ? spot.booking_link
                      : `https://${spot.booking_link}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginTop: "12px",
                    width: "100%",
                    padding: "14px",
                    background: "#003580",
                    color: "#fff",
                    borderRadius: 14,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    textDecoration: "none",
                  }}
                >
                  <MapPin size={16} /> Unterkunft buchen*
                </a>
              )}

              <a
                href={`mailto:admin@khaolak.app?subject=Änderungsvorschlag für ${spot.title}`}
                style={{
                  marginTop: "12px",
                  width: "100%",
                  padding: "14px",
                  background: "#f1f5f9",
                  color: "#475569",
                  borderRadius: 14,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  textDecoration: "none",
                }}
              >
                <AlertCircle size={16} /> Änderung melden
              </a>

              {(spot.tour_link || spot.booking_link) && (
                <p
                  style={{
                    fontSize: "10px",
                    color: "#94a3b8",
                    marginTop: "16px",
                    textAlign: "center",
                  }}
                >
                  *enthält Affiliate-Links
                </p>
              )}

              {tours.length > 0 && (
                <div style={{ marginTop: "24px" }}>
                  <h3
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      marginBottom: 12,
                    }}
                  >
                    Ausflüge & Aktivitäten
                  </h3>

                  {tours.slice(0, 3).map((tour: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        marginBottom: "10px",
                        padding: "10px",
                        border: "1px solid #e5e5e5",
                        borderRadius: "10px",
                      }}
                    >
                      <p style={{ fontSize: "13px", fontWeight: 600 }}>
                        {tour.title}
                      </p>
                      <p style={{ fontSize: "12px", color: "#14b8a6" }}>
                        {tour.price} {tour.currency}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        index={index}
        on={{ view: ({ index: i }) => setIndex(i) }}
      />
    </main>
  );
}

function PremiumActionButton({
  href,
  icon,
  title,
  subtitle,
  variant,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  variant: "navy" | "red" | "orange";
}) {
  const styles = {
    navy: {
      bg: "linear-gradient(135deg, #172554 0%, #0f172a 100%)",
      iconBg: "rgba(255,255,255,0.10)",
      shadow: "0 14px 26px rgba(15, 23, 42, 0.22)",
    },
    red: {
      bg: "linear-gradient(135deg, #ff4d4d 0%, #dc2626 100%)",
      iconBg: "rgba(255,255,255,0.14)",
      shadow: "0 14px 26px rgba(220, 38, 38, 0.22)",
    },
    orange: {
      bg: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
      iconBg: "rgba(255,255,255,0.16)",
      shadow: "0 14px 26px rgba(249, 115, 22, 0.24)",
    },
  }[variant];

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        marginTop: "12px",
        width: "100%",
        minHeight: "72px",
        padding: "14px 16px",
        background: styles.bg,
        color: "#fff",
        borderRadius: 20,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        gap: 14,
        textDecoration: "none",
        boxShadow: styles.shadow,
        border: "1px solid rgba(255,255,255,0.18)",
      }}
    >
      <span
        style={{
          width: 46,
          height: 46,
          borderRadius: "50%",
          background: styles.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </span>

      <span
        style={{
          display: "flex",
          flexDirection: "column",
          lineHeight: 1.2,
          flex: 1,
        }}
      >
        <span style={{ fontSize: 16 }}>{title}</span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 500,
            opacity: 0.78,
            marginTop: 4,
          }}
        >
          {subtitle}
        </span>
      </span>

      <ArrowRight size={22} strokeWidth={2.5} />
    </a>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div
        style={{
          color: "#14b8a6",
          background: "#f0fdfa",
          padding: "8px",
          borderRadius: "8px",
        }}
      >
        {icon}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#94a3b8",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>

        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function getIcon(name: string) {
  const IconComponent = iconMap[name as keyof typeof iconMap];
  return IconComponent ? <IconComponent size={18} /> : <MapPin size={18} />;
}