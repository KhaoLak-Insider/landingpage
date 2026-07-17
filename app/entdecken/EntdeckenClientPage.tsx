"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as LucideIcons from "lucide-react";
import {
  Heart,
  LogIn,
  MapPin,
  Search,
  SlidersHorizontal,
  UserPlus,
  X,
} from "lucide-react";
import { supabase } from "@/src/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Language } from "@/src/lib/i18n";
import { getLanguageFromPathname, localizePath } from "@/src/lib/i18n-routing";
import { t } from "@/src/lib/translations";
import MapBoxMini from "@/src/components/MapBoxMini";

interface Spot {
  id: string;
  slug: string;
  title: string | null;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  image_url: string | null;
  category: string | null;
  category_en: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface Category {
  id: string;
  name: string;
  name_en: string | null;
  slug: string;
  icon: string | null;
  parent_id: string | null;
  sort_order: number;
}

interface UserProfile {
  hotel_id?: string | null;
  custom_hotel_lat?: number | null;
  custom_hotel_lng?: number | null;
  hotels?:
    | {
        lat?: number | null;
        lng?: number | null;
      }
    | Array<{
        lat?: number | null;
        lng?: number | null;
      }>
    | null;
}

interface EntdeckenClientPageProps {
  initialSpots: Spot[];
  initialCategories: Category[];
  initialCategorySlug?: string;
}

const ALL_CATEGORIES = "__all__";

function getLocalizedField(
  item: Spot,
  field: "title" | "description" | "category",
  language: Language
): string {
  const germanValue = item[field];
  const englishValue = item[`${field}_en`];

  if (language === "en") {
    return englishValue?.trim() || germanValue?.trim() || "";
  }

  return germanValue?.trim() || englishValue?.trim() || "";
}

function truncateText(value: string, maxLength = 115): string {
  const cleaned = value.trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength).trimEnd()}…`;
}

export default function EntdeckenClientPage({
  initialSpots,
  initialCategories,
  initialCategorySlug,
}: EntdeckenClientPageProps) {
  const language = getLanguageFromPathname(usePathname());

  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState<string>(() =>
      initialCategories.find((item) => item.slug === initialCategorySlug)?.name ||
      ALL_CATEGORIES
    );
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userProfile, setUserProfile] =
    useState<UserProfile | null>(null);
  const [session, setSession] = useState<User | null>(null);
  const [maxDistance, setMaxDistance] = useState(100);
  const [showOnlyFavs, setShowOnlyFavs] = useState(false);
  const [showMobileFilters, setShowMobileFilters] =
    useState(false);

  const localizedHref = (path: string) => {
    return localizePath(path, language);
  };

  const hotelData = Array.isArray(userProfile?.hotels)
    ? userProfile.hotels[0]
    : userProfile?.hotels;

  const hotelLat = userProfile?.hotel_id
    ? hotelData?.lat
    : userProfile?.custom_hotel_lat;

  const hotelLng = userProfile?.hotel_id
    ? hotelData?.lng
    : userProfile?.custom_hotel_lng;

  const hasHotelCoordinates =
    typeof hotelLat === "number" &&
    typeof hotelLng === "number";

  const calculateDistance = (
    latitude: number | null,
    longitude: number | null
  ): number | null => {
    if (
      !hasHotelCoordinates ||
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      return null;
    }

    const earthRadius = 6371;
    const latitudeDifference =
      (latitude - hotelLat) * (Math.PI / 180);
    const longitudeDifference =
      (longitude - hotelLng) * (Math.PI / 180);

    const calculation =
      Math.sin(latitudeDifference / 2) ** 2 +
      Math.cos(hotelLat * (Math.PI / 180)) *
        Math.cos(latitude * (Math.PI / 180)) *
        Math.sin(longitudeDifference / 2) ** 2;

    return Number(
      (
        earthRadius *
        2 *
        Math.atan2(
          Math.sqrt(calculation),
          Math.sqrt(1 - calculation)
        )
      ).toFixed(1)
    );
  };

  useEffect(() => {
    async function loadUserData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setSession(user);

      if (!user) {
        setFavorites([]);
        setUserProfile(null);
        return;
      }

      const [
        { data: favoriteData },
        { data: profileData },
      ] = await Promise.all([
        supabase
          .from("favorites")
          .select("spot_id")
          .eq("user_id", user.id),

        supabase
          .from("profiles")
          .select(
            "hotel_id, custom_hotel_lat, custom_hotel_lng, hotels(lat, lng)"
          )
          .eq("id", user.id)
          .maybeSingle(),
      ]);

      setFavorites(
        favoriteData?.map((favorite) => favorite.spot_id) || []
      );
      setUserProfile(profileData);
    }

    loadUserData();
  }, []);

  const mappedCategories = initialCategories.map((item) => {
      const matchingSpot = initialSpots.find(
        (spot) => spot.category === item.name
      );
      const childNames = initialCategories
        .filter((candidate) => candidate.parent_id === item.id)
        .map((candidate) => candidate.name);

      return {
        id: item.id,
        name: item.name,
        displayName:
          language === "en"
            ? item.name_en?.trim() ||
              matchingSpot?.category_en?.trim() ||
              item.name
            : item.name,
        icon: item.icon || "MapPin",
        parentId: item.parent_id,
        childNames,
        sortOrder: item.sort_order,
      };
    });

  const categories = mappedCategories
    .filter((item) => item.parentId === null)
    .flatMap((parent) => [
      parent,
      ...mappedCategories
        .filter((item) => item.parentId === parent.id)
        .sort((a, b) =>
          a.sortOrder === b.sortOrder
            ? a.displayName.localeCompare(b.displayName)
            : a.sortOrder - b.sortOrder
        ),
    ]);

  const statistics = (() => {
    const normalizeCategory = (value: string | null) =>
      value
        ?.trim()
        .toLowerCase()
        .replace(/ä/g, "ae")
        .replace(/ö/g, "oe")
        .replace(/ü/g, "ue")
        .replace(/ß/g, "ss") || "";

    const countByCategories = (names: string[]) =>
      initialSpots.filter((spot) =>
        names.includes(normalizeCategory(spot.category))
      ).length;

    return [
      {
        icon: "MapPin",
        value: initialSpots.length,
        label: t(language, "statisticsPlaces"),
        description: t(language, "statisticsPlacesDescription"),
      },
      {
        icon: "LayoutGrid",
        value: initialCategories.length,
        label: t(language, "statisticsCategories"),
        description: t(language, "statisticsCategoriesDescription"),
      },
      {
        icon: "Palmtree",
        value: countByCategories([
          "strand",
          "straende",
          "beach",
          "beaches",
        ]),
        label: t(language, "statisticsBeaches"),
        description: t(language, "statisticsBeachesDescription"),
      },
      {
        icon: "Utensils",
        value: countByCategories([
          "restaurant",
          "restaurants",
          "local food",
          "strandbar",
          "strandbars",
          "bar",
          "bars",
        ]),
        label: t(language, "statisticsRestaurants"),
        description: t(language, "statisticsRestaurantsDescription"),
      },
      {
        icon: "BedDouble",
        value: countByCategories([
          "unterkunft",
          "unterkuenfte",
          "hotel",
          "hotels",
          "resort",
          "resorts",
        ]),
        label: t(language, "statisticsAccommodations"),
        description: t(language, "statisticsAccommodationsDescription"),
      },
    ];
  })();

  const filteredSpots = (() => {
    const normalizedSearch = search.trim().toLowerCase();

    return initialSpots.filter((spot) => {
      const localizedTitle = getLocalizedField(
        spot,
        "title",
        language
      ).toLowerCase();

      const localizedDescription = getLocalizedField(
        spot,
        "description",
        language
      ).toLowerCase();

      const localizedCategory = getLocalizedField(
        spot,
        "category",
        language
      ).toLowerCase();

      const activeCategory = categories.find(
        (item) => item.name === category
      );
      const matchesCategory =
        category === ALL_CATEGORIES ||
        spot.category === category ||
        activeCategory?.childNames.includes(spot.category || "") === true;

      const matchesSearch =
        normalizedSearch === "" ||
        localizedTitle.includes(normalizedSearch) ||
        localizedDescription.includes(normalizedSearch) ||
        localizedCategory.includes(normalizedSearch);

      const matchesFavorite =
        !showOnlyFavs || favorites.includes(spot.id);

      const distance = calculateDistance(
        spot.latitude,
        spot.longitude
      );

      const matchesDistance =
        maxDistance >= 100 ||
        !hasHotelCoordinates ||
        (distance !== null && distance <= maxDistance);

      return (
        matchesCategory &&
        matchesSearch &&
        matchesFavorite &&
        matchesDistance
      );
    });
  })();


  function getIconForCategory(categoryName: string | null) {
    return (
      categories.find(
        (item) => item.name === categoryName
      )?.icon || "MapPin"
    );
  }

  async function toggleFavorite(spotId: string) {
    if (!session) {
      alert(t(language, "loginRequired"));
      return;
    }

    const isFavorite = favorites.includes(spotId);

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("spot_id", spotId)
        .eq("user_id", session.id);

      if (!error) {
        setFavorites((current) =>
          current.filter((id) => id !== spotId)
        );
      }

      return;
    }

    const { error } = await supabase
      .from("favorites")
      .insert([
        {
          spot_id: spotId,
          user_id: session.id,
        },
      ]);

    if (!error) {
      setFavorites((current) => [...current, spotId]);
    }
  }

  function resetFilters() {
    setCategory(ALL_CATEGORIES);
    setSearch("");
    setMaxDistance(100);
    setShowOnlyFavs(false);
  }

  const filterContent = (
    <div className="rounded-[14px] border border-[#e8edf2] bg-white p-5 shadow-[0_8px_24px_rgba(15,35,62,.035)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="m-0 text-lg font-extrabold text-slate-900">
          {t(language, "filters")}
        </h2>

        <button
          type="button"
          onClick={resetFilters}
          className="border-0 bg-transparent text-sm font-semibold text-slate-500 hover:text-teal-600"
        >
          {t(language, "reset")}
        </button>
      </div>

      <h3 className="mb-3 text-sm font-bold text-slate-900">
        {t(language, "category")}
      </h3>

      <div className="mb-7 flex flex-col gap-2">
        <CategoryButton
          active={category === ALL_CATEGORIES}
          iconName="LayoutGrid"
          label={t(language, "allCategories")}
          onClick={() => setCategory(ALL_CATEGORIES)}
        />

        {categories.map((item) => (
          <div key={item.id} className={item.parentId ? "ml-4" : ""}>
            <CategoryButton
              active={category === item.name}
              iconName={item.icon}
              label={item.displayName}
              onClick={() => setCategory(item.name)}
            />
          </div>
        ))}
      </div>

      <div className="mb-7">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h3 className="m-0 text-sm font-bold text-slate-900">
            {t(language, "distance")}
          </h3>

          <span className="text-sm font-bold text-teal-600">
            {maxDistance >= 100
              ? t(language, "unlimited")
              : `${maxDistance} km`}
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="100"
          value={maxDistance}
          disabled={!hasHotelCoordinates}
          onChange={(event) =>
            setMaxDistance(Number(event.target.value))
          }
          aria-label={t(language, "distance")}
          className="w-full accent-teal-600 disabled:cursor-not-allowed disabled:opacity-40"
        />

        {!hasHotelCoordinates && (
          <p className="mb-0 mt-2 text-xs leading-relaxed text-slate-500">
            {t(language, "distanceNeedsHotel")}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="m-0 text-sm font-bold text-slate-900">
            {t(language, "favoritesOnly")}
          </h3>
          {!session && (
            <p className="mb-0 mt-1 text-xs text-slate-500">
              {t(language, "loginForFavorites")}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={!session}
          onClick={() =>
            setShowOnlyFavs((current) => !current)
          }
          aria-pressed={showOnlyFavs}
          aria-label={t(language, "favoritesOnly")}
          className={`relative h-6 w-11 rounded-full border-0 transition ${
            showOnlyFavs
              ? "bg-teal-600"
              : "bg-slate-200"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
              showOnlyFavs ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white px-4 py-6 font-[Poppins] text-[#10233f] md:px-6 md:py-8">
      <div className="mx-auto max-w-[1180px]">
        <section className="relative min-h-[360px] overflow-hidden rounded-[14px] bg-[#10233f] px-6 py-10 shadow-[0_12px_32px_rgba(16,35,63,.14)] md:min-h-[420px] md:px-12 md:py-14">
          <img
            src="https://pub-e91d905941ab460b95ac5248c28e16f3.r2.dev/assets/Entdecken%20Hero.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.94)_0%,rgba(2,6,23,0.84)_28%,rgba(2,6,23,0.52)_52%,rgba(2,6,23,0.12)_78%,rgba(2,6,23,0.02)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-slate-950/10" />

          <div className="relative z-10 flex min-h-[280px] max-w-4xl flex-col justify-center md:min-h-[312px] lg:min-h-[352px]">
            <span className="mb-4 inline-flex self-start rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-200 backdrop-blur-sm">
              Khao Lak Insider
            </span>

            <h1 className="mb-4 text-4xl font-black tracking-tight text-white md:text-6xl">
              {t(language, "discoverKhaoLak")}
            </h1>

            <p className="mb-8 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
              {t(language, "discoverIntro")}
            </p>

            <div className="relative w-full max-w-4xl">
              <Search
                size={21}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder={t(
                  language,
                  "discoverSearchPlaceholder"
                )}
                className="w-full rounded-2xl border border-white/10 bg-white py-4 pl-14 pr-12 text-base text-slate-900 shadow-lg outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-teal-400/20"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label={t(language, "clearSearch")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 border-0 bg-transparent text-slate-400"
                >
                  <X size={20} />
                </button>
              )}

            </div>
          </div>
        </section>

        <section
          aria-label={t(language, "statisticsOverview")}
          className="relative z-20 -mt-7 mb-8 overflow-hidden rounded-[14px] border border-[#e8edf2] bg-white shadow-[0_12px_30px_rgba(15,35,62,.08)] md:-mt-9"
        >
          <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 md:grid-cols-3 lg:grid-cols-5 lg:divide-y-0">
            {statistics.map((statistic) => (
              <div
                key={statistic.label}
                className="flex min-w-0 items-center gap-4 px-4 py-5 md:px-6"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                  <DynamicIcon
                    name={statistic.icon}
                    size={23}
                  />
                </div>

                <div className="min-w-0">
                  <div className="text-2xl font-black leading-none text-slate-900">
                    {statistic.value}
                  </div>

                  <div className="mt-1 text-sm font-extrabold text-slate-800">
                    {statistic.label}
                  </div>

                  <div className="mt-1 hidden text-xs leading-relaxed text-slate-500 xl:block">
                    {statistic.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
          <div>
            <p className="m-0 text-sm font-semibold text-slate-500">
              {t(language, "results")}
            </p>
            <p className="m-0 text-xl font-black text-slate-900">
              {filteredSpots.length}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 shadow-sm"
          >
            <SlidersHorizontal size={18} />
            {t(language, "filters")}
          </button>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)_260px]">
          <aside className="sticky top-5 hidden lg:block">
            {filterContent}
          </aside>

          <section className="min-w-0">
            <div className="mb-6 hidden items-end justify-between gap-5 lg:flex">
              <div>
                <p className="mb-1 text-sm font-bold uppercase tracking-wider text-teal-600">
                  {t(language, "results")}
                </p>
                <h2 className="m-0 text-3xl font-black text-slate-900">
                  {t(language, "placesFound").replace(
                    "{count}",
                    String(filteredSpots.length)
                  )}
                </h2>
              </div>
            </div>

            {filteredSpots.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {filteredSpots.map((spot) => {
                  const localizedTitle =
                    getLocalizedField(
                      spot,
                      "title",
                      language
                    );

                  const localizedDescription =
                    getLocalizedField(
                      spot,
                      "description",
                      language
                    );

                  const localizedCategory =
                    getLocalizedField(
                      spot,
                      "category",
                      language
                    );

                  const distance = calculateDistance(
                    spot.latitude,
                    spot.longitude
                  );

                  const isFavorite = favorites.includes(
                    spot.id
                  );

                  return (
                    <article
                      key={spot.id}
                      className="group overflow-hidden rounded-[14px] border border-[#e8edf2] bg-white shadow-[0_8px_24px_rgba(15,35,62,.035)] transition duration-300 hover:-translate-y-1 hover:border-[#d9e4e9] hover:shadow-[0_16px_36px_rgba(15,35,62,.09)]"
                    >
                      <div className="relative">
                        <Link
                          href={localizedHref(
                            `/spot/${spot.slug}`
                          )}
                          className="block"
                        >
                          <img
                            src={
                              spot.image_url ||
                              "/images/og-image.jpg"
                            }
                            alt={localizedTitle}
                            className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </Link>

                        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-extrabold text-slate-800 shadow-sm backdrop-blur">
                          <DynamicIcon
                            name={getIconForCategory(
                              spot.category
                            )}
                            size={15}
                          />
                          {localizedCategory}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            toggleFavorite(spot.id)
                          }
                          aria-label={
                            isFavorite
                              ? t(
                                  language,
                                  "removeFavorite"
                                )
                              : t(
                                  language,
                                  "addFavorite"
                                )
                          }
                          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border-0 bg-white/90 shadow-sm backdrop-blur transition hover:scale-105 ${
                            isFavorite
                              ? "text-red-500"
                              : "text-slate-400"
                          }`}
                        >
                          <Heart
                            size={21}
                            fill={
                              isFavorite
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>
                      </div>

                      <div className="p-5">
                        <Link
                          href={localizedHref(
                            `/spot/${spot.slug}`
                          )}
                          className="text-decoration-none"
                        >
                          <h3 className="mb-2 text-xl font-extrabold text-[#10233f] transition group-hover:text-[#079ca5]">
                            {localizedTitle}
                          </h3>
                        </Link>

                        {session && (
                          <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-teal-600">
                            <MapPin size={14} />
                            {distance !== null
                              ? t(
                                  language,
                                  "distanceFromAccommodation"
                                ).replace(
                                  "{distance}",
                                  String(distance)
                                )
                              : t(
                                  language,
                                  "accommodationNotSet"
                                )}
                          </div>
                        )}

                        <p className="m-0 text-sm leading-6 text-slate-600">
                          {truncateText(
                            localizedDescription
                          )}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[14px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <Search
                  size={36}
                  className="mx-auto mb-4 text-slate-300"
                />
                <h3 className="mb-2 text-xl font-black text-slate-900">
                  {t(language, "noPlacesFound")}
                </h3>
                <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-slate-500">
                  {t(language, "adjustFilters")}
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-xl border-0 bg-teal-600 px-5 py-3 font-bold text-white"
                >
                  {t(language, "resetFilters")}
                </button>
              </div>
            )}
          </section>

          <aside className="space-y-6 lg:sticky lg:top-5">
            <div className="rounded-[14px] border border-[#e8edf2] bg-white p-5 shadow-[0_8px_24px_rgba(15,35,62,.035)]">
              <h3 className="mb-4 text-lg font-extrabold text-slate-900">
                {t(language, "mapAndDiscover")}
              </h3>

              <div className="h-52 overflow-hidden rounded-2xl bg-slate-100">
                {session ? (
                  hasHotelCoordinates ? (
                    <MapBoxMini
                      lat={hotelLat}
                      lng={hotelLng}
                    />
                  ) : (
                    <Link
                      href={localizedHref("/profile")}
                      className="flex h-full items-center justify-center px-5 text-center text-sm font-bold leading-relaxed text-teal-600 text-decoration-none"
                    >
                      {t(language, "selectHotelForMap")}
                    </Link>
                  )
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4 px-5 text-center">
                    <p className="m-0 text-sm font-semibold leading-relaxed text-slate-600">
                      {t(language, "loginForMap")}
                    </p>

                    <div className="flex flex-wrap justify-center gap-2">
                      <Link
                        href={localizedHref("/login")}
                        className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white text-decoration-none"
                      >
                        <LogIn size={15} />
                        {t(language, "login")}
                      </Link>

                      <Link
                        href={localizedHref(
                          "/registrieren"
                        )}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-teal-600 text-decoration-none"
                      >
                        <UserPlus size={15} />
                        {t(language, "register")}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href={localizedHref("/planen")}
                className="mt-4 block text-center text-sm font-extrabold text-teal-600 text-decoration-none"
              >
                {t(language, "exploreInteractiveMap")} →
              </Link>
            </div>

          </aside>
        </div>
      </div>

      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/50 p-3 backdrop-blur-sm lg:hidden">
          <div className="max-h-[90vh] w-full overflow-y-auto rounded-[28px] bg-slate-50 p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between px-2 py-2">
              <h2 className="m-0 text-lg font-black text-slate-900">
                {t(language, "filters")}
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowMobileFilters(false)
                }
                aria-label={t(language, "close")}
                className="flex h-10 w-10 items-center justify-center rounded-full border-0 bg-white text-slate-600"
              >
                <X size={21} />
              </button>
            </div>

            {filterContent}

            <button
              type="button"
              onClick={() =>
                setShowMobileFilters(false)
              }
              className="mt-3 w-full rounded-2xl border-0 bg-teal-600 px-5 py-4 font-extrabold text-white"
            >
              {t(language, "showResults").replace(
                "{count}",
                String(filteredSpots.length)
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function CategoryButton({
  active,
  iconName,
  label,
  onClick,
}: {
  active: boolean;
  iconName: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition ${
        active
          ? "border-teal-600 bg-teal-50 text-teal-700"
          : "border-transparent bg-transparent text-slate-600 hover:bg-slate-50"
      }`}
    >
      <DynamicIcon name={iconName} size={18} />
      {label}
    </button>
  );
}

function DynamicIcon({
  name,
  size = 16,
}: {
  name: string;
  size?: number;
}) {
  const IconComponent = (
    LucideIcons as unknown as Record<
      string,
      React.ComponentType<{ size?: number }>
    >
  )[name];

  return IconComponent ? (
    <IconComponent size={size} />
  ) : (
    <MapPin size={size} />
  );
}
