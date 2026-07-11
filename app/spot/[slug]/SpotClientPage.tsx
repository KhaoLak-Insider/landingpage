"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { getLanguage } from "@/src/lib/i18n";
import { t, getTranslations } from "@/src/lib/translations";
import TemplateRenderer from "@/src/components/templates/TemplateRenderer";
import {
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
    <TemplateRenderer
      template={spot.template}
      spot={spot}
      language={language}
      gallery={gallery}
      localizedTitle={localizedTitle}
      localizedDescription={localizedDescription}
      localizedCategory={localizedCategory}
      descriptionBlocks={descArray}
      translations={translations}
      nearbySpots={nearbySpots}
      nearbyRadiusKm={nearbyRadiusKm}
      randomSpots={randomSpots}
      userProfile={userProfile}
      isFavorite={isFavorite}
      onToggleFavorite={toggleFavorite}
      routeDist={routeDist}
      routeTime={routeTime}
      isRouting={isRouting}
      routeGeoJSON={routeGeoJSON}
      hotelLat={hotelLat}
      hotelLng={hotelLng}
      tours={tours}
      localizedHref={localizedHref}
    />
  );
}
