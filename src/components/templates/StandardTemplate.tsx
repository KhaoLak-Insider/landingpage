"use client";

import MapBoxMini from "@/src/components/MapBoxMini";
import { CalendarDays, MapPin } from "lucide-react";
import { iconMap } from "@/src/components/IconLibrary";
import { t } from "@/src/lib/translations";
import type { Language } from "@/src/lib/i18n";
import type {
  HotelAmenityRecord,
  HotelFaqRecord,
  HotelImageRecord,
  HotelLocationRecord,
  HotelProfileRecord,
  HotelRestaurantRecord,
  HotelRoomRecord,
  PremiumHotelRecord,
  PremiumRoomRecord,
} from "@/src/types/spot";
import SpotHero from "@/src/components/spot/SpotHero";
import SpotGallery from "@/src/components/spot/SpotGallery";
import SpotDescription, { type SpotDescriptionBlock } from "@/src/components/spot/SpotDescription";
import SpotSidebar from "@/src/components/spot/SpotSidebar";
import NearbySpots from "@/src/components/spot/NearbySpots";
import MoreDiscoveries from "@/src/components/spot/MoreDiscoveries";
import { getLocalizedConfigField } from "@/src/lib/spot/localization";

export interface StandardTemplateProps {
  spot: any;
  premiumHotel?: PremiumHotelRecord | null;
  premiumRooms?: PremiumRoomRecord[];
  hotelProfile?: HotelProfileRecord | null;
  hotelImages?: HotelImageRecord[];
  hotelRooms?: HotelRoomRecord[];
  hotelRestaurants?: HotelRestaurantRecord[];
  hotelAmenities?: HotelAmenityRecord[];
  hotelLocation?: HotelLocationRecord | null;
  hotelFaqs?: HotelFaqRecord[];
  language: Language;
  gallery: string[];
  localizedTitle: string;
  localizedDescription: string;
  localizedCategory: string;
  descriptionBlocks: SpotDescriptionBlock[];
  translations: { months: string[] };
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
  return String(value || "").trim().toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");
}

function getIcon(name: string) {
  const IconComponent = iconMap[name as keyof typeof iconMap];
  return IconComponent ? <IconComponent size={19} /> : <MapPin size={19} />;
}

export default function StandardTemplate(props: StandardTemplateProps) {
  const {
    spot, language, gallery, localizedTitle, localizedDescription,
    localizedCategory, descriptionBlocks, translations, nearbySpots,
    nearbyRadiusKm, randomSpots, userProfile, isFavorite, onToggleFavorite,
    routeDist, routeTime, isRouting, routeGeoJSON, hotelLat, hotelLng, tours,
    localizedHref, showHero = true,
  } = props;

  const isBeach = ["strand", "straende", "beach", "beaches"].includes(
    normalizeCategory(spot.category),
  );
  const features = Array.isArray(spot.details_config?.features)
    ? spot.details_config.features
    : [];
  const hasTravelMonths = Array.isArray(spot.best_months) && spot.best_months.length > 0;

  return (
    <main className="standard-spot">
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

      <div className="standard-spot__shell">
        <div className="standard-spot__layout">
          <div className="standard-spot__content">
            <SpotGallery gallery={gallery} title={localizedTitle} language={language} />

            {features.length > 0 && (
              <section className="standard-card standard-features">
                <div className="standard-section-heading">
                  <span>Insider-Fakten</span>
                  <h2>{language === "en" ? "Good to know" : "Gut zu wissen"}</h2>
                </div>
                <div className="standard-features__grid">
                  {features.map((feature: any, index: number) => (
                    <article key={index}>
                      <div className="standard-features__icon">{getIcon(feature.icon)}</div>
                      <div>
                        <span>{String(getLocalizedConfigField(feature, "label", language) || "")}</span>
                        <strong>{getLocalizedConfigField(feature, "value", language) || "–"}</strong>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {hasTravelMonths && (
              <section className="standard-card standard-months">
                <div className="standard-section-heading standard-section-heading--icon">
                  <CalendarDays size={20} />
                  <div><span>Reiseplanung</span><h2>{t(language, "bestTravelTime")}</h2></div>
                </div>
                <div className="standard-months__grid">
                  {translations.months.map((month, index) => (
                    <div key={month} className={spot.best_months.includes(index) ? "is-active" : ""}>
                      <span>{month}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="standard-card standard-location">
              <div className="standard-section-heading standard-section-heading--icon">
                <MapPin size={20} />
                <div><span>Orientierung</span><h2>{t(language, "location")}</h2></div>
              </div>
              <div className="standard-location__map">
                <MapBoxMini lat={spot.latitude} lng={spot.longitude} route={routeGeoJSON} />
              </div>
            </section>

            <div className="standard-card standard-description">
              <SpotDescription title={localizedTitle} blocks={descriptionBlocks} language={language} />
            </div>

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

          <div className="standard-spot__sidebar">
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
              overlapHero={false}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .standard-spot{min-height:100vh;padding-bottom:72px;background:#f4f7f8;color:#10233f;font-family:var(--font-poppins),'Poppins',sans-serif}.standard-spot__shell{max-width:1260px;margin:0 auto;padding:34px 28px 0}.standard-spot__layout{display:grid;grid-template-columns:minmax(0,1fr) 320px;align-items:start;gap:26px}.standard-spot__content{display:flex;min-width:0;flex-direction:column;gap:22px}.standard-spot__sidebar{position:sticky;top:18px}.standard-card{padding:24px;border:1px solid #e3eaed;border-radius:18px;background:#fff;box-shadow:0 10px 30px rgba(15,35,62,.045)}.standard-section-heading{margin-bottom:19px}.standard-section-heading>span,.standard-section-heading div>span{display:block;margin-bottom:5px;color:#079ca5;font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.standard-section-heading h2{margin:0;color:#10233f;font-size:21px;line-height:1.2;letter-spacing:-.025em}.standard-section-heading--icon{display:flex;align-items:center;gap:11px;color:#079ca5}.standard-features__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.standard-features article{display:flex;min-width:0;align-items:center;gap:11px;padding:13px;border:1px solid #e7edef;border-radius:13px;background:#fafcfc}.standard-features__icon{display:flex;width:38px;height:38px;align-items:center;justify-content:center;flex:0 0 38px;border-radius:11px;background:#e9f8f8;color:#078f96}.standard-features article span{display:block;overflow:hidden;color:#8793a1;font-size:8px;font-weight:800;letter-spacing:.06em;text-overflow:ellipsis;text-transform:uppercase;white-space:nowrap}.standard-features article strong{display:block;margin-top:3px;color:#263a52;font-size:11px}.standard-months__grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px}.standard-months__grid>div{padding:10px 4px;border:1px solid #e6ecef;border-radius:10px;background:#f7f9fa;color:#94a0ae;font-size:9px;font-weight:750;text-align:center}.standard-months__grid>div.is-active{border-color:#079ca5;background:#079ca5;color:#fff;box-shadow:0 6px 15px rgba(7,156,165,.18)}.standard-location__map{overflow:hidden;height:340px;border:1px solid #e3eaed;border-radius:14px;background:#edf2f3}.standard-description{padding:28px}.standard-spot__sidebar :global(aside){margin-top:0!important}.standard-spot__sidebar :global(aside>div){border-radius:18px!important;border-color:#e3eaed!important;box-shadow:0 10px 30px rgba(15,35,62,.055)!important}@media(max-width:1020px){.standard-spot__layout{grid-template-columns:1fr}.standard-spot__sidebar{position:static}.standard-spot__sidebar :global(aside){width:100%!important}}@media(max-width:720px){.standard-spot{padding-bottom:40px}.standard-spot__shell{padding:18px 14px 0}.standard-spot__layout,.standard-spot__content{gap:16px}.standard-card{padding:18px;border-radius:15px}.standard-features__grid{grid-template-columns:1fr 1fr}.standard-months__grid{grid-template-columns:repeat(4,minmax(0,1fr))}.standard-location__map{height:280px}}@media(max-width:460px){.standard-features__grid{grid-template-columns:1fr}.standard-months__grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
      `}</style>
    </main>
  );
}
