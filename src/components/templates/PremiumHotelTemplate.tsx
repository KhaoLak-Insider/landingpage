"use client";

import { MapPin } from "lucide-react";
import MapBoxMini from "@/src/components/MapBoxMini";
import HotelHero from "@/src/components/hotel/HotelHero";
import HotelQuickFacts from "@/src/components/hotel/HotelQuickFacts";
import HotelEditorialSummary from "@/src/components/hotel/HotelEditorialSummary";
import HotelHighlights from "@/src/components/hotel/HotelHighlights";
import SpotGallery from "@/src/components/spot/SpotGallery";
import SpotDescription from "@/src/components/spot/SpotDescription";
import SpotSidebar from "@/src/components/spot/SpotSidebar";
import NearbySpots from "@/src/components/spot/NearbySpots";
import MoreDiscoveries from "@/src/components/spot/MoreDiscoveries";
import { t } from "@/src/lib/translations";
import type { StandardTemplateProps } from "@/src/components/templates/StandardTemplate";

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
            <SpotGallery
              gallery={props.gallery}
              title={props.localizedTitle}
              language={props.language}
            />

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
