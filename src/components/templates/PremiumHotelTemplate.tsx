"use client";

import { MapPin } from "lucide-react";
import MapBoxMini from "@/src/components/MapBoxMini";
import HotelHero from "@/src/components/hotel/HotelHero";
import HotelQuickFacts from "@/src/components/hotel/HotelQuickFacts";
import HotelEditorialSummary from "@/src/components/hotel/HotelEditorialSummary";
import HotelHighlights from "@/src/components/hotel/HotelHighlights";
import HotelRooms from "@/src/components/hotel/HotelRooms";
import HotelRestaurants from "@/src/components/hotel/HotelRestaurants";
import HotelPools from "@/src/components/hotel/HotelPools";
import HotelSpa from "@/src/components/hotel/HotelSpa";
import HotelActivities from "@/src/components/hotel/HotelActivities";
import HotelGallery from "@/src/components/hotel/HotelGallery";
import SpotDescription from "@/src/components/spot/SpotDescription";
import SpotSidebar from "@/src/components/spot/SpotSidebar";
import NearbySpots from "@/src/components/spot/NearbySpots";
import MoreDiscoveries from "@/src/components/spot/MoreDiscoveries";
import { t } from "@/src/lib/translations";
import type { StandardTemplateProps } from "@/src/components/templates/StandardTemplate";
import type {
  HotelAmenityRecord,
  HotelPoolRecord,
  HotelSpaRecord,
} from "@/src/types/spot";


function getAmenityDetail<T>(
  amenity: HotelAmenityRecord,
  key: string,
  fallback: T
): T {
  const details = amenity.details;

  if (
    !details ||
    typeof details !== "object" ||
    !(key in details)
  ) {
    return fallback;
  }

  return details[key] as T;
}

function toPoolRecord(
  amenity: HotelAmenityRecord
): HotelPoolRecord {
  return {
    id: amenity.id,
    hotel_profile_id: amenity.hotel_profile_id,
    pool_type: getAmenityDetail<
      HotelPoolRecord["pool_type"]
    >(amenity, "pool_type", "other"),
    name_de: amenity.name_de,
    name_en: amenity.name_en,
    description_de: amenity.description_de,
    description_en: amenity.description_en,
    image_url: amenity.image_url,
    location_de: amenity.location_de,
    location_en: amenity.location_en,
    opening_hours_de: amenity.opening_hours_de,
    opening_hours_en: amenity.opening_hours_en,
    depth_min_m: getAmenityDetail<number | null>(
      amenity,
      "depth_min_m",
      null
    ),
    depth_max_m: getAmenityDetail<number | null>(
      amenity,
      "depth_max_m",
      null
    ),
    has_children_area: getAmenityDetail(
      amenity,
      "has_children_area",
      false
    ),
    has_pool_bar: getAmenityDetail(
      amenity,
      "has_pool_bar",
      false
    ),
    is_heated: getAmenityDetail(
      amenity,
      "is_heated",
      false
    ),
    is_saltwater: getAmenityDetail(
      amenity,
      "is_saltwater",
      false
    ),
    highlights_de: amenity.highlights_de,
    highlights_en: amenity.highlights_en,
    sort_order: amenity.sort_order,
    status: amenity.status,
    verified_at: amenity.verified_at,
    source_id: amenity.source_id,
    created_at: amenity.created_at,
    updated_at: amenity.updated_at,
  };
}

function toSpaRecord(
  amenity: HotelAmenityRecord
): HotelSpaRecord {
  return {
    id: amenity.id,
    hotel_profile_id: amenity.hotel_profile_id,
    name_de: amenity.name_de,
    name_en: amenity.name_en,
    description_de: amenity.description_de,
    description_en: amenity.description_en,
    image_url: amenity.image_url,
    location_de: amenity.location_de,
    location_en: amenity.location_en,
    opening_hours_de: amenity.opening_hours_de,
    opening_hours_en: amenity.opening_hours_en,
    treatments_de: getAmenityDetail<unknown[]>(
      amenity,
      "treatments_de",
      []
    ),
    treatments_en: getAmenityDetail<unknown[]>(
      amenity,
      "treatments_en",
      []
    ),
    highlights_de: amenity.highlights_de,
    highlights_en: amenity.highlights_en,
    price_from: getAmenityDetail<number | null>(
      amenity,
      "price_from",
      null
    ),
    currency: getAmenityDetail<string | null>(
      amenity,
      "currency",
      null
    ),
    reservation_url: getAmenityDetail<string | null>(
      amenity,
      "reservation_url",
      null
    ),
    sort_order: amenity.sort_order,
    status: amenity.status,
    verified_at: amenity.verified_at,
    source_id: amenity.source_id,
    created_at: amenity.created_at,
    updated_at: amenity.updated_at,
  };
}

function normalizeCategory(value: unknown): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

export default function PremiumHotelTemplate(
  props: StandardTemplateProps
) {
  const hotelProfile = props.hotelProfile;

  const hotelAmenities = props.hotelAmenities || [];

  const hotelPools = hotelAmenities
    .filter(
      (amenity) =>
        amenity.amenity_type === "pool"
    )
    .map(toPoolRecord);

  const hotelSpaAreas = hotelAmenities
    .filter(
      (amenity) =>
        amenity.amenity_type === "spa"
    )
    .map(toSpaRecord);

  const hotelActivities = hotelAmenities.filter(
    (amenity) =>
      amenity.amenity_type === "activity"
  );

  const isBeach = [
    "strand",
    "straende",
    "beach",
    "beaches",
  ].includes(normalizeCategory(props.spot.category));

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
      <HotelHero
        spot={props.spot}
        language={props.language}
        title={props.localizedTitle}
        description={props.localizedDescription}
        category={props.localizedCategory}
        backHref={props.localizedHref("/entdecken")}
      />

      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "34px 40px 0",
        }}
      >
        <HotelGallery
          images={props.hotelImages || []}
          fallbackImages={props.gallery}
          hotelTitle={props.localizedTitle}
          language={props.language}
        />
      </section>

      {hotelProfile && (
        <>
          <HotelQuickFacts
            hotelProfile={hotelProfile}
            language={props.language}
            userRole={props.userProfile?.role}
          />

          <HotelEditorialSummary
            hotelProfile={hotelProfile}
            language={props.language}
            userRole={props.userProfile?.role}
          />

          <HotelHighlights
            hotelProfile={hotelProfile}
            language={props.language}
            userRole={props.userProfile?.role}
          />

          <HotelRooms
            rooms={props.hotelRooms || []}
            hotelProfile={hotelProfile}
            language={props.language}
            userRole={props.userProfile?.role}
          />

          <HotelRestaurants
            venues={props.hotelRestaurants || []}
            hotelProfile={hotelProfile}
            language={props.language}
            userRole={props.userProfile?.role}
          />

          <HotelPools
            pools={hotelPools}
            hotelProfile={hotelProfile}
            language={props.language}
            userRole={props.userProfile?.role}
          />

          <HotelSpa
            spaAreas={hotelSpaAreas}
            hotelProfile={hotelProfile}
            language={props.language}
            userRole={props.userProfile?.role}
          />

          <HotelActivities
            activities={hotelActivities}
            hotelProfile={hotelProfile}
            language={props.language}
            userRole={props.userProfile?.role}
          />
        </>
      )}

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "24px 40px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 40,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: 40,
            }}
          >
            <SpotDescription
              title={props.localizedTitle}
              blocks={props.descriptionBlocks}
              language={props.language}
            />

            <section
              style={{
                background: "#fff",
                borderRadius: 24,
                padding: 20,
                border: "1px solid #f1f5f9",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <MapPin size={22} color="#14b8a6" />

                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {t(props.language, "location")}
                </h2>
              </div>

              <div
                style={{
                  height: 340,
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                <MapBoxMini
                  lat={props.spot.latitude}
                  lng={props.spot.longitude}
                  route={props.routeGeoJSON}
                />
              </div>
            </section>

            {isBeach && (
              <NearbySpots
                spots={props.nearbySpots}
                originLatitude={props.spot.latitude}
                originLongitude={props.spot.longitude}
                radiusKm={props.nearbyRadiusKm}
                language={props.language}
                localizedHref={props.localizedHref}
              />
            )}

            <MoreDiscoveries
              spots={props.randomSpots}
              originLatitude={props.spot.latitude}
              originLongitude={props.spot.longitude}
              userProfile={props.userProfile}
              language={props.language}
              localizedHref={props.localizedHref}
            />
          </div>

          <SpotSidebar
            spot={props.spot}
            language={props.language}
            localizedTitle={props.localizedTitle}
            localizedCategory={props.localizedCategory}
            userProfile={props.userProfile}
            isFavorite={props.isFavorite}
            onToggleFavorite={props.onToggleFavorite}
            routeDist={props.routeDist}
            routeTime={props.routeTime}
            isRouting={props.isRouting}
            hotelLat={props.hotelLat}
            hotelLng={props.hotelLng}
            tours={props.tours}
            localizedHref={props.localizedHref}
            overlapHero={false}
          />
        </div>
      </div>
    </main>
  );
}
