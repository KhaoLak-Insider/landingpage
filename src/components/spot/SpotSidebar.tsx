"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Car,
  Clock,
  DollarSign,
  Heart,
  HelpCircle,
  MapPin,
  Navigation,
  Play,
  Sparkles,
  Sun,
  Tag,
} from "lucide-react";
import { t } from "@/src/lib/translations";
import type { Language } from "@/src/lib/i18n";
import {
  getLocalizedConfigField,
  getLocalizedField,
} from "@/src/lib/spot/localization";

interface SpotSidebarProps {
  spot: any;
  language: Language;
  localizedTitle: string;
  localizedCategory: string;
  userProfile: any;
  isFavorite: boolean;
  onToggleFavorite: () => void | Promise<void>;
  routeDist: string | null;
  routeTime: number | null;
  isRouting: boolean;
  hotelLat: number | null | undefined;
  hotelLng: number | null | undefined;
  tours: any[];
  localizedHref: (path: string) => string;
  overlapHero?: boolean;
}

export default function SpotSidebar({
  spot,
  language,
  localizedTitle,
  localizedCategory,
  userProfile,
  isFavorite,
  onToggleFavorite,
  routeDist,
  routeTime,
  isRouting,
  hotelLat,
  hotelLng,
  tours,
  localizedHref,
  overlapHero = true,
}: SpotSidebarProps) {
  const normalizedCategory = spot.category?.toLowerCase();

  const isFoodCategory =
    normalizedCategory === "restaurants" ||
    normalizedCategory === "restaurant" ||
    normalizedCategory === "strandbars" ||
    normalizedCategory === "strandbar";

  return (
    <aside
      style={{
        width: 320,
        position: "sticky",
        top: "20px",
        marginTop: overlapHero ? "-430px" : 0,
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
        {(userProfile?.role === "admin" ||
          userProfile?.role === "editor") && (
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
            onClick={onToggleFavorite}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: isFavorite ? "#ef4444" : "#cbd5e1",
            }}
          >
            <Heart
              size={24}
              fill={isFavorite ? "#ef4444" : "none"}
            />
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
            <InfoItem
              icon={<Tag size={16} />}
              label={t(language, "category")}
              value={localizedCategory}
            />
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

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
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
                  <HelpCircle
                    size={12}
                    className="text-slate-400 cursor-help"
                  />
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
                `${routeDist} km (${routeTime} ${t(
                  language,
                  "minutesShort"
                )})`
              ) : (
                <Link
                  href={localizedHref("/profile")}
                  className="text-teal-600 underline font-bold"
                >
                  {t(language, "setHotel")}
                </Link>
              )
            }
          />

          {spot.price_level !== undefined &&
            spot.price_level !== null &&
            spot.price_level.toString().trim() !== "" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    color: "#14b8a6",
                    background: "#f0fdfa",
                    padding: "8px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isFoodCategory ? (
                    <img
                      src="/icons/bottle.svg"
                      alt="Chang"
                      style={{
                        width: 16,
                        height: 16,
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <DollarSign size={16} />
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <span
                    className="flex items-center gap-1 group relative"
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                    }}
                  >
                    {isFoodCategory
                      ? t(language, "changIndex")
                      : t(language, "budget")}
                    <HelpCircle
                      size={12}
                      className="text-slate-400 cursor-help ml-0.5"
                    />

                    <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50 transition-all opacity-0 group-hover:opacity-100 font-medium normal-case tracking-normal leading-relaxed">
                      {isFoodCategory
                        ? t(language, "changIndexTooltip")
                        : t(language, "budgetTooltip")}
                    </div>
                  </span>

                  {isFoodCategory ? (
                    <div
                      style={{
                        display: "flex",
                        gap: "4px",
                        alignItems: "center",
                        marginTop: "2px",
                      }}
                    >
                      {Array.from({ length: 5 }).map((_, index) => {
                        const currentLevel =
                          parseInt(spot.price_level) || 0;
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
                              filter: isFilled
                                ? "none"
                                : "grayscale(100%)",
                              opacity: isFilled ? 1 : 0.25,
                            }}
                          />
                        );
                      })}

                      <span
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          marginLeft: "4px",
                          fontWeight: 600,
                        }}
                      >
                        ({spot.price_level}/5)
                      </span>
                    </div>
                  ) : (
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#334155",
                      }}
                    >
                      {spot.price_level} / 5
                    </span>
                  )}
                </div>
              </div>
            )}

          {spot.opening_hours &&
            spot.opening_hours.trim() !== "" && (
              <InfoItem
                icon={<Clock size={16} />}
                label={t(language, "openingHours")}
                value={
                  getLocalizedField(
                    spot,
                    "opening_hours",
                    language
                  ) || spot.opening_hours
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

          {spot.parking_info?.name &&
            spot.parking_info.name.trim() !== "" && (
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

                {spot.parking_info.price &&
                  spot.parking_info.price.trim() !== "" && (
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

                {spot.parking_info.details &&
                  spot.parking_info.details.trim() !== "" && (
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
                ? `${spot.youtube_url}&t=${
                    spot.youtube_timestamp || 0
                  }`
                : `${spot.youtube_url}?t=${
                    spot.youtube_timestamp || 0
                  }`
            }
            icon={<Play size={22} fill="white" />}
            title={t(language, "youtubeVideo")}
            subtitle={t(language, "watchSpotVideo")}
            variant="red"
          />
        )}

        {spot.tour_link && (
          <PremiumActionButton
            href={`${spot.tour_link}${
              spot.tour_link.includes("?") ? "&" : "?"
            }partner_id=JAPXTFH`}
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
            <MapPin size={16} />{" "}
            {t(language, "bookAccommodation")}*
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

            {tours.slice(0, 3).map((tour, index) => (
              <div
                key={index}
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
  icon: ReactNode;
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
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
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

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
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
