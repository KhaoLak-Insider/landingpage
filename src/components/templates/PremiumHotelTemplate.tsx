"use client";

import { Check } from "lucide-react";
import HotelHero from "@/src/components/hotel/HotelHero";
import HotelQuickFacts from "@/src/components/hotel/HotelQuickFacts";
import HotelHighlights from "@/src/components/hotel/HotelHighlights";
import HotelRooms from "@/src/components/hotel/HotelRooms";
import HotelRestaurants from "@/src/components/hotel/HotelRestaurants";
import HotelPools from "@/src/components/hotel/HotelPools";
import HotelSpa from "@/src/components/hotel/HotelSpa";
import HotelActivities from "@/src/components/hotel/HotelActivities";
import HotelFacilities from "@/src/components/hotel/HotelFacilities";
import HotelLocation from "@/src/components/hotel/HotelLocation";
import HotelFAQ from "@/src/components/hotel/HotelFAQ";
import HotelGallery from "@/src/components/hotel/HotelGallery";
import SpotDescription from "@/src/components/spot/SpotDescription";
import SpotSidebar from "@/src/components/spot/SpotSidebar";
import NearbySpots from "@/src/components/spot/NearbySpots";
import MoreDiscoveries from "@/src/components/spot/MoreDiscoveries";
import type { StandardTemplateProps } from "@/src/components/templates/StandardTemplate";
import type {
  HotelAmenityRecord,
  HotelPoolRecord,
  HotelSpaRecord,
} from "@/src/types/spot";

function getAmenityDetail<T>(
  amenity: HotelAmenityRecord,
  key: string,
  fallback: T,
): T {
  const details = amenity.details;

  if (!details || typeof details !== "object" || !(key in details)) {
    return fallback;
  }

  return details[key] as T;
}

function toPoolRecord(amenity: HotelAmenityRecord): HotelPoolRecord {
  return {
    id: amenity.id,
    hotel_profile_id: amenity.hotel_profile_id,
    pool_type: getAmenityDetail<HotelPoolRecord["pool_type"]>(
      amenity,
      "pool_type",
      "other",
    ),
    name_de: amenity.name_de,
    name_en: amenity.name_en,
    description_de: amenity.description_de,
    description_en: amenity.description_en,
    image_url: amenity.image_url,
    location_de: amenity.location_de,
    location_en: amenity.location_en,
    opening_hours_de: amenity.opening_hours_de,
    opening_hours_en: amenity.opening_hours_en,
    depth_min_m: getAmenityDetail<number | null>(amenity, "depth_min_m", null),
    depth_max_m: getAmenityDetail<number | null>(amenity, "depth_max_m", null),
    has_children_area: getAmenityDetail(amenity, "has_children_area", false),
    has_pool_bar: getAmenityDetail(amenity, "has_pool_bar", false),
    is_heated: getAmenityDetail(amenity, "is_heated", false),
    is_saltwater: getAmenityDetail(amenity, "is_saltwater", false),
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

function toSpaRecord(amenity: HotelAmenityRecord): HotelSpaRecord {
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
    treatments_de: getAmenityDetail<unknown[]>(amenity, "treatments_de", []),
    treatments_en: getAmenityDetail<unknown[]>(amenity, "treatments_en", []),
    highlights_de: amenity.highlights_de,
    highlights_en: amenity.highlights_en,
    price_from: getAmenityDetail<number | null>(amenity, "price_from", null),
    currency: getAmenityDetail<string | null>(amenity, "currency", null),
    reservation_url: getAmenityDetail<string | null>(
      amenity,
      "reservation_url",
      null,
    ),
    sort_order: amenity.sort_order,
    status: amenity.status,
    verified_at: amenity.verified_at,
    source_id: amenity.source_id,
    created_at: amenity.created_at,
    updated_at: amenity.updated_at,
  };
}

interface CompactFeatureItem {
  title: string;
}

function normalizeCompactFeatures(value: unknown): CompactFeatureItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item): CompactFeatureItem | null => {
      if (typeof item === "string") {
        const title = item.trim();
        return title ? { title } : null;
      }

      if (typeof item === "object" && item !== null) {
        const rawTitle = (item as { title?: unknown }).title;
        const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
        return title ? { title } : null;
      }

      return null;
    })
    .filter((item): item is CompactFeatureItem => item !== null);
}

function getCompactFeatures(
  hotelProfile: StandardTemplateProps["hotelProfile"],
  localizedTitle: string,
  language: StandardTemplateProps["language"],
): CompactFeatureItem[] {
  const normalizedTitle = localizedTitle.trim().toLowerCase();

  if (normalizedTitle.includes("moracea")) {
    return language === "en"
      ? [
          { title: "Spectacular sea views" },
          { title: "Direct beach access" },
          { title: "Excellent service" },
        ]
      : [
          { title: "Spektakulärer Meerblick" },
          { title: "Direkter Strandzugang" },
          { title: "Exzellenter Service" },
        ];
  }

  if (!hotelProfile) {
    return [];
  }

  const localizedHighlights =
    language === "en" ? hotelProfile.highlights_en : hotelProfile.highlights_de;

  const fallbackHighlights =
    language === "en" ? hotelProfile.highlights_de : hotelProfile.highlights_en;

  const features = normalizeCompactFeatures(localizedHighlights);
  const fallbackFeatures = normalizeCompactFeatures(fallbackHighlights);

  return (features.length > 0 ? features : fallbackFeatures).slice(0, 3);
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

export default function PremiumHotelTemplate(props: StandardTemplateProps) {
  const hotelProfile = props.hotelProfile;

  const hotelAmenities = props.hotelAmenities || [];

  const hotelPools = hotelAmenities
    .filter((amenity) => amenity.amenity_type === "pool")
    .map(toPoolRecord);

  const hotelSpaAreas = hotelAmenities
    .filter((amenity) => amenity.amenity_type === "spa")
    .map(toSpaRecord);

  const hotelActivities = hotelAmenities.filter(
    (amenity) => amenity.amenity_type === "activity",
  );

  const hotelFacilities = hotelAmenities.filter(
    (amenity) =>
      amenity.amenity_type === "facility" || amenity.amenity_type === "service",
  );

  const isBeach = ["strand", "straende", "beach", "beaches"].includes(
    normalizeCategory(props.spot.category),
  );

  const compactFeatures = getCompactFeatures(
    hotelProfile,
    props.localizedTitle,
    props.language,
  );

  return (
    <main className="premium-hotel-page">
      <HotelHero
        spot={props.spot}
        language={props.language}
        title={props.localizedTitle}
        description={props.localizedDescription}
        category={props.localizedCategory}
        backHref={props.localizedHref("/entdecken")}
      />

      <nav className="premium-hotel-tabs" aria-label="Hotelbereiche">
        <div className="premium-hotel-tabs__inner">
          <a className="is-active" href="#overview">
            Überblick
          </a>
          <a href="#rooms">Zimmer</a>
          <a href="#facilities">Ausstattung</a>
          <a href="#location">Lage</a>
          <a href="#restaurants">Restaurants</a>
          <a href="#faq">FAQ</a>
          <a href="#nearby">In der Nähe</a>
        </div>
      </nav>

      <div className="premium-hotel-shell">
        <section
          id="overview"
          className="premium-hotel-grid premium-hotel-grid--overview"
        >
          <div className="premium-hotel-stack">
            <section className="premium-hotel-intro">
              <h2>
                {props.language === "en"
                  ? `About ${props.localizedTitle}`
                  : `Über das ${props.localizedTitle}`}
              </h2>

              {props.localizedDescription && (
                <p>{props.localizedDescription}</p>
              )}

              {compactFeatures.length > 0 && (
                <div
                  className="premium-hotel-intro-features"
                  aria-label={
                    props.language === "en"
                      ? "Key hotel features"
                      : "Besondere Hotelmerkmale"
                  }
                >
                  {compactFeatures.map((feature) => (
                    <div
                      key={feature.title}
                      className="premium-hotel-intro-feature"
                    >
                      <span
                        className="premium-hotel-intro-feature__icon"
                        aria-hidden="true"
                      >
                        <Check size={13} strokeWidth={2.6} />
                      </span>
                      <span>{feature.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {hotelProfile && (
              <>
                <div className="premium-slot premium-slot--highlights">
                  <HotelHighlights
                    hotelProfile={hotelProfile}
                    language={props.language}
                    userRole={props.userProfile?.role}
                  />
                </div>

              </>
            )}
          </div>

          <div className="premium-hotel-stack">
            <div className="premium-slot premium-slot--gallery">
              <HotelGallery
                images={props.hotelImages || []}
                fallbackImages={props.gallery}
                hotelTitle={props.localizedTitle}
                language={props.language}
              />
            </div>

          </div>
        </section>

        {hotelProfile && (
          <section
            id="location"
            className="premium-hotel-grid premium-hotel-grid--location-row"
          >
            <div className="premium-slot premium-slot--location">
              <HotelLocation
                location={props.hotelLocation || null}
                hotelProfile={hotelProfile}
                language={props.language}
                latitude={props.spot.latitude}
                longitude={props.spot.longitude}
                userRole={props.userProfile?.role}
              />
            </div>

            <div
              className="premium-location-row__placeholder"
              aria-hidden="true"
            />
          </section>
        )}

        {hotelProfile && (
          <>
            <section id="rooms" className="premium-slot premium-slot--wide">
              <HotelRooms
                rooms={props.hotelRooms || []}
                hotelProfile={hotelProfile}
                language={props.language}
                userRole={props.userProfile?.role}
              />
            </section>

            <section id="facilities" className="premium-hotel-section-group">
              <div className="premium-hotel-grid premium-hotel-grid--balanced">
                <div className="premium-slot">
                  <HotelPools
                    pools={hotelPools}
                    hotelProfile={hotelProfile}
                    language={props.language}
                    userRole={props.userProfile?.role}
                  />
                </div>

                <div className="premium-slot">
                  <HotelSpa
                    spaAreas={hotelSpaAreas}
                    hotelProfile={hotelProfile}
                    language={props.language}
                    userRole={props.userProfile?.role}
                  />
                </div>
              </div>

              <div className="premium-hotel-grid premium-hotel-grid--balanced">
                <div className="premium-slot">
                  <HotelActivities
                    activities={hotelActivities}
                    hotelProfile={hotelProfile}
                    language={props.language}
                    userRole={props.userProfile?.role}
                  />
                </div>

                <div className="premium-slot">
                  <HotelFacilities
                    facilities={hotelFacilities}
                    hotelProfile={hotelProfile}
                    language={props.language}
                    userRole={props.userProfile?.role}
                  />
                </div>
              </div>
            </section>

            <section
              id="restaurants"
              className="premium-slot premium-slot--wide"
            >
              <HotelRestaurants
                venues={props.hotelRestaurants || []}
                hotelProfile={hotelProfile}
                language={props.language}
                userRole={props.userProfile?.role}
              />
            </section>

            <section id="faq" className="premium-slot premium-slot--wide">
              <HotelFAQ
                faqs={props.hotelFaqs || []}
                hotelProfile={hotelProfile}
                language={props.language}
                userRole={props.userProfile?.role}
              />
            </section>
          </>
        )}

        <section
          id="nearby"
          className="premium-hotel-grid premium-hotel-grid--content"
        >
          <div className="premium-hotel-stack">
            {isBeach && (
              <div className="premium-slot">
                <NearbySpots
                  spots={props.nearbySpots}
                  originLatitude={props.spot.latitude}
                  originLongitude={props.spot.longitude}
                  radiusKm={props.nearbyRadiusKm}
                  language={props.language}
                  localizedHref={props.localizedHref}
                />
              </div>
            )}

            <div className="premium-slot">
              <MoreDiscoveries
                spots={props.randomSpots}
                originLatitude={props.spot.latitude}
                originLongitude={props.spot.longitude}
                userProfile={props.userProfile}
                language={props.language}
                localizedHref={props.localizedHref}
              />
            </div>

            <div className="premium-slot premium-slot--text">
              <SpotDescription
                title={props.localizedTitle}
                blocks={props.descriptionBlocks}
                language={props.language}
              />
            </div>
          </div>

          <div className="premium-sidebar-column">
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
        </section>
      </div>

      <style jsx global>{`
        .premium-hotel-page {
          min-height: 100vh;
          padding-bottom: 72px;
          background: #f8fafc;
          color: #10233f;
          font-family: "Poppins", sans-serif;
        }

        .premium-hotel-tabs {
          position: sticky;
          top: 0;
          z-index: 30;
          border-bottom: 1px solid #e7edf2;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(18px);
        }

        .premium-hotel-tabs__inner {
          display: flex;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 40px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .premium-hotel-tabs__inner::-webkit-scrollbar {
          display: none;
        }

        .premium-hotel-tabs a {
          position: relative;
          flex: 0 0 auto;
          padding: 18px 26px 17px;
          color: #26364d;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          white-space: nowrap;
        }

        .premium-hotel-tabs a::after {
          position: absolute;
          right: 24px;
          bottom: -1px;
          left: 24px;
          height: 2px;
          border-radius: 999px;
          background: transparent;
          content: "";
        }

        .premium-hotel-tabs a:hover,
        .premium-hotel-tabs a.is-active {
          color: #079ca5;
        }
        .premium-hotel-tabs a.is-active::after {
          background: #0eb4bb;
        }

        .premium-hotel-shell {
          display: flex;
          flex-direction: column;
          gap: 22px;
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px 40px 0;
        }

        .premium-hotel-grid {
          display: grid;
          gap: 22px;
          align-items: start;
        }

        .premium-hotel-section-group {
          display: flex;
          flex-direction: column;
          gap: 18px;
          scroll-margin-top: 92px;
        }

        .premium-hotel-shell > section {
          scroll-margin-top: 92px;
        }

        .premium-hotel-grid--overview {
          grid-template-columns: minmax(0, 7fr) minmax(360px, 5fr);
          align-items: start;
        }
        .premium-hotel-grid--balanced {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .premium-hotel-grid--location-row {
          grid-template-columns: minmax(0, 7fr) minmax(360px, 5fr);
          align-items: start;
        }

        .premium-location-row__placeholder {
          min-height: 1px;
        }
        .premium-hotel-grid--content {
          grid-template-columns: minmax(0, 1fr) 340px;
        }

        .premium-hotel-stack {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 22px;
        }

        .premium-slot {
          min-width: 0;
          overflow: hidden;
          border: 1px solid #e8edf2;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 8px 30px rgba(15, 35, 62, 0.045);
        }

        .premium-slot--wide {
          width: 100%;
        }
        .premium-sidebar-column {
          position: sticky;
          top: 88px;
          min-width: 0;
        }

        .premium-hotel-intro {
          padding: 8px 2px 2px;
        }

        .premium-hotel-intro h2 {
          margin: 0;
          color: #10233f;
          font-size: 21px;
          line-height: 1.3;
          font-weight: 700;
          letter-spacing: -0.025em;
        }

        .premium-hotel-intro p {
          max-width: 650px;
          margin: 14px 0 0;
          color: #334155;
          font-size: 14px;
          line-height: 1.75;
        }

        .premium-hotel-intro-features {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px 30px;
          margin-top: 20px;
        }

        .premium-hotel-intro-feature {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #24364f;
          font-size: 12px;
          line-height: 1.4;
          font-weight: 600;
          white-space: nowrap;
        }

        .premium-hotel-intro-feature__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          flex: 0 0 20px;
          border-radius: 999px;
          background: #dff7f6;
          color: #0da6a6;
        }

        /* Existing modules become children of the new composition grid. */
        .premium-slot > section,
        .premium-slot > div > section {
          max-width: none !important;
          margin: 0 !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }

        .premium-slot--editorial > section > div,
        .premium-slot--quick-facts > section > div {
          border: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }

        /* Phase 4.2: visual flattening toward the approved mockup. */
        .premium-hotel-page {
          background: #ffffff;
        }

        .premium-hotel-shell {
          max-width: 1180px;
          gap: 18px;
          padding-top: 18px;
        }

        .premium-hotel-grid,
        .premium-hotel-stack {
          gap: 18px;
        }

        .premium-slot {
          overflow: visible;
          border: 0;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
        }

        .premium-slot--gallery,
        .premium-slot--quick-facts {
          overflow: hidden;
          border: 1px solid #e8edf2;
          border-radius: 14px;
          background: #ffffff;
          box-shadow: 0 8px 24px rgba(15, 35, 62, 0.035);
        }

        /* Highlights now use their own compact mockup-oriented component. */
        .premium-slot--highlights {
          margin-top: auto;
        }

        .premium-slot--highlights > section {
          padding: 0 !important;
        }

        .premium-slot--location {
          margin-top: 0;
          overflow: hidden;
          border: 1px solid #e8edf2;
          border-radius: 14px;
          background: #ffffff;
          box-shadow: 0 8px 24px rgba(15, 35, 62, 0.035);
        }

        .premium-slot--location > section {
          padding: 0 !important;
        }

        .premium-slot--gallery {
          align-self: start;
        }

        .premium-slot--gallery > section {
          height: auto;
        }

        /* Quick facts: turn the large standalone module into a calm sidebar card. */
        .premium-slot--quick-facts > section {
          margin: 0 !important;
          padding: 0 !important;
        }

        .premium-slot--quick-facts > section > div {
          border: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }

        .premium-slot--quick-facts > section > div > div:first-child {
          padding: 18px !important;
          background: #ffffff !important;
        }

        .premium-slot--quick-facts h2 {
          font-size: 22px !important;
          line-height: 1.25 !important;
        }

        .premium-slot--quick-facts p {
          font-size: 12px !important;
          line-height: 1.55 !important;
        }

        .premium-slot--quick-facts [style*="padding: 26px 24px"] {
          padding: 14px !important;
        }

        /* All remaining modules: remove their page-level spacing so sections flow together. */
        .premium-hotel-shell .premium-slot > section {
          margin-bottom: 0 !important;
        }

        .premium-hotel-shell
          .premium-slot:not(.premium-slot--gallery):not(
            .premium-slot--quick-facts
          )
          > section {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }

        .premium-hotel-shell section h2 {
          letter-spacing: -0.025em !important;
        }

        html {
          scroll-behavior: smooth;
        }
        #overview,
        #rooms,
        #facilities,
        #location,
        #restaurants,
        #faq,
        #nearby {
          scroll-margin-top: 86px;
        }

        @media (max-width: 1080px) {
          .premium-hotel-grid--overview,
          .premium-hotel-grid--balanced,
          .premium-hotel-grid--location-row,
          .premium-hotel-grid--content {
            grid-template-columns: 1fr;
          }

          .premium-location-row__placeholder {
            display: none;
          }

          .premium-sidebar-column {
            position: static;
          }
        }

        @media (max-width: 720px) {
          .premium-hotel-tabs__inner {
            padding: 0 14px;
          }
          .premium-hotel-tabs a {
            padding: 15px 14px 14px;
            font-size: 12px;
          }
          .premium-hotel-tabs a::after {
            right: 13px;
            left: 13px;
          }

          .premium-hotel-shell {
            gap: 14px;
            padding: 14px 14px 0;
          }

          .premium-hotel-grid,
          .premium-hotel-stack {
            gap: 14px;
          }

          .premium-hotel-intro-features {
            align-items: flex-start;
            flex-direction: column;
            gap: 11px;
          }

          .premium-hotel-intro-feature {
            white-space: normal;
          }
          .premium-slot {
            border-radius: 13px;
          }
        }
      `}</style>
    </main>
  );
}