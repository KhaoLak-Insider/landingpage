"use client";

import { Check, Heart } from "lucide-react";
import HotelHero from "@/src/components/hotel/HotelHero";
import HotelHighlights from "@/src/components/hotel/HotelHighlights";
import HotelRooms from "@/src/components/hotel/HotelRooms";
import HotelLocation from "@/src/components/hotel/HotelLocation";
import HotelFAQ from "@/src/components/hotel/HotelFAQ";
import HotelGallery from "@/src/components/hotel/HotelGallery";
import HotelBestTravelTime from "@/src/components/hotel/HotelBestTravelTime";
import HotelNearby from "@/src/components/hotel/HotelNearby";
import type { StandardTemplateProps } from "@/src/components/templates/StandardTemplate";
import type {
  HotelFaqRecord,
  HotelImageRecord,
  HotelLocationRecord,
  HotelProfileRecord,
  PremiumHotelRecord,
  PremiumRoomRecord,
} from "@/src/types/spot";

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
  hotel: PremiumHotelRecord | null | undefined,
  language: StandardTemplateProps["language"],
): CompactFeatureItem[] {
  if (!hotel) {
    return [];
  }

  const localizedFeatures =
    language === "en"
      ? hotel.intro_features_en
      : hotel.intro_features_de;

  const fallbackFeatures =
    language === "en"
      ? hotel.intro_features_de
      : hotel.intro_features_en;

  const features = normalizeCompactFeatures(localizedFeatures);
  const fallback = normalizeCompactFeatures(fallbackFeatures);

  return (features.length > 0 ? features : fallback).slice(0, 3);
}

function toLegacyHotelProfile(
  hotel: PremiumHotelRecord,
): HotelProfileRecord {
  return {
    id: hotel.id,
    spot_id: hotel.spot_id,
    status: hotel.status,
    pool_count: hotel.pool_count ?? null,
    room_count: hotel.room_count ?? null,
    restaurant_count: hotel.restaurant_count ?? null,
    bar_count: hotel.bar_count ?? null,
    suitable_for_families: hotel.suitable_for_families,
    verified_at: hotel.verified_at ?? null,
    created_at: hotel.created_at,
    updated_at: hotel.updated_at,
  };
}

function toLegacyImages(
  hotel: PremiumHotelRecord,
): HotelImageRecord[] {
  if (!Array.isArray(hotel.gallery_images)) {
    return [];
  }

  return hotel.gallery_images
    .filter(
      (image) =>
        typeof image?.image_url === "string" &&
        image.image_url.trim() !== "",
    )
    .map((image, index) => ({
      id: String(image.id || `premium-gallery-${index + 1}`),
      hotel_profile_id: hotel.id,
      image_url: image.image_url.trim(),
      category: "gallery",
      title_de: image.title_de ?? null,
      title_en: image.title_en ?? null,
      alt_de: image.alt_de ?? null,
      alt_en: image.alt_en ?? null,
      credit_name: image.credit_name ?? null,
      credit_url: image.credit_url ?? null,
      sort_order: Number(image.sort_order ?? index),
      is_cover: Boolean(image.is_cover),
      is_featured: Boolean(image.is_featured),
      status: "published",
    }));
}

function toLegacyLocation(
  hotel: PremiumHotelRecord,
): HotelLocationRecord & {
  distance_bang_niang_market_m?: number | null;
  distance_coconut_beach_m?: number | null;
  distance_memories_beach_m?: number | null;
  distance_nang_thong_center_m?: number | null;
  distance_nearest_exchange_m?: number | null;
  distance_nearest_7eleven_m?: number | null;
  distance_phuket_airport_m?: number | null;
} {
  return {
    id: hotel.id,
    hotel_profile_id: hotel.id,
    editorial_summary_de: hotel.editorial_summary_de ?? null,
    editorial_summary_en: hotel.editorial_summary_en ?? null,
    distance_bang_niang_market_m:
      hotel.distance_bang_niang_market_m ?? null,
    distance_coconut_beach_m:
      hotel.distance_coconut_beach_m ?? null,
    distance_memories_beach_m:
      hotel.distance_memories_beach_m ?? null,
    distance_nang_thong_center_m:
      hotel.distance_nang_thong_center_m ?? null,
    distance_nearest_exchange_m:
      hotel.distance_nearest_exchange_m ?? null,
    distance_nearest_7eleven_m:
      hotel.distance_nearest_7eleven_m ?? null,
    distance_phuket_airport_m:
      hotel.distance_phuket_airport_m ?? null,
    sunset_view: false,
    status: hotel.status,
    verified_at: hotel.verified_at ?? null,
  };
}

function toLegacyFaqs(
  hotel: PremiumHotelRecord,
): HotelFaqRecord[] {
  if (!Array.isArray(hotel.faq_items)) {
    return [];
  }

  return hotel.faq_items
    .filter(
      (faq) =>
        typeof faq?.question_de === "string" &&
        typeof faq?.answer_de === "string",
    )
    .map((faq, index) => ({
      id: String(faq.id || `premium-faq-${index + 1}`),
      hotel_profile_id: hotel.id,
      question_de: faq.question_de,
      question_en: faq.question_en ?? null,
      answer_de: faq.answer_de,
      answer_en: faq.answer_en ?? null,
      category: String(faq.category || "general"),
      sort_order: Number(faq.sort_order ?? index),
      status:
        faq.status === "draft" || faq.status === "archived"
          ? faq.status
          : "published",
      verified_at: faq.verified_at ?? null,
    }));
}

export default function PremiumHotelTemplate(props: StandardTemplateProps) {
  const premiumHotel = props.premiumHotel;
  const premiumRooms: PremiumRoomRecord[] = props.premiumRooms || [];

  const hotelProfile = premiumHotel
    ? toLegacyHotelProfile(premiumHotel)
    : null;

  const hotelImages = premiumHotel
    ? toLegacyImages(premiumHotel)
    : [];

  const hotelLocation = premiumHotel
    ? toLegacyLocation(premiumHotel)
    : null;

  const hotelFaqs = premiumHotel
    ? toLegacyFaqs(premiumHotel)
    : [];

  const compactFeatures = getCompactFeatures(
    premiumHotel,
    props.language,
  );

  return (
    <main className="premium-hotel-page">
      <HotelHero
        spot={props.spot}
        language={props.language}
        title={props.localizedTitle}
        description={props.localizedDescription}
        premiumHotel={premiumHotel}
        category={props.localizedCategory}
        backHref={props.localizedHref("/entdecken")}
      />

      <nav className="premium-hotel-tabs" aria-label="Hotelbereiche">
        <div className="premium-hotel-tabs__inner">
          <a className="is-active" href="#overview">
            {props.language === "en" ? "Overview" : "Überblick"}
          </a>
          <a href="#location">
            {props.language === "en" ? "Location" : "Lage"}
          </a>
          <a href="#rooms">
            {props.language === "en" ? "Rooms" : "Zimmer"}
          </a>
          <a href="#faq">FAQ</a>
          <a href="#nearby">
            {props.language === "en" ? "Nearby" : "In der Nähe"}
          </a>
          <button
            type="button"
            className="premium-hotel-tabs__favorite"
            onClick={props.onToggleFavorite}
            aria-pressed={props.isFavorite}
            aria-label={
              props.language === "en"
                ? props.isFavorite
                  ? "Remove from favorites"
                  : "Add to favorites"
                : props.isFavorite
                  ? "Aus Favoriten entfernen"
                  : "Zu Favoriten hinzufügen"
            }
            title={
              props.language === "en"
                ? props.isFavorite
                  ? "Remove from favorites"
                  : "Add to favorites"
                : props.isFavorite
                  ? "Aus Favoriten entfernen"
                  : "Zu Favoriten hinzufügen"
            }
          >
            <Heart
              size={19}
              strokeWidth={2}
              fill={props.isFavorite ? "#ef4444" : "none"}
              color={props.isFavorite ? "#ef4444" : "#64748b"}
            />
          </button>
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

            {hotelProfile && premiumHotel && (
              <>
                <div className="premium-slot premium-slot--highlights">
                  <HotelHighlights
                    premiumHotel={premiumHotel}
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
                images={hotelImages}
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
                location={hotelLocation}
                hotelProfile={hotelProfile}
                language={props.language}
                latitude={props.spot.latitude}
                longitude={props.spot.longitude}
                userRole={props.userProfile?.role}
              />
            </div>

            <div className="premium-slot premium-slot--traveltime">
              <HotelBestTravelTime language={props.language} />
            </div>
          </section>
        )}

        {hotelProfile && (
          <>
            <section id="rooms" className="premium-slot premium-slot--wide">
              <div className="premium-slot premium-slot--rooms">
                <HotelRooms
                  roomsData={premiumRooms}
                  hotelSlug={props.spot.slug}
                  language={props.language}
                  localizedHref={props.localizedHref}
                />
              </div>
            </section>

            <section id="faq" className="premium-slot premium-slot--wide">
              <HotelFAQ
                faqs={hotelFaqs}
                hotelProfile={hotelProfile}
                language={props.language}
                userRole={props.userProfile?.role}
              />
            </section>

          </>
        )}

        <section id="nearby" className="premium-slot premium-slot--wide">
          <div className="premium-slot premium-slot--nearby">
            <HotelNearby
              spots={props.nearbySpots}
              originLatitude={props.spot.latitude}
              originLongitude={props.spot.longitude}
              language={props.language}
              localizedHref={props.localizedHref}
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
        .premium-hotel-tabs__favorite {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          min-width: 52px;
          margin-left: auto;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
          flex: 0 0 auto;
        }

        .premium-hotel-tabs__favorite::after {
          display: none;
        }

        .premium-hotel-tabs__favorite svg {
          transition:
            color 0.18s ease,
            fill 0.18s ease,
            transform 0.18s ease;
        }

        .premium-hotel-tabs__favorite:hover svg {
          color: #ef4444;
          transform: scale(1.12);
        }

        .premium-hotel-tabs__favorite:focus-visible {
          outline: 2px solid #0eb4bb;
          outline-offset: -4px;
          border-radius: 8px;
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

        .premium-hotel-shell > section {
          scroll-margin-top: 92px;
        }

        .premium-hotel-grid--overview {
          grid-template-columns: minmax(0, 7fr) minmax(360px, 5fr);
          align-items: start;
        }
        .premium-hotel-grid--location-row {
          grid-template-columns: minmax(0, 7fr) minmax(360px, 5fr);
          align-items: start;
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

        .premium-slot--traveltime {
          overflow: hidden;
          border: 1px solid #e8edf2;
          border-radius: 14px;
          background: #ffffff;
          box-shadow: 0 8px 24px rgba(15, 35, 62, 0.035);
          align-self: stretch;
        }

        .premium-slot--traveltime > section {
          height: 100%;
          padding: 0 !important;
        }

        .premium-slot--rooms {
          overflow: hidden;
          border: 1px solid #e8edf2;
          border-radius: 14px;
          background: #ffffff;
          box-shadow: 0 8px 24px rgba(15, 35, 62, 0.035);
        }

        .premium-slot--rooms > section {
  padding: 0 !important;
}

        .premium-slot--nearby {
          overflow: hidden;
          border: 1px solid #e8edf2;
          border-radius: 14px;
          background: #ffffff;
          box-shadow: 0 8px 24px rgba(15, 35, 62, 0.035);
        }

        .premium-slot--nearby > section {
          padding: 0 !important;
        }

.premium-hotel-page .hotel-rooms-preview__all {
  font-size: 13px !important;
}

.premium-slot--gallery {
  align-self: start;
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
        #location,
        #faq,
        #nearby {
          scroll-margin-top: 86px;
        }

        @media (max-width: 1080px) {
          .premium-hotel-grid--overview,
          .premium-hotel-grid--location-row {
            grid-template-columns: 1fr;
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