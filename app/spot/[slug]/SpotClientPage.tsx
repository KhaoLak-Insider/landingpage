"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { getLanguage } from "@/src/lib/i18n";
import MapBoxMini from "@/src/components/MapBoxMini";
import {
  MapPin,
} from "lucide-react";
import { iconMap } from "@/src/components/IconLibrary";
import Link from "next/link";
import { t, getTranslations } from "@/src/lib/translations";
import SpotHero from "@/src/components/spot/SpotHero";
import SpotGallery from "@/src/components/spot/SpotGallery";
import SpotDescription from "@/src/components/spot/SpotDescription";
import SpotSidebar from "@/src/components/spot/SpotSidebar";
import NearbySpots from "@/src/components/spot/NearbySpots";
import MoreDiscoveries from "@/src/components/spot/MoreDiscoveries";
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

        // Wenn es ein Strand ist, laden wir passende Spots im direkten Umkreis.
        const normalizedSpotCategory = String(spot.category || "")
          .trim()
          .toLowerCase()
          .replace(/ä/g, "ae")
          .replace(/ö/g, "oe")
          .replace(/ü/g, "ue")
          .replace(/ß/g, "ss");

        const isBeachCategory =
          normalizedSpotCategory === "strand" ||
          normalizedSpotCategory === "straende" ||
          normalizedSpotCategory === "beach" ||
          normalizedSpotCategory === "beaches";

        if (isBeachCategory && spot.latitude && spot.longitude) {
          setNearbySpots([]);

          const { data: candidates, error: nearbyError } = await supabase
            .from("spots")
            .select(`
              id,
              slug,
              title,
              title_en,
              description,
              description_en,
              image_url,
              category,
              category_en,
              latitude,
              longitude
            `)
            .neq("id", spot.id)
            .not("latitude", "is", null)
            .not("longitude", "is", null);

          if (nearbyError) {
            console.error(
              "Fehler beim Laden der Umgebungs-Spots:",
              nearbyError
            );
          }

          if (candidates) {
            const allowedCategories = new Set([
              "restaurant",
              "restaurants",
              "strandbar",
              "strandbars",
              "bar",
              "bars",
              "hotel",
              "hotels",
              "resort",
              "resorts",
              "unterkunft",
              "unterkuenfte",
              "accommodation",
              "accommodations",
            ]);

            const filtered = candidates
              .filter((candidate) => {
                const normalizedCandidateCategory = String(
                  candidate.category || ""
                )
                  .trim()
                  .toLowerCase()
                  .replace(/ä/g, "ae")
                  .replace(/ö/g, "oe")
                  .replace(/ü/g, "ue")
                  .replace(/ß/g, "ss");

                if (
                  !allowedCategories.has(
                    normalizedCandidateCategory
                  )
                ) {
                  return false;
                }

                const distance = getRawDistance(
                  spot.latitude,
                  spot.longitude,
                  candidate.latitude,
                  candidate.longitude
                );

                return distance <= nearbyRadiusKm;
              })
              .sort((first, second) => {
                const firstDistance = getRawDistance(
                  spot.latitude,
                  spot.longitude,
                  first.latitude,
                  first.longitude
                );

                const secondDistance = getRawDistance(
                  spot.latitude,
                  spot.longitude,
                  second.latitude,
                  second.longitude
                );

                return firstDistance - secondDistance;
              });

            setNearbySpots(filtered);
          }
        } else {
          setNearbySpots([]);
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

              {["strand", "straende", "beach", "beaches"].includes(
                String(spot.category || "")
                  .trim()
                  .toLowerCase()
                  .replace(/ä/g, "ae")
                  .replace(/ö/g, "oe")
                  .replace(/ü/g, "ue")
                  .replace(/ß/g, "ss")
              ) && (
                <NearbySpots
                  spots={nearbySpots}
                  originLatitude={spot.latitude}
                  originLongitude={spot.longitude}
                  radiusKm={nearbyRadiusKm}
                  language={language}
                  localizedHref={localizedHref}
                />
              )}

              <MoreDiscoveries
                spots={randomSpots}
                originLatitude={spot.latitude}
                originLongitude={spot.longitude}
                userProfile={userProfile}
                language={language}
                localizedHref={localizedHref}
              />
            </div>
          </div>

          <SpotSidebar
            spot={spot}
            language={language}
            localizedTitle={localizedTitle}
            localizedCategory={localizedCategory}
            userProfile={userProfile}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            routeDist={routeDist}
            routeTime={routeTime}
            isRouting={isRouting}
            hotelLat={hotelLat}
            hotelLng={hotelLng}
            tours={tours}
            localizedHref={localizedHref}
          />
        </div>
      </div>
    </main>
  );
}

function getIcon(name: string) {
  const IconComponent = iconMap[name as keyof typeof iconMap];
  return IconComponent ? <IconComponent size={18} /> : <MapPin size={18} />;
}
