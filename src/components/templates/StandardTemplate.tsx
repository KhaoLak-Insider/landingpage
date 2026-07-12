"use client";

import MapBoxMini from "@/src/components/MapBoxMini";
import { MapPin } from "lucide-react";
import { iconMap } from "@/src/components/IconLibrary";
import { t } from "@/src/lib/translations";
import type { Language } from "@/src/lib/i18n";
import type {
  HotelImageRecord,
  HotelProfileRecord,
  HotelRoomRecord,
} from "@/src/types/spot";
import SpotHero from "@/src/components/spot/SpotHero";
import SpotGallery from "@/src/components/spot/SpotGallery";
import SpotDescription, {
  type SpotDescriptionBlock,
} from "@/src/components/spot/SpotDescription";
import SpotSidebar from "@/src/components/spot/SpotSidebar";
import NearbySpots from "@/src/components/spot/NearbySpots";
import MoreDiscoveries from "@/src/components/spot/MoreDiscoveries";
import { getLocalizedConfigField } from "@/src/lib/spot/localization";

export interface StandardTemplateProps {
  spot: any;
  hotelProfile?: HotelProfileRecord | null;
  hotelImages?: HotelImageRecord[];
  hotelRooms?: HotelRoomRecord[];
  language: Language;
  gallery: string[];
  localizedTitle: string;
  localizedDescription: string;
  localizedCategory: string;
  descriptionBlocks: SpotDescriptionBlock[];
  translations: {
    months: string[];
  };
  nearbySpots: any[];
  nearbyRadiusKm: number;
  randomSpots: any[];
  userProfile: any;
  isFavorite: boolean;
  onToggleFavorite: () => void | Promise<void>;
  routeDist: string | null;
  routeTime: number | null;
  isRouting: boolean;
  routeGeoJSON: any;
  hotelLat: number | null | undefined;
  hotelLng: number | null | undefined;
  tours: any[];
  localizedHref: (path: string) => string;
  showHero?: boolean;
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

function getIcon(name: string) {
  const IconComponent = iconMap[name as keyof typeof iconMap];

  return IconComponent ? (
    <IconComponent size={18} />
  ) : (
    <MapPin size={18} />
  );
}

export default function StandardTemplate({
  spot,
  language,
  gallery,
  localizedTitle,
  localizedDescription,
  localizedCategory,
  descriptionBlocks,
  translations,
  nearbySpots,
  nearbyRadiusKm,
  randomSpots,
  userProfile,
  isFavorite,
  onToggleFavorite,
  routeDist,
  routeTime,
  isRouting,
  routeGeoJSON,
  hotelLat,
  hotelLng,
  tours,
  localizedHref,
  showHero = true,
}: StandardTemplateProps) {
  const isBeach = [
    "strand",
    "straende",
    "beach",
    "beaches",
  ].includes(normalizeCategory(spot.category));

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
        {showHero && (
          <SpotHero
            spot={spot}
            language={language}
            title={localizedTitle}
            description={localizedDescription}
            category={localizedCategory}
            backHref={localizedHref("/entdecken")}
          />
        )}

        <div
          style={{
            display: "flex",
            gap: "40px",
            padding: "40px",
            alignItems: "start",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <SpotGallery
              gallery={gallery}
              title={localizedTitle}
              language={language}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "40px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                }}
              >
                {spot.details_config?.features?.map(
                  (feature: any, index: number) => (
                    <div
                      key={index}
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
                      <div style={{ color: "#14b8a6" }}>
                        {getIcon(feature.icon)}
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            color: "#94a3b8",
                          }}
                        >
                          {String(
                            getLocalizedConfigField(
                              feature,
                              "label",
                              language
                            ) || ""
                          ).toUpperCase()}
                        </div>

                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {getLocalizedConfigField(
                            feature,
                            "value",
                            language
                          ) || "-"}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div
                style={{
                  background: "#fff",
                  borderRadius: 24,
                  padding: "20px",
                  border: "1px solid #f1f5f9",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
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
                  {translations.months.map(
                    (month, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "10px 0",
                          borderRadius: "8px",
                          textAlign: "center",
                          fontSize: "11px",
                          fontWeight: 700,
                          background:
                            spot.best_months?.includes(index)
                              ? "#14b8a6"
                              : "#f1f5f9",
                          color:
                            spot.best_months?.includes(index)
                              ? "#fff"
                              : "#94a3b8",
                        }}
                      >
                        {month}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div
                style={{
                  background: "#fff",
                  borderRadius: 24,
                  padding: "20px",
                  border: "1px solid #f1f5f9",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
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

                  <h2
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    {t(language, "location")}
                  </h2>
                </div>

                <div
                  style={{
                    height: 300,
                    borderRadius: 16,
                    overflow: "hidden",
                  }}
                >
                  <MapBoxMini
                    lat={spot.latitude}
                    lng={spot.longitude}
                    route={routeGeoJSON}
                  />
                </div>
              </div>

              <SpotDescription
                title={localizedTitle}
                blocks={descriptionBlocks}
                language={language}
              />

              {isBeach && (
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
            onToggleFavorite={onToggleFavorite}
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
