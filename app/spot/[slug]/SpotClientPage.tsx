"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { getLanguage } from "@/src/lib/i18n";
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
import { t, getTranslations } from "@/src/lib/translations";
import SpotHero from "@/src/components/spot/SpotHero";
import SpotGallery from "@/src/components/spot/SpotGallery";
import SpotDescription from "@/src/components/spot/SpotDescription";
import {
  getLocalizedConfigField,
  getLocalizedField,
  parseDescriptionBlocks,
} from "@/src/lib/spot/localization";
import type { SpotClientPageProps } from "@/src/types/spot";

export default function SpotClientPage({
  initialSpot,
  initialRandomSpots,
}: SpotClientPageProps) {
  const [spot, setSpot] = useState<any>(initialSpot);
  const [gallery, setGallery] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [routeDist, setRouteDist] = useState<string | null>(null);
  const [routeTime, setRouteTime] = useState<number | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
  const [tours, setTours] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [randomSpots, setRandomSpots] = useState<any[]>(initialRandomSpots);
  const scrollRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const language = getLanguage({
    lng: searchParams.get("lng") ?? undefined,
  });

  const translations = getTranslations(language);
  const nearbyRadiusKm = 0.5;

  const localizedHref = (path: string) => {
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}lng=${language}`;
  };

  // NEUE STATES FÜR DIE UMGEBUNGS-SPOTS (NUR FÜR STRÄNDE)
  const [nearbySpots, setNearbySpots] = useState<any[]>([]);
  const nearbyScrollRef = useRef<HTMLDivElement>(null);

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

  // HELPER: Gibt die Distanz als reine Zahl für mathematische Filter zurück
  const getRawDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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

        // NEU: Wenn es ein Strand ist, laden wir Gastro, Strandbars & Hotels im Umkreis
        if (spot.category && spot.category.toLowerCase() === "strand" && spot.latitude && spot.longitude) {
          const { data: candidates } = await supabase
            .from("spots")
            .select("*")
            .in("category", ["Restaurants", "Strandbars", "Hotel", "Hotels", "Restaurant"])
            .not("id", "eq", spot.id);

          if (candidates) {
            const filtered = candidates.filter((c) => {
              if (!c.latitude || !c.longitude) return false;
              const dist = getRawDistance(spot.latitude, spot.longitude, c.latitude, c.longitude);
              return dist <= nearbyRadiusKm;
            });
            setNearbySpots(filtered);
          }
        }

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
  }, [spot?.id]);

  const toggleFavorite = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return alert(t(language, "loginRequired"));

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

  const scrollNearby = (direction: "left" | "right") => {
    if (nearbyScrollRef.current) {
      const amount = 300;
      nearbyScrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  if (!spot) {
    return (
      <main style={{ padding: 40, textAlign: "center", minHeight: "100vh" }}>
        {t(language, "loadingSpot")}
      </main>
    );
  }

  const localizedTitle =
    getLocalizedField(spot, "title", language) || spot.title;
  const localizedDescription =
    getLocalizedField(spot, "description", language) || spot.description;
  const localizedCategory =
    getLocalizedField(spot, "category", language) || spot.category;

  const descArray = parseDescriptionBlocks(
    getLocalizedField(spot, "long_description", language)
  );

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

  // HELPER: Prüft, ob es sich um Gastronomie handelt
  const isFoodCategory = 
    spot.category?.toLowerCase() === "restaurants" || 
    spot.category?.toLowerCase() === "restaurant" || 
    spot.category?.toLowerCase() === "strandbars" ||
    spot.category?.toLowerCase() === "strandbar";

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
        <SpotHero
          spot={spot}
          language={language}
          title={localizedTitle}
          description={localizedDescription}
          category={localizedCategory}
          backHref={localizedHref("/entdecken")}
        />

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
            <SpotGallery
              gallery={gallery}
              title={localizedTitle}
              language={language}
            />

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
                        {String(
                          getLocalizedConfigField(f, "label", language) || ""
                        ).toUpperCase()}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>
                        {getLocalizedConfigField(f, "value", language) || "-"}
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
                  {t(language, "bestTravelTime")}
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, 1fr)",
                    gap: "8px",
                  }}
                >
                  {translations.months.map((m, i) => (
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
                    {t(language, "location")}
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

              <SpotDescription
                title={localizedTitle}
                blocks={descArray}
                language={language}
              />

              {/* NEU: DIREKTE UMGEBUNGS-EMPFEHLUNGEN (WENN DER SPOT EIN STRAND IST) */}
              {spot.category && spot.category.toLowerCase() === "strand" && nearbySpots.length > 0 && (
                <div style={{ marginTop: 20, width: "100%", position: "relative" }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
                    {t(language, "nearbyWithin").replace(
                      "{distance}",
                      String(Math.round(nearbyRadiusKm * 1000))
                    )}
                  </h2>
                  <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px 0" }}>
                    {t(language, "nearbyDescription")}
                  </p>

                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <button
                      type="button"
                      aria-label={t(language, "scrollLeft")}
                      onClick={() => scrollNearby("left")}
                      style={{
                        position: "absolute",
                        left: -20,
                        zIndex: 10,
                        background: "white",
                        padding: 10,
                        borderRadius: "50%",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                        cursor: "pointer",
                        border: "none"
                      }}
                    >
                      <ChevronLeft />
                    </button>

                    <div
                      ref={nearbyScrollRef}
                      style={{
                        display: "flex",
                        gap: 20,
                        overflowX: "hidden",
                        scrollBehavior: "smooth",
                        width: "100%",
                      }}
                    >
                      {nearbySpots.map((s, i) => {
                        const distToSpot = calculateDistance(
                          spot.latitude,
                          spot.longitude,
                          s.latitude,
                          s.longitude
                        );

                        return (
                          <Link
                            key={i}
                            href={localizedHref(`/spot/${s.slug}`)}
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
                                  alt={getLocalizedField(s, "title", language) || s.title}
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
                                  {getLocalizedField(s, "category", language) || s.category}
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
                                  {getLocalizedField(s, "title", language) || s.title}
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
                                  {getLocalizedField(s, "description", language) || s.description}
                                </p>

                                <div
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: "#14b8a6",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  <MapPin size={12} />
                                  <span>
                                    {t(language, "metersAway").replace(
                                      "{distance}",
                                      String(
                                        Math.round(
                                          parseFloat(distToSpot || "0") * 1000
                                        )
                                      )
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      aria-label={t(language, "scrollRight")}
                      onClick={() => scrollNearby("right")}
                      style={{
                        position: "absolute",
                        right: -20,
                        zIndex: 10,
                        background: "white",
                        padding: 10,
                        borderRadius: "50%",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                        cursor: "pointer",
                        border: "none"
                      }}
                    >
                      <ChevronRight />
                    </button>
                  </div>
                </div>
              )}

              {/* WEITERE ENTDECKUNGEN */}
              <div style={{ marginTop: 40, width: "100%", position: "relative" }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>
                  {t(language, "moreDiscoveries")}
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
                      border: "none",
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
                          href={localizedHref(`/spot/${s.slug}`)}
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
                                {getLocalizedField(s, "category", language) || s.category}
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
                                {getLocalizedField(s, "title", language) || s.title}
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
                                {getLocalizedField(s, "description", language) || s.description}
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
                                <span>
                                  {t(language, "kilometersFromHere").replace(
                                    "{distance}",
                                    distToSpot || "0"
                                  )}
                                </span>
                                {distToHotel && (
                                  <span>
                                    {t(language, "kilometersFromHotel").replace(
                                      "{distance}",
                                      distToHotel
                                    )}
                                  </span>
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
                  href={localizedHref(`/editor/edit/${spot.id}`)}
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
                  ✏️ {t(language, "editSpot")}
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
                  {t(language, "spotInformation")}
                </h3>

                <button
                  type="button"
                  aria-label={
                    isFavorite
                      ? t(language, "removeFromFavorites")
                      : t(language, "addToFavorites")
                  }
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
                  <InfoItem icon={<Tag size={16} />} label={t(language, "category")} value={localizedCategory} />
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
                        {t(language, "officialCategory")}
                        <HelpCircle size={12} className="text-slate-400 cursor-help" />
                      </span>

                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#334155",
                        }}
                      >
                        {spot.stars} {t(language, "stars")}
                      </span>
                    </div>

                    <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50 transition-all opacity-0 group-hover:opacity-100 font-medium leading-relaxed">
                      {t(language, "officialCategoryTooltip")}
                    </div>
                  </div>
                )}

                <InfoItem
                  icon={<Navigation size={16} />}
                  label={t(language, "drivingDistance")}
                  value={
                    isRouting ? (
                      "..."
                    ) : routeDist ? (
                      `${routeDist} km (${routeTime} ${t(language, "minutesShort")})`
                    ) : (
                      <Link href={localizedHref("/profile")} className="text-teal-600 underline font-bold">
                        {t(language, "setHotel")}
                      </Link>
                    )
                  }
                />

                {/* MODIFIZIERTER PREIS- / CHANG-INDEX BEREICH MIT HELP-TOOLTIP */}
                {spot.price_level !== undefined && spot.price_level !== null && spot.price_level.toString().trim() !== "" && (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        color: "#14b8a6",
                        background: "#f0fdfa",
                        padding: "8px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {isFoodCategory ? (
                        <img src="/icons/bottle.svg" alt="Chang" style={{ width: 16, height: 16, objectFit: "contain" }} />
                      ) : (
                        <DollarSign size={16} />
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span
                        className="flex items-center gap-1 group relative"
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                        }}
                      >
                        {isFoodCategory ? t(language, "changIndex") : t(language, "budget")}
                        <HelpCircle size={12} className="text-slate-400 cursor-help ml-0.5" />
                        
                        {/* TOOLTIP ON HOVER */}
                        <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50 transition-all opacity-0 group-hover:opacity-100 font-medium normal-case tracking-normal leading-relaxed">
                          {isFoodCategory 
                            ? t(language, "changIndexTooltip")
                            : t(language, "budgetTooltip")
                          }
                        </div>
                      </span>

                      {isFoodCategory ? (
                        <div style={{ display: "flex", gap: "4px", alignItems: "center", marginTop: "2px" }}>
                          {Array.from({ length: 5 }).map((_, index) => {
                            const currentLevel = parseInt(spot.price_level) || 0;
                            const isFilled = index < currentLevel;

                            return (
                              <img
                                key={index}
                                src="/icons/bottle.svg"
                                alt={t(language, "bottle")}
                                style={{ 
                                  width: 10, 
                                  height: 22, 
                                  objectFit: "contain",
                                  filter: isFilled ? "none" : "grayscale(100%)",
                                  opacity: isFilled ? 1 : 0.25
                                }}
                              />
                            );
                          })}
                          <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "4px", fontWeight: 600 }}>
                            ({spot.price_level}/5)
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                          {spot.price_level} / 5
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {spot.opening_hours && spot.opening_hours.trim() !== "" && (
                  <InfoItem
                    icon={<Clock size={16} />}
                    label={t(language, "openingHours")}
                    value={
                      getLocalizedField(spot, "opening_hours", language) ||
                      spot.opening_hours
                    }
                  />
                )}

                {spot.best_time && spot.best_time.trim() !== "" && (
                  <InfoItem
                    icon={<Sun size={16} />}
                    label={t(language, "bestVisitTime")}
                    value={
                      getLocalizedField(spot, "best_time", language) ||
                      spot.best_time
                    }
                  />
                )}

                {spot.parking_info?.name && spot.parking_info.name.trim() !== "" && (
                  <>
                    <InfoItem
                      icon={<Car size={16} />}
                      label={t(language, "parking")}
                      value={
                        getLocalizedConfigField(
                          spot.parking_info,
                          "name",
                          language
                        ) || spot.parking_info.name
                      }
                    />

                    {spot.parking_info.price && spot.parking_info.price.trim() !== "" && (
                      <InfoItem
                        icon={<DollarSign size={16} />}
                        label={t(language, "parkingCost")}
                        value={
                          getLocalizedConfigField(
                            spot.parking_info,
                            "price",
                            language
                          ) || spot.parking_info.price
                        }
                      />
                    )}

                    {spot.parking_info.details && spot.parking_info.details.trim() !== "" && (
                      <InfoItem
                        icon={<MapPin size={16} />}
                        label={t(language, "details")}
                        value={
                          getLocalizedConfigField(
                            spot.parking_info,
                            "details",
                            language
                          ) || spot.parking_info.details
                        }
                      />
                    )}
                  </>
                )}
              </div>

              {/* PREMIUM BUTTONS */}
              <PremiumActionButton
                href={`https://www.google.com/maps/dir/?api=1&${
                  hotelLat && hotelLng
                    ? `origin=${hotelLat},${hotelLng}&`
                    : ""
                }destination=${
                  spot.parking_info?.lat || spot.latitude
                },${
                  spot.parking_info?.lng || spot.longitude
                }&travelmode=driving`}
                icon={<Navigation size={22} />}
                title={t(language, "startRoute")}
                subtitle={t(language, "openInGoogleMaps")}
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
                  title={t(language, "youtubeVideo")}
                  subtitle={t(language, "watchSpotVideo")}
                  variant="red"
                />
              )}

              {spot.tour_link && (
                <PremiumActionButton
                  href={`${spot.tour_link}${spot.tour_link.includes("?") ? "&" : "?"}partner_id=JAPXTFH`}
                  icon={<Sparkles size={22} />}
                  title={`${t(language, "tourRecommendations")}*`}
                  subtitle={t(language, "discoverExcursions")}
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
                  <MapPin size={16} /> {t(language, "bookAccommodation")}*
                </a>
              )}

              <a
                href={`mailto:admin@khaolak.app?subject=${encodeURIComponent(
                  t(language, "changeSuggestionSubject").replace(
                    "{title}",
                    localizedTitle
                  )
                )}`}
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
                <AlertCircle size={16} /> {t(language, "reportChange")}
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
                  *{t(language, "affiliateLinksNotice")}
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
                    {t(language, "excursionsActivities")}
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