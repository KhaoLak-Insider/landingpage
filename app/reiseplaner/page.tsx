"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { getLanguageFromPathname } from "@/src/lib/i18n-routing";
import type { User } from "@supabase/supabase-js";

  type PlannerEvent = {
  id: string;
  dayIndex: number;
  startHour: number;
  durationHours: number;
  title: string;
  subtitle: string;
  category: string;
  color: string;
};

type WeatherDay = {
  date: string;
  minTemp: number;
  maxTemp: number;
  precipitation: number;
  weatherCode: number;
};

function formatLocalDateKey(value: Date | string) {
  const date = typeof value === "string" ? new Date(`${value.slice(0, 10)}T12:00:00`) : value;
  return formatDateKey(date);
}

type Spot = {
  id: string;
  title: string;
  title_en?: string | null;
  image_url?: string | null;
  google_photo_reference?: string | null;
  category?: string | null;
  category_en?: string | null;
  slug?: string | null;
  description?: string | null;
  description_en?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  price_level?: number | null;
  stars?: number | null;
};

type PlannerTrip = {
  id: string;
  arrival_date: string;
  departure_date: string;
  rest_days: number;
  traveler_count: number;
  budget_amount: number;
  has_rental_car: boolean;
  has_scooter: boolean;
};

const plannerStats = [
  { label: "Saved spots", value: "18", help: "Imported from favorites" },
  { label: "Active days", value: "7", help: "Weekly itinerary view" },
  { label: "Route gaps", value: "2", help: "Needs optimization" },
];

const plannerActions = [
  "Auto-fill day slots from favorites",
  "Balance beach, food and excursion days",
  "Keep a buffer for weather changes",
];

const demoDays = [
  { day: "Day 1", title: "Beach + sunset", note: "Nang Thong, easy dinner" },
  { day: "Day 2", title: "Food + hidden gems", note: "Local lunch, market stop" },
  { day: "Day 3", title: "Relaxed route", note: "Spa break, sunset viewpoint" },
];


const WEATHER_LAT = 8.6502;
const WEATHER_LON = 98.2495;

function weatherLabel(code: number, language: string) {
  if (language === "en") {
    if (code === 0) return "Clear";
    if ([1, 2].includes(code)) return "Partly cloudy";
    if ([3].includes(code)) return "Cloudy";
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Rain";
    if ([71, 73, 75, 77].includes(code)) return "Snow";
    if ([95, 96, 99].includes(code)) return "Storm";
    return "Mixed";
  }
  if (code === 0) return "Klar";
  if ([1, 2].includes(code)) return "Teilweise bewölkt";
  if ([3].includes(code)) return "Bewölkt";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Regen";
  if ([71, 73, 75, 77].includes(code)) return "Schnee";
  if ([95, 96, 99].includes(code)) return "Gewitter";
  return "Gemischt";
}

function formatTime(value: number) {
  const minutes = Math.max(0, Math.min(24 * 60, Math.round(value * 60)));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLocalTodayKey() {
  return formatDateKey(new Date());
}

const DEFAULT_TRIP_DAYS = 14;

function getDefaultTripDates() {
  const startDate = new Date();
  startDate.setHours(12, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + DEFAULT_TRIP_DAYS - 1);
  return {
    startDate: formatDateKey(startDate),
    endDate: formatDateKey(endDate),
  };
}

export default function ReiseplanerPage() {
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);
  const defaultTripDates = getDefaultTripDates();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [arrivalDate, setArrivalDate] = useState(defaultTripDates.startDate);
  const [departureDate, setDepartureDate] = useState(defaultTripDates.endDate);
  const [restDays, setRestDays] = useState(2);
  const [travelerCount, setTravelerCount] = useState(2);
  const [budgetAmount, setBudgetAmount] = useState(1850);
  const [hasRentalCar, setHasRentalCar] = useState(1);
  const [hasScooter, setHasScooter] = useState(0);
  const [weekPageOffset, setWeekPageOffset] = useState(0);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [spotPickerDayIndex, setSpotPickerDayIndex] = useState<number | null>(null);
  const [spotSearch, setSpotSearch] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [plannerEvents, setPlannerEvents] = useState<PlannerEvent[]>([]);
  const [plannerTripId, setPlannerTripId] = useState<string | null>(null);
  const [weatherDays, setWeatherDays] = useState<WeatherDay[]>([]);
  const [currentWeather, setCurrentWeather] = useState<WeatherDay | null>(null);
  const [weatherStatus, setWeatherStatus] = useState<"loading" | "ready" | "error">("loading");
  const [spots, setSpots] = useState<Spot[]>([]);
  const [isRemovingEvent, setIsRemovingEvent] = useState(false);
  const nextLocalEventId = useRef(0);
  const [hasManualWeekPage, setHasManualWeekPage] = useState(false);

  const saveTrip = useCallback(async (nextValues: Partial<PlannerTrip>) => {
    if (!user) return null;
    try {
      const payload = {
        user_id: user.id,
        arrival_date: arrivalDate,
        departure_date: departureDate,
        rest_days: restDays,
        traveler_count: travelerCount,
        budget_amount: budgetAmount,
        has_rental_car: hasRentalCar === 1,
        has_scooter: hasScooter === 1,
        ...nextValues,
      };
      const { data, error } = await supabase
        .from("planner_trips")
        .upsert(payload, { onConflict: "user_id" })
        .select("id, arrival_date, departure_date, rest_days, traveler_count, budget_amount, has_rental_car, has_scooter")
        .single();
      if (error) throw error;
      setPlannerTripId(data.id);
      setArrivalDate(data.arrival_date);
      setDepartureDate(data.departure_date);
      setRestDays(data.rest_days);
      setTravelerCount(data.traveler_count ?? 2);
      setBudgetAmount(data.budget_amount ?? 1850);
      setHasRentalCar(data.has_rental_car ? 1 : 0);
      setHasScooter(data.has_scooter ? 1 : 0);
      return data as PlannerTrip;
    } catch (error) {
      console.warn("Planner trip could not be saved:", error);
      return null;
    }
  }, [arrivalDate, budgetAmount, departureDate, hasRentalCar, hasScooter, restDays, travelerCount, user]);

  useEffect(() => {
    let alive = true;
    async function loadAccess() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!alive) return;
        setUser(user);
        if (!user) {
          setPlannerEvents([]);
          setLoading(false);
          return;
        }
        const { data: trip, error: tripError } = await supabase
          .from("planner_trips")
          .select("id, arrival_date, departure_date, rest_days, traveler_count, budget_amount, has_rental_car, has_scooter")
          .eq("user_id", user.id)
          .maybeSingle();

        if (tripError) {
          console.warn("Planner trip load failed:", tripError);
          setPlannerTripId(null);
          setPlannerEvents([]);
          return;
        }

        if (!trip) {
          setPlannerTripId(null);
          setPlannerEvents([]);
          return;
        }

        setPlannerTripId(trip.id);
        setArrivalDate(trip.arrival_date);
        setDepartureDate(trip.departure_date);
        setRestDays(trip.rest_days);
        setTravelerCount(trip.traveler_count ?? 2);
        setBudgetAmount(trip.budget_amount ?? 1850);
        setHasRentalCar(trip.has_rental_car ? 1 : 0);
        setHasScooter(trip.has_scooter ? 1 : 0);

        const { data: events, error: eventsError } = await supabase
          .from("planner_events")
          .select("id, day_index, start_hour, duration_hours, title, subtitle, category, color")
          .eq("trip_id", trip.id)
          .order("day_index")
          .order("start_hour");

        if (eventsError) {
          console.warn("Planner events load failed:", eventsError);
          setPlannerEvents([]);
          return;
        }

        setPlannerEvents((events || []).map((event) => ({
          id: event.id,
          dayIndex: event.day_index,
          startHour: Number(event.start_hour),
          durationHours: Number(event.duration_hours),
          title: event.title,
          subtitle: event.subtitle,
          category: event.category,
          color: event.color,
        })));
      } catch (error) {
        console.error("Planner access load failed:", error);
        if (!alive) return;
        setPlannerTripId(null);
        setPlannerEvents([]);
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadAccess();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadAccess();
    });
    return () => {
      alive = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function ensurePlannerTripId() {
    if (plannerTripId) return plannerTripId;
    if (!user) return null;
    const trip = await saveTrip({});
    return trip?.id ?? null;
  }

  const copy = language === "en"
    ? {
        eyebrow: "Trip planner",
        title: "Plan your Khao Lak trip at a glance",
        intro: "A clean weekly board for day-by-day planning, quick edits, and a future weather preview. Everything important stays visible without feeling crowded.",
        primaryCta: "Open calendar",
        secondaryCta: "Explore favorites",
        sectionTitle: "Weekly itinerary",
        sectionText: "One week per page, day headers at the top, and room for weather, notes, and route context later.",
      }
    : {
        eyebrow: "Reiseplaner",
        title: "Plane deine Khao-Lak-Reise auf einen Blick",
        intro: "Ein klares Wochenboard für die Tagesplanung, schnelle Anpassungen und später die Wettervorhersage pro Tag. Wichtiges bleibt sichtbar, ohne überladen zu wirken.",
        primaryCta: "Kalender öffnen",
        secondaryCta: "Favoriten ansehen",
        sectionTitle: "Wochenübersicht",
        sectionText: "Eine Woche pro Seite, Tagesköpfe oben und später Platz für Wetter, Notizen und Routeninfos.",
      };

  const todayKey = getLocalTodayKey();
  const planningStartDate = arrivalDate && arrivalDate > todayKey ? arrivalDate : todayKey;
  const tripLength = planningStartDate && departureDate
    ? Math.max(1, Math.ceil((new Date(`${departureDate}T00:00:00`).getTime() - new Date(`${planningStartDate}T00:00:00`).getTime()) / 86400000) + 1)
    : 0;
  const plannedBudgetUsed = 0;
  const budgetProgress = budgetAmount > 0 ? Math.min(100, Math.round((plannedBudgetUsed / budgetAmount) * 100)) : 0;

  const tripDays = Array.from({ length: tripLength }, (_, index) => {
    const date = new Date(`${planningStartDate}T00:00:00`);
    date.setDate(date.getDate() + index);
    const dateKey = formatDateKey(date);
    return {
      tripDayIndex: index,
      dateKey,
      label: date.toLocaleDateString(language === "en" ? "en-GB" : "de-DE", { weekday: "short" }),
      dateLabel: date.toLocaleDateString(language === "en" ? "en-GB" : "de-DE", { day: "2-digit", month: "2-digit" }),
      weatherKey: dateKey,
    };
  });
  const totalPages = Math.max(1, Math.ceil(tripDays.length / 5));
  const todayTripDayIndex = tripDays.findIndex((day) => day.dateKey === todayKey);
  const initialPage = Math.max(0, Math.min(totalPages - 1, todayTripDayIndex >= 0 ? Math.floor(todayTripDayIndex / 5) : 0));
  const currentPage = Math.min(totalPages - 1, hasManualWeekPage ? weekPageOffset : initialPage);
  const visibleDays = tripDays.slice(currentPage * 5, currentPage * 5 + 5);
  const visiblePageStart = currentPage * 5 + 1;
  const visiblePageEnd = Math.min(tripDays.length, currentPage * 5 + visibleDays.length);

  const transportMode = hasRentalCar === 1 ? "car" : hasScooter === 1 ? "scooter" : "walking";

  function shiftEventTime(eventId: string, deltaMinutes: number) {
    setPlannerEvents((current) => current.map((item) => {
      if (item.id !== eventId) return item;
      const nextStart = Math.max(0, Math.min(24 - item.durationHours, item.startHour + deltaMinutes / 60));
      const updated = { ...item, startHour: Math.round(nextStart * 2) / 2 };
      void supabase.from("planner_events").update({
        start_hour: updated.startHour,
      }).eq("id", eventId).then(({ error }) => {
        if (error) console.warn("Planner event time update failed:", error);
      });
      return updated;
    }));
  }

  function moveEventToDay(eventId: string, dayIndex: number) {
    setPlannerEvents((current) => current.map((item) => {
      if (item.id !== eventId) return item;
      const updated = { ...item, dayIndex };
      void supabase.from("planner_events").update({
        day_index: dayIndex,
      }).eq("id", eventId).then(({ error }) => {
        if (error) console.warn("Planner event day update failed:", error);
      });
      return updated;
    }));
  }

  function sortDayEvents(events: PlannerEvent[]) {
    return [...events].sort((a, b) => a.startHour - b.startHour || a.title.localeCompare(b.title, language === "en" ? "en" : "de", { sensitivity: "base" }));
  }

  function getDayEvents(dayIndex: number) {
    return sortDayEvents(plannerEvents.filter((event) => event.dayIndex === dayIndex));
  }

  const selectedEvent = plannerEvents.find((event) => event.id === selectedEventId) || null;

  function updateEvent(eventId: string, updates: Partial<PlannerEvent>) {
    setPlannerEvents((current) => current.map((item) => {
      if (item.id !== eventId) return item;
      return { ...item, ...updates };
    }));
    void supabase.from("planner_events").update({
      day_index: updates.dayIndex,
      start_hour: updates.startHour,
      duration_hours: updates.durationHours,
      title: updates.title,
      subtitle: updates.subtitle,
      category: updates.category,
      color: updates.color,
    }).eq("id", eventId).then(({ error }) => {
      if (error) console.warn("Planner event update failed:", error);
    });
  }

  async function handleRemoveSelectedEvent() {
    if (!selectedEvent || isRemovingEvent) return;
    const confirmed = window.confirm(`${resolveSpotTitle(selectedEvent)} wirklich aus deinem Reiseplan entfernen?`);
    if (!confirmed) return;
    setIsRemovingEvent(true);
    try {
      console.log("Removing planner activity:", {
        plannerEventId: selectedEvent.id,
        spotTitle: selectedEvent.title,
        tripId: plannerTripId,
      });
      const { data, error } = await supabase
        .from("planner_events")
        .delete()
        .eq("id", selectedEvent.id)
        .select("id");
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Es wurde kein Planner-Eintrag mit dieser ID gelöscht.");
      }
      setPlannerEvents((current) => current.filter((event) => event.id !== selectedEvent.id));
      setSelectedEventId(null);
    } catch (error) {
      console.error("Planner event delete failed:", error);
    } finally {
      setIsRemovingEvent(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
      setWeatherStatus((current) => current === "ready" ? current : "error");
    }, 3000);
    async function loadWeather() {
      try {
        const response = await fetch(`/api/weather?latitude=${WEATHER_LAT}&longitude=${WEATHER_LON}`, { signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        const dates = data?.daily?.time ?? [];
        const mins = data?.daily?.temperature_2m_min ?? [];
        const maxs = data?.daily?.temperature_2m_max ?? [];
        const precipitation = data?.daily?.precipitation_sum ?? [];
        const codes = data?.daily?.weather_code ?? [];
        const current = data?.current_weather;
        if (current) {
          setCurrentWeather({
            date: todayKey,
            minTemp: Number(current.temperature) || 0,
            maxTemp: Number(current.temperature) || 0,
            precipitation: 0,
            weatherCode: Number(current.weathercode) || 0,
          });
        } else {
          setCurrentWeather(null);
        }
        setWeatherDays(dates.map((date: string, index: number) => ({
          date: formatLocalDateKey(date),
          minTemp: mins[index] ?? 0,
          maxTemp: maxs[index] ?? 0,
          precipitation: precipitation[index] ?? 0,
          weatherCode: codes[index] ?? 0,
        })));
        setWeatherStatus("ready");
      } catch {
        if (!controller.signal.aborted) {
          setWeatherDays([]);
          setCurrentWeather(null);
          setWeatherStatus("error");
        }
      }
    }
    loadWeather();
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [todayKey]);

  useEffect(() => {
    let alive = true;
    async function loadSpots() {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 5000);
      try {
        const response = await fetch("/api/spots", { signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        const items = Array.isArray(data?.result) ? data.result : [];
        if (alive) setSpots(items);
      } catch {
        if (alive) setSpots([]);
      } finally {
        window.clearTimeout(timeoutId);
      }
    }
    loadSpots();
    return () => {
      alive = false;
    };
  }, []);

  const spotCatalog = spots.length > 0 ? spots : [
    { id: "fallback-beach", title: "Beach", image_url: "", category: "Beach" },
  ];
  const selectedSpot = selectedEvent
    ? spotCatalog.find((spot) => {
        const title = (language === "en" ? spot.title_en || spot.title : spot.title) || "";
        return title.toLowerCase() === selectedEvent.title.toLowerCase();
      }) || null
    : null;
  const sortedSpotCatalog = [...spotCatalog].sort((a, b) => {
    const left = (language === "en" ? a.title_en || a.title : a.title) || "";
    const right = (language === "en" ? b.title_en || b.title : b.title) || "";
    return left.localeCompare(right, language === "en" ? "en" : "de", { sensitivity: "base" });
  });
  const filteredSpotCatalog = sortedSpotCatalog.filter((spot) => {
    const title = (language === "en" ? spot.title_en || spot.title : spot.title) || "";
    const category = (language === "en" ? spot.category_en || spot.category : spot.category) || "";
    const search = spotSearch.trim().toLowerCase();
    if (!search) return true;
    return `${title} ${category}`.toLowerCase().includes(search);
  });

  const weatherByDate = weatherDays.reduce<Record<string, WeatherDay>>((acc, day) => {
    acc[formatLocalDateKey(day.date)] = day;
    return acc;
  }, {});
  if (currentWeather) {
    weatherByDate[todayKey] = weatherByDate[todayKey] || currentWeather;
  }

  function resolveSpotTitle(event: PlannerEvent) {
    const matched = spotCatalog.find((spot) => {
      const title = (language === "en" ? spot.title_en || spot.title : spot.title) || "";
      return title.toLowerCase() === event.title.toLowerCase();
    });
    return matched ? (language === "en" ? matched.title_en || matched.title : matched.title) : event.title;
  }

  function resolveSpotImage(event: PlannerEvent) {
    const matched = spotCatalog.find((spot) => {
      const title = (language === "en" ? spot.title_en || spot.title : spot.title) || "";
      return title.toLowerCase() === event.title.toLowerCase();
    });
    if (!matched) return "";
    if (matched.google_photo_reference) {
      return `/api/google-place-photo?photo_reference=${encodeURIComponent(matched.google_photo_reference)}&maxwidth=1200`;
    }
    return matched.image_url || "";
  }

  function addSpotToDay(dayIndex: number, spot: Spot) {
    const dayEvents = plannerEvents.filter((event) => event.dayIndex === dayIndex);
    const lastEvent = dayEvents[dayEvents.length - 1];
    const nextStart = lastEvent ? Math.min(22, Math.round((lastEvent.startHour + lastEvent.durationHours + 0.5) * 2) / 2) : 10;
    const nextDuration = 1.5;
    const category = (language === "en" ? spot.category_en || spot.category : spot.category) || "Spot";
    nextLocalEventId.current += 1;
    const eventId = `${spot.id}-local-${nextLocalEventId.current}`;
    setPlannerEvents((current) => [
      ...current,
      {
        id: eventId,
        dayIndex,
        startHour: nextStart,
        durationHours: nextDuration,
        title: language === "en" ? spot.title_en || spot.title : spot.title,
        subtitle: category,
        category,
        color: "#128fa3",
      },
    ]);
    setSpotPickerDayIndex(null);
    setSpotSearch("");
    void (async () => {
      try {
        const tripId = await ensurePlannerTripId();
        if (!tripId) return;
        const newEvent = {
          trip_id: tripId,
          day_index: dayIndex,
          start_hour: nextStart,
          duration_hours: nextDuration,
          title: language === "en" ? spot.title_en || spot.title : spot.title,
          subtitle: category,
          category,
          color: "#128fa3",
          spot_id: spot.id,
        };
        const { data, error } = await supabase.from("planner_events").insert([newEvent]).select("id").single();
        if (error || !data) {
          console.warn("Planner event could not be saved:", error);
          return;
        }
        setPlannerEvents((current) => current.map((event) => event.id === eventId ? { ...event, id: data.id } : event));
      } catch (error) {
        console.warn("Planner event insert failed:", error);
      }
    })();
  }

  if (loading) {
    return (
      <main className="reiseplaner-loading">
        <div className="reiseplaner-loading__card">
          <Sparkles size={26} className="reiseplaner-spin" />
          <p>{language === "en" ? "Checking planner access..." : "Prüfe Planner-Zugriff..."}</p>
        </div>
        <style jsx>{`
          .reiseplaner-loading{min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at top,#eefafa 0%,#f7fafb 45%,#f4f7f8 100%);color:#10233f}
          .reiseplaner-loading__card{display:flex;flex-direction:column;align-items:center;gap:12px;padding:24px 28px;border:1px solid #dbe7ea;border-radius:22px;background:rgba(255,255,255,.94);box-shadow:0 14px 35px rgba(15,35,62,.08);font-weight:700}
          .reiseplaner-spin{color:#128fa3;animation:spin 1s linear infinite}
          @keyframes spin{to{transform:rotate(360deg)}}
        `}</style>
      </main>
    );
  }

  const favorites = [
    { name: "Coral Beach", category: "Strand", image: "/images/beach.png" },
    { name: "Lam Ru Waterfall", category: "Natur", image: "/images/nature.png" },
    { name: "Nang Thong Beach", category: "Strand", image: "/images/beach.png" },
    { name: "Little Amazon", category: "Khao Lak", image: "/images/market.png" },
  ];

  return (
    <main className="reiseplaner-page">
      <div className="reiseplaner-shell">
        <section className="reiseplaner-compact-hero">
          <div className="reiseplaner-compact-hero__title">
            <span>{copy.eyebrow}</span>
            <h1>{copy.title}</h1>
            <div className="reiseplaner-compact-hero__wave" aria-hidden="true" />
          </div>
          <div className="reiseplaner-compact-hero__actions">
            <button type="button" className="reiseplaner-action reiseplaner-action--primary">{language === "en" ? "Plan with AI" : "Mit KI planen"}</button>
            <button type="button" className="reiseplaner-action">{language === "en" ? "Optimize route" : "Route optimieren"}</button>
          </div>
        </section>

        <section className="reiseplaner-summary">
          <article className="reiseplaner-summary__trip">
            <div className="reiseplaner-summary__image" />
            <div className="reiseplaner-summary__copy">
              <span className="reiseplaner-eyebrow">{language === "en" ? "Trip overview" : "Reiseübersicht"}</span>
              <h2>Khao Lak, Thailand</h2>
              <div className="reiseplaner-summary__meta">
                <strong>{arrivalDate} - {departureDate}</strong>
                <span>{tripLength} {language === "en" ? "nights" : "Nächte"}</span>
              </div>
              <p>{weatherStatus === "ready" && weatherDays[0] ? `${Math.round(weatherDays[0].minTemp)}-${Math.round(weatherDays[0].maxTemp)}°C · ${weatherLabel(weatherDays[0].weatherCode, language)}` : language === "en" ? "Weather forecast loading..." : "Wettervorhersage wird geladen..."}</p>
              <button
                type="button"
                className="reiseplaner-linkbutton"
                onClick={() => setSettingsExpanded((value) => !value)}
                aria-expanded={settingsExpanded}
                aria-controls="reiseplaner-settings-panel"
              >
                {language === "en" ? "Edit trip details" : "Reisedetails bearbeiten"}
              </button>
              <div
                id="reiseplaner-settings-panel"
                className={`reiseplaner-inline-settings ${settingsExpanded ? "is-open" : ""}`}
                aria-label={language === "en" ? "Planner settings" : "Planer-Einstellungen"}
                hidden={!settingsExpanded}
              >
                <div className="reiseplaner-inline-settings__head">
                  <span>{language === "en" ? "Planner settings" : "Planer-Einstellungen"}</span>
                  <strong>{language === "en" ? "Trip setup" : "Reise-Setup"}</strong>
                </div>
                <div className="reiseplaner-settings">
                  <label>
                    <span>{language === "en" ? "Arrival" : "Anreise"}</span>
                    <input type="date" value={arrivalDate} onChange={(e) => { const next = e.target.value; setArrivalDate(next); if (departureDate && next && departureDate < next) setDepartureDate(next); void saveTrip({ arrival_date: next, departure_date: departureDate && next && departureDate < next ? next : departureDate }); }} />
                  </label>
                  <label>
                    <span>{language === "en" ? "Departure" : "Abreise"}</span>
                    <input type="date" min={arrivalDate || undefined} value={departureDate} onChange={(e) => { const next = e.target.value; setDepartureDate(next); void saveTrip({ departure_date: next }); }} />
                  </label>
                  <label>
                    <span>{language === "en" ? "Rest days" : "Ruhetage"}</span>
                    <input type="range" min="0" max={Math.max(0, tripLength - 1)} value={restDays} onChange={(e) => { const next = Number(e.target.value); setRestDays(next); void saveTrip({ rest_days: next }); }} />
                  </label>
                  <label>
                    <span>{language === "en" ? "Travelers" : "Reisende"}</span>
                    <input type="number" min="1" max="20" value={travelerCount} onChange={(e) => { const next = Math.max(1, Number(e.target.value) || 1); setTravelerCount(next); void saveTrip({ traveler_count: next }); }} />
                  </label>
                  <label>
                    <span>{language === "en" ? "Budget" : "Budget"}</span>
                    <input type="number" min="0" step="50" value={budgetAmount} onChange={(e) => { const next = Math.max(0, Number(e.target.value) || 0); setBudgetAmount(next); void saveTrip({ budget_amount: next }); }} />
                  </label>
                  <label>
                    <div className="transport-toggle-row">
                      <div className="transport-toggle-label">
                        <strong>{language === "en" ? "Rental car" : "Mietwagen"}</strong>
                        <span>{language === "en" ? "Include in route planning" : "Für die Routenplanung berücksichtigen"}</span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={hasRentalCar === 1}
                        aria-label={language === "en" ? "Toggle rental car" : "Mietwagen ein- oder ausschalten"}
                        className={`transport-toggle ${hasRentalCar === 1 ? "is-active" : ""}`}
                        onClick={() => {
                          const next = hasRentalCar === 1 ? 0 : 1;
                          setHasRentalCar(next);
                          if (next === 1) setHasScooter(0);
                          void saveTrip({ has_rental_car: next === 1, has_scooter: next === 1 ? false : hasScooter === 1 });
                        }}
                      >
                        <span className="transport-toggle-thumb" />
                      </button>
                    </div>
                  </label>
                  <label>
                    <div className="transport-toggle-row">
                      <div className="transport-toggle-label">
                        <strong>{language === "en" ? "Scooter" : "Roller"}</strong>
                        <span>{language === "en" ? "Include in route planning" : "Für die Routenplanung berücksichtigen"}</span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={hasScooter === 1}
                        aria-label={language === "en" ? "Toggle scooter" : "Roller ein- oder ausschalten"}
                        className={`transport-toggle ${hasScooter === 1 ? "is-active" : ""}`}
                        onClick={() => {
                          const next = hasScooter === 1 ? 0 : 1;
                          setHasScooter(next);
                          if (next === 1) setHasRentalCar(0);
                          void saveTrip({ has_scooter: next === 1, has_rental_car: next === 1 ? false : hasRentalCar === 1 });
                        }}
                      >
                        <span className="transport-toggle-thumb" />
                      </button>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </article>
          <article className="reiseplaner-summary__card">
            <span className="reiseplaner-eyebrow">{language === "en" ? "Budget overview" : "Budget Überblick"}</span>
            <div className="reiseplaner-summary__budget">
              <div className="reiseplaner-summary__budget-copy">
                <strong>€{budgetAmount.toLocaleString(language === "en" ? "en-US" : "de-DE")}</strong>
                <small>{travelerCount} {language === "en" ? "travelers" : "Reisende"} · {language === "en" ? "used" : "verplant"} €{plannedBudgetUsed.toLocaleString(language === "en" ? "en-US" : "de-DE")}</small>
              </div>
              <div className="reiseplaner-summary__ring" style={{ background: `conic-gradient(#128fa3 0 ${budgetProgress}%, #e6ecee ${budgetProgress}% 100%)` }}>
                <span>{budgetProgress}%</span>
              </div>
            </div>
          </article>
          <article className="reiseplaner-summary__card">
            <span className="reiseplaner-eyebrow">{language === "en" ? "Notes" : "Notizen"}</span>
            <h3>{language === "en" ? "Don't miss sunset at the beach" : "Sonnenuntergänge am Strand nicht verpassen"}</h3>
            <p>{language === "en" ? "Later this card can also show the daily weather forecast." : "Später kann diese Kachel auch die Wettervorhersage pro Tag zeigen."}</p>
            <button type="button" className="reiseplaner-linkbutton">{language === "en" ? "Edit note" : "Notiz bearbeiten"}</button>
          </article>
        </section>

        <section className="reiseplaner-boardwrap">
          <div className="reiseplaner-boardhead">
            <div className="reiseplaner-weeknav">
              <button type="button" onClick={() => { setHasManualWeekPage(true); setWeekPageOffset((c) => Math.max(0, c - 1)); }} disabled={currentPage === 0}><ChevronLeft size={16} /></button>
              <span>{language === "en" ? "Days" : "Tage"} {visiblePageStart}-{visiblePageEnd} {language === "en" ? "of" : "von"} {tripDays.length}</span>
              <button type="button" onClick={() => { setHasManualWeekPage(true); setWeekPageOffset((c) => Math.min(totalPages - 1, c + 1)); }} disabled={currentPage >= totalPages - 1}><ChevronRight size={16} /></button>
            </div>
            <div className="reiseplaner-actions" />
          </div>

          <div className="planner-main-grid">
            <section className="planner-board">
              <div className="planner-days">
                {visibleDays.map((day) => (
                  <article key={day.dateKey} className="planner-day-column" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (draggedEventId) moveEventToDay(draggedEventId, day.tripDayIndex); setDraggedEventId(null); }}>
                    <header className="planner-day-column__head">
                      <div>
                        <strong>Tag {day.tripDayIndex + 1}</strong>
                        <span>{day.label}, {day.dateLabel}</span>
                      </div>
                      <div className="planner-day-column__weather">
                        <span className="planner-day-column__temp">{weatherStatus === "ready" && weatherByDate[day.weatherKey] ? `${Math.round(weatherByDate[day.weatherKey].minTemp)}-${Math.round(weatherByDate[day.weatherKey].maxTemp)}°C` : "--°C"}</span>
                        <span className="planner-day-column__rain">{weatherStatus === "ready" && weatherByDate[day.weatherKey] ? `${weatherLabel(weatherByDate[day.weatherKey].weatherCode, language)} · ${weatherByDate[day.weatherKey].precipitation.toFixed(1)} mm` : language === "en" ? "Weather pending" : "Wetterdaten liegen noch nicht vor"}</span>
                      </div>
                    </header>
                    <div className="planner-day-activities">
                      {(getDayEvents(day.tripDayIndex).length > 0
                        ? getDayEvents(day.tripDayIndex).map((event) => ({
                            eventId: event.id,
                            id: event.id,
                            time: `${formatTime(event.startHour)} - ${formatTime(event.startHour + event.durationHours)}`,
                            title: resolveSpotTitle(event),
                            subtitle: event.subtitle,
                            image: resolveSpotImage(event) || "/images/beach.png",
                            color: event.color,
                          }))
                        : []
                      ).map((activity, index) => (
                        <button
                          key={`${day.index}-${index}-${activity.title}`}
                          type="button"
                          className="planner-activity-card"
                          onClick={() => activity.eventId ? setSelectedEventId(activity.eventId) : undefined}
                        >
                          <div className="planner-activity-card__time">
                            <span>{activity.time}</span>
                            <i style={{ background: activity.color }} />
                          </div>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={activity.image} alt={activity.title} className="planner-activity-card__image" />
                          <strong>{activity.title}</strong>
                          <small>{activity.subtitle}</small>
                          <span className="planner-activity-card__menu">⋮</span>
                          <div className="planner-activity-card__shifts">
                            <button type="button" onClick={(e) => { e.stopPropagation(); if (activity.eventId) shiftEventTime(activity.eventId, -30); }}>↑</button>
                            <button type="button" onClick={(e) => { e.stopPropagation(); if (activity.eventId) shiftEventTime(activity.eventId, 30); }}>↓</button>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button type="button" className="planner-day-column__add" onClick={() => setSpotPickerDayIndex(day.tripDayIndex)}>
                      + {language === "en" ? "Add activity" : "Aktivität hinzufügen"}
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <aside className="planner-sidebar">
              <article className="planner-sidebar__card">
                <div className="planner-sidebar__head">
                  <strong>{language === "en" ? "Map" : "Karte"}</strong>
                  <button type="button">{language === "en" ? "Open fullscreen" : "Vollbild öffnen"}</button>
                </div>
                <div className="reiseplaner-map">
                  <div className="reiseplaner-map__overlay" />
                  <span className="reiseplaner-map__pin" />
                  <span className="reiseplaner-map__pin reiseplaner-map__pin--secondary" />
                  <span className="reiseplaner-map__route" />
                </div>
              </article>
              <article className="planner-sidebar__card">
                <div className="planner-sidebar__head">
                  <strong>{language === "en" ? "Favorites" : "Favoriten"}</strong>
                  <button type="button">{language === "en" ? "View all" : "Alle anzeigen"}</button>
                </div>
                <div className="reiseplaner-favorites">
                  {favorites.map((item) => (
                    <div key={item.name} className="reiseplaner-favorite">
                      <Image src={item.image} alt={item.name} width={46} height={40} />
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.category}</span>
                      </div>
                      <small>♥</small>
                    </div>
                  ))}
                </div>
              </article>
            </aside>
          </div>

          <section className="reiseplaner-infobar">
            <div><span>{language === "en" ? "Tip of the week" : "Tipp der Woche"}</span><strong>{language === "en" ? "Go early for the best beach light." : "Früh morgens hast du die besten Lichtverhältnisse."}</strong></div>
            <div><span>{language === "en" ? "Best travel time" : "Beste Reisezeit"}</span><strong>November - April</strong></div>
            <div><span>{language === "en" ? "Currency" : "Währung"}</span><strong>Thai Baht (THB)</strong></div>
            <div><span>{language === "en" ? "Language" : "Sprache"}</span><strong>Thai</strong></div>
          </section>
        </section>
      </div>

      {false ? (
        <div className="reiseplaner-modal" role="dialog" aria-modal="true" aria-label={language === "en" ? "Planner settings" : "Planer-Einstellungen"}>
          <div className="reiseplaner-modal__backdrop" onClick={() => setSettingsOpen(false)} />
          <div className="reiseplaner-modal__panel">
            <div className="reiseplaner-modal__head">
              <div>
                <span>{language === "en" ? "Planner settings" : "Planer-Einstellungen"}</span>
                <h3>{language === "en" ? "Trip setup" : "Reise-Setup"}</h3>
              </div>
              <button type="button" className="reiseplaner-modal__close" onClick={() => setSettingsOpen(false)}>×</button>
            </div>
            <div className="reiseplaner-settings">
              <label>
                <span>{language === "en" ? "Arrival" : "Anreise"}</span>
                <input type="date" value={arrivalDate} onChange={(e) => { const next = e.target.value; setArrivalDate(next); if (departureDate && next && departureDate < next) setDepartureDate(next); void saveTrip({ arrival_date: next, departure_date: departureDate && next && departureDate < next ? next : departureDate }); }} />
              </label>
              <label>
                <span>{language === "en" ? "Departure" : "Abreise"}</span>
                <input type="date" min={arrivalDate || undefined} value={departureDate} onChange={(e) => { const next = e.target.value; setDepartureDate(next); void saveTrip({ departure_date: next }); }} />
              </label>
              <label>
                <span>{language === "en" ? "Rest days" : "Ruhetage"}</span>
                <input type="range" min="0" max={Math.max(0, tripLength - 1)} value={restDays} onChange={(e) => { const next = Number(e.target.value); setRestDays(next); void saveTrip({ rest_days: next }); }} />
              </label>
              <label>
                <div className="transport-toggle-row">
                  <div className="transport-toggle-label">
                    <strong>{language === "en" ? "Rental car" : "Mietwagen"}</strong>
                    <span>{language === "en" ? "Include in route planning" : "Für die Routenplanung berücksichtigen"}</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={hasRentalCar === 1}
                    aria-label={language === "en" ? "Toggle rental car" : "Mietwagen ein- oder ausschalten"}
                    className={`transport-toggle ${hasRentalCar === 1 ? "is-active" : ""}`}
                    onClick={() => {
                      const next = hasRentalCar === 1 ? 0 : 1;
                      setHasRentalCar(next);
                      if (next === 1) setHasScooter(0);
                      void saveTrip({ has_rental_car: next === 1, has_scooter: next === 1 ? false : hasScooter === 1 });
                    }}
                  >
                    <span className="transport-toggle-thumb" />
                  </button>
                </div>
              </label>
              <label>
                <div className="transport-toggle-row">
                  <div className="transport-toggle-label">
                    <strong>{language === "en" ? "Scooter" : "Roller"}</strong>
                    <span>{language === "en" ? "Include in route planning" : "Für die Routenplanung berücksichtigen"}</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={hasScooter === 1}
                    aria-label={language === "en" ? "Toggle scooter" : "Roller ein- oder ausschalten"}
                    className={`transport-toggle ${hasScooter === 1 ? "is-active" : ""}`}
                    onClick={() => {
                      const next = hasScooter === 1 ? 0 : 1;
                      setHasScooter(next);
                      if (next === 1) setHasRentalCar(0);
                      void saveTrip({ has_scooter: next === 1, has_rental_car: next === 1 ? false : hasRentalCar === 1 });
                    }}
                  >
                    <span className="transport-toggle-thumb" />
                  </button>
                </div>
              </label>
            </div>
            <div className="reiseplaner-modal__meta">
              <div>
                <strong>{language === "en" ? "Current mode" : "Aktueller Modus"}</strong>
                <span>{transportMode === "car" ? (language === "en" ? "Car" : "Mietwagen") : transportMode === "scooter" ? (language === "en" ? "Scooter" : "Roller") : (language === "en" ? "Walking" : "Zu Fuß")}</span>
              </div>
              <div>
                <strong>{language === "en" ? "Rest days" : "Ruhetage"}</strong>
                <span>{restDays}</span>
              </div>
            </div>
            <div className="reiseplaner-modal__secondary">
              <article className="reiseplaner-modal__info">
                <span>{language === "en" ? "Planner status" : "Planerstatus"}</span>
                <ul>
                  {plannerStats.map((stat) => (
                    <li key={stat.label}>
                      <strong>{stat.value}</strong>
                      <div>
                        <b>{stat.label}</b>
                        <small>{stat.help}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
              <article className="reiseplaner-modal__info">
                <span>{language === "en" ? "Next steps" : "Nächste Schritte"}</span>
                <div className="reiseplaner-modal__actions">
                  {plannerActions.map((action) => (
                    <div key={action}><CheckCircle2 size={16} /><span>{action}</span></div>
                  ))}
                </div>
              </article>
              <article className="reiseplaner-modal__info">
                <span>{language === "en" ? "Example days" : "Beispieltage"}</span>
                <div className="reiseplaner-modal__days">
                  {demoDays.map((day) => (
                    <div key={day.day}>
                      <b>{day.day}</b>
                      <small>{day.title}</small>
                      <span>{day.note}</span>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </div>
      ) : null}

      {spotPickerDayIndex !== null ? (
        <div className="reiseplaner-modal" role="dialog" aria-modal="true" aria-label={language === "en" ? "Add spot" : "Spot hinzufügen"}>
          <div className="reiseplaner-modal__backdrop" onClick={() => setSpotPickerDayIndex(null)} />
          <div className="reiseplaner-modal__panel">
            <div className="reiseplaner-modal__head">
              <div>
                <span>{language === "en" ? "Add spot" : "Spot hinzufügen"}</span>
                <h3>{language === "en" ? "Choose a spot" : "Spot auswählen"}</h3>
              </div>
              <button type="button" className="reiseplaner-modal__close" onClick={() => setSpotPickerDayIndex(null)}>×</button>
            </div>
            <label className="reiseplaner-spotsearch">
              <span>{language === "en" ? "Search" : "Suche"}</span>
              <input
                type="search"
                value={spotSearch}
                onChange={(event) => setSpotSearch(event.target.value)}
                placeholder={language === "en" ? "Search spots or categories" : "Spots oder Kategorien suchen"}
              />
            </label>
            <div className="reiseplaner-modal__days" style={{ maxHeight: "420px", overflow: "auto" }}>
              {filteredSpotCatalog.map((spot) => (
                <button key={spot.id} type="button" className="reiseplaner-spotpick" onClick={() => addSpotToDay(spotPickerDayIndex, spot)}>
                  <strong>{language === "en" ? spot.title_en || spot.title : spot.title}</strong>
                  <span>{language === "en" ? spot.category_en || spot.category : spot.category}</span>
                </button>
              ))}
              {filteredSpotCatalog.length === 0 ? (
                <div className="reiseplaner-spotpick reiseplaner-spotpick--empty">
                  <strong>{language === "en" ? "No spots found" : "Keine Spots gefunden"}</strong>
                  <span>{language === "en" ? "Try a different search term" : "Versuche einen anderen Suchbegriff"}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {selectedEvent ? (
        <div className="reiseplaner-modal" role="dialog" aria-modal="true" aria-label={language === "en" ? "Edit spot" : "Spot bearbeiten"}>
          <div className="reiseplaner-modal__backdrop" onClick={() => setSelectedEventId(null)} />
          <div className="reiseplaner-modal__panel">
            <div className="reiseplaner-modal__head">
              <div>
                <span>{language === "en" ? "Edit spot" : "Spot bearbeiten"}</span>
                <h3>{resolveSpotTitle(selectedEvent)}</h3>
              </div>
              <button type="button" className="reiseplaner-modal__close" onClick={() => setSelectedEventId(null)}>×</button>
            </div>
            {selectedSpot ? (
              <div className="reiseplaner-spotdetails">
                <div
                  className="reiseplaner-spotdetails__image"
                  style={selectedSpot.image_url ? { backgroundImage: `url(${selectedSpot.image_url})` } : undefined}
                />
                <div className="reiseplaner-spotdetails__copy">
                  <span>{language === "en" ? "Spot info" : "Spot-Infos"}</span>
                  <strong>{language === "en" ? selectedSpot.title_en || selectedSpot.title : selectedSpot.title}</strong>
                  <p>{language === "en" ? selectedSpot.description_en || selectedSpot.description : selectedSpot.description}</p>
                  <div className="reiseplaner-spotdetails__meta">
                    <div>
                      <small>{language === "en" ? "Category" : "Kategorie"}</small>
                      <b>{language === "en" ? selectedSpot.category_en || selectedSpot.category : selectedSpot.category}</b>
                    </div>
                    <div>
                      <small>{language === "en" ? "Rating" : "Bewertung"}</small>
                      <b>{selectedSpot.stars ? `${selectedSpot.stars}/5` : "-"}</b>
                    </div>
                    <div>
                      <small>{language === "en" ? "Price level" : "Preislevel"}</small>
                      <b>{selectedSpot.price_level ?? "-"}</b>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="reiseplaner-settings">
              <label>
                <span>{language === "en" ? "Day" : "Tag"}</span>
                <select
                  value={selectedEvent.dayIndex}
                  onChange={(e) => updateEvent(selectedEvent.id, { dayIndex: Number(e.target.value) })}
                >
                  {tripDays.map((day) => (
                    <option key={day.dateKey} value={day.tripDayIndex}>{day.label} · {day.dateLabel}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>{language === "en" ? "Start time" : "Startzeit"}</span>
                <input
                  type="time"
                  step="900"
                  value={formatTime(selectedEvent.startHour)}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(":").map(Number);
                    const nextStart = hours + (minutes || 0) / 60;
                    updateEvent(selectedEvent.id, {
                      startHour: Math.max(0, Math.min(24 - selectedEvent.durationHours, nextStart)),
                    });
                  }}
                />
              </label>
              <label>
                <span>{language === "en" ? "Duration" : "Dauer"}</span>
                <input
                  type="range"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={selectedEvent.durationHours}
                  onChange={(e) => {
                    const nextDuration = Number(e.target.value);
                    updateEvent(selectedEvent.id, {
                      durationHours: nextDuration,
                      startHour: Math.min(selectedEvent.startHour, 24 - nextDuration),
                    });
                  }}
                />
                <small>{selectedEvent.durationHours.toFixed(1)} {language === "en" ? "hours" : "Stunden"}</small>
              </label>
              <label>
                <span>{language === "en" ? "Subtitle" : "Beschreibung"}</span>
                <input
                  type="text"
                  value={selectedEvent.subtitle}
                  onChange={(e) => updateEvent(selectedEvent.id, { subtitle: e.target.value })}
                />
              </label>
            </div>
            <div className="reiseplaner-modal__meta">
              <div>
                <strong>{language === "en" ? "Current time" : "Aktuelle Zeit"}</strong>
                <span>{formatTime(selectedEvent.startHour)} - {formatTime(selectedEvent.startHour + selectedEvent.durationHours)}</span>
              </div>
              <div>
                <strong>{language === "en" ? "Category" : "Kategorie"}</strong>
                <span>{selectedEvent.category}</span>
              </div>
            </div>
            <button
              type="button"
              className="remove-planner-activity"
              onClick={handleRemoveSelectedEvent}
              disabled={isRemovingEvent}
            >
              {isRemovingEvent ? (language === "en" ? "Removing..." : "Wird entfernt ...") : (language === "en" ? "Remove from trip plan" : "Aus dem Reiseplan entfernen")}
            </button>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .reiseplaner-page{min-height:100vh;padding:32px 0 56px;background:
          radial-gradient(circle at top left,rgba(255,210,143,.46),transparent 30%),
          radial-gradient(circle at top right,rgba(163,223,236,.58),transparent 27%),
          linear-gradient(180deg,#f7f3ea 0%,#f4f7f8 52%,#eef3f2 100%);color:#10233f}
        .reiseplaner-shell{width:min(1680px,calc(100vw - 64px));max-width:none;margin-inline:auto;display:grid;gap:18px}
        .reiseplaner-compact-hero,.reiseplaner-summary,.reiseplaner-boardwrap{width:100%}
        .reiseplaner-compact-hero{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding:2px 0 0;min-height:82px}
        .reiseplaner-compact-hero__title{max-width:760px}
        .reiseplaner-compact-hero__title span,.reiseplaner-eyebrow{display:block;color:#128fa3;font-size:11px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
        .reiseplaner-compact-hero__title h1{margin:6px 0 0;font-size:32px;line-height:1.06;letter-spacing:-.045em}
        .reiseplaner-compact-hero__wave{margin-top:6px;width:56px;height:8px;border-radius:999px;background:linear-gradient(90deg,#7fded7,#128fa3);mask:linear-gradient(90deg,transparent 0,black 12%,black 88%,transparent 100%)}
        .reiseplaner-compact-hero__actions{display:flex;gap:10px;align-self:flex-start}
        .reiseplaner-summary{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(240px,.75fr) minmax(280px,.85fr);gap:14px;align-items:stretch}
        .reiseplaner-summary__trip,.reiseplaner-summary__card{border:1px solid rgba(16,35,63,.08);border-radius:28px;background:rgba(255,255,255,.92);box-shadow:0 14px 36px rgba(16,35,63,.08)}
        .reiseplaner-summary__trip{display:grid;grid-template-columns:300px minmax(0,1fr);gap:16px;padding:14px;min-height:204px}
        .reiseplaner-summary__image{border-radius:14px;background:url('/images/beach.png') center/cover no-repeat;min-height:176px}
        .reiseplaner-summary__copy{display:flex;flex-direction:column;justify-content:center;padding:6px 4px}
        .reiseplaner-inline-settings{margin-top:12px;padding:14px 0 0;border-top:1px solid rgba(16,35,63,.08);display:grid;gap:12px;overflow:hidden;animation:plannerDrop .18s ease-out}
        .reiseplaner-inline-settings[hidden]{display:none}
        .reiseplaner-inline-settings__head{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
        .reiseplaner-inline-settings__head span{color:#128fa3;font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
        .reiseplaner-inline-settings__head strong{font-size:13px;color:#10233f;letter-spacing:-.02em}
        .reiseplaner-summary__copy h2{margin:8px 0 0;font-size:24px;line-height:1.02;letter-spacing:-.04em}
        .reiseplaner-summary__meta{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:10px}
        .reiseplaner-summary__meta strong{font-size:14px}
        .reiseplaner-summary__meta span,.reiseplaner-summary__copy p{color:#53616e}
        .reiseplaner-summary__copy p{margin:14px 0 0;font-size:15px}
        .reiseplaner-linkbutton{margin-top:10px;border:0;background:transparent;color:#128fa3;padding:0;font-weight:900;text-align:left}
        .reiseplaner-linkbutton[aria-expanded="true"]{color:#0f6f86}
        .reiseplaner-summary__card{padding:16px;min-height:204px}
        .reiseplaner-summary__card h3{margin:10px 0 0;font-size:18px;line-height:1.15;letter-spacing:-.03em}
        .reiseplaner-summary__card p{margin:10px 0 0;color:#53616e;line-height:1.6;font-size:15px}
        .reiseplaner-summary__budget{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:10px;padding:14px 16px;border-radius:20px;background:linear-gradient(180deg,rgba(18,143,163,.06),rgba(18,143,163,.02));border:1px solid rgba(18,143,163,.12)}
        .reiseplaner-summary__budget-copy{display:grid;gap:4px}
        .reiseplaner-summary__budget strong{display:block;font-size:28px;line-height:1;letter-spacing:-.04em}
        .reiseplaner-summary__budget small{display:block;color:#6b7784;font-size:13px;line-height:1.35}
        .reiseplaner-summary__ring{width:82px;height:82px;border-radius:50%;display:grid;place-items:center;padding:8px;flex:0 0 auto;box-shadow:inset 0 0 0 1px rgba(255,255,255,.8)}
        .reiseplaner-summary__ring span{font-size:14px;font-weight:900;color:#000;letter-spacing:-.02em}
        .planner-main-grid{display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:12px;align-items:start}
        .planner-board{min-width:0;padding:14px;border:1px solid rgba(16,35,63,.08);border-radius:28px;background:rgba(255,255,255,.92);box-shadow:0 14px 36px rgba(16,35,63,.08);overflow-x:auto}
        .planner-days{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
        .planner-day-column{min-width:0;min-height:620px;display:flex;flex-direction:column;gap:10px;padding:9px;border:1px solid rgba(15,23,42,.08);border-radius:14px;background:rgba(255,255,255,.9);box-shadow:0 4px 14px rgba(15,23,42,.035)}
        .planner-day-column__head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding-bottom:6px;border-bottom:1px solid #edf2f4}
        .planner-day-column__head strong{display:block;font-size:16px}
        .planner-day-column__head span{display:block;margin-top:4px;color:#128fa3;font-size:12px;font-weight:800}
        .planner-day-column__weather{display:grid;justify-items:end;text-align:right}
        .planner-day-column__temp{font-weight:900}
        .planner-day-column__rain{margin-top:4px;color:#6b7784;font-size:12px}
        .planner-day-activities{display:flex;flex-direction:column;gap:8px;flex:1}
        .planner-day-column__empty{border:1px dashed rgba(18,143,163,.35);background:rgba(236,250,250,.7);border-radius:12px;padding:12px 10px;color:#128fa3;font-weight:800;text-align:center}
        .planner-day-column__add{border:0;background:transparent;color:#128fa3;text-align:left;padding:0;font-weight:800;font-size:12px;opacity:.9}
        .planner-sidebar{display:grid;gap:14px}
        .planner-sidebar__card{padding:12px;border:1px solid rgba(16,35,63,.08);border-radius:24px;background:rgba(255,255,255,.92);box-shadow:0 14px 36px rgba(16,35,63,.08);min-height:286px}
        .planner-sidebar__head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
        .planner-sidebar__head button{border:0;background:transparent;color:#128fa3;padding:0;font-weight:900}
        .planner-activity-card{position:relative;display:grid;gap:4px;padding:7px;border:1px solid rgba(15,23,42,.07);border-radius:9px;background:#fff;text-align:left;cursor:grab;box-shadow:0 2px 7px rgba(15,23,42,.025)}
        .planner-activity-card__time{display:flex;align-items:center;justify-content:space-between;gap:8px;color:#128fa3;font-size:10px;font-weight:900}
        .planner-activity-card__time i{width:10px;height:10px;border-radius:50%}
        .planner-activity-card__image{width:100%;height:86px;object-fit:cover;border-radius:5px;display:block;margin-top:7px}
        .planner-activity-card strong{font-size:14px;line-height:1.25;color:#10233f}
        .planner-activity-card small{color:#6b7784;font-size:12px}
        .planner-activity-card__menu{position:absolute;right:10px;top:10px;color:#94a3b8;font-size:18px;line-height:1}
        .planner-activity-card__shifts{display:none}
        .reiseplaner-infobar{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;padding:0;border:1px solid rgba(16,35,63,.08);border-radius:22px;background:rgba(255,255,255,.88);box-shadow:0 10px 28px rgba(16,35,63,.06);overflow:hidden;min-height:90px}
        .reiseplaner-infobar div{padding:14px 16px;border-right:1px solid #e8edf1}
        .reiseplaner-infobar div:last-child{border-right:0}
        .reiseplaner-infobar span{display:block;color:#128fa3;font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
        .reiseplaner-infobar strong{display:block;margin-top:6px;font-size:13px;line-height:1.45}
        .reiseplaner-weeknav{display:flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid #e6ecee;border-radius:999px;background:#fff;min-height:44px}
        .reiseplaner-weeknav button{width:30px;height:30px;border:0;border-radius:999px;background:#f1f6f7;color:#10233f;cursor:pointer}
        .reiseplaner-weeknav span{min-width:84px;text-align:center;font-size:12px;font-weight:900;color:#53616e}
        .reiseplaner-actions{display:flex;gap:10px}
        .reiseplaner-action{padding:12px 16px;border:1px solid #dfe7ea;border-radius:14px;background:#fff;color:#10233f;font-weight:900;font-size:14px}
        .reiseplaner-action--primary{background:linear-gradient(135deg,#128fa3,#0f6f86);border-color:transparent;color:#fff}
        .reiseplaner-main-grid{display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:12px;width:100%;align-items:start}
        .reiseplaner-board,.reiseplaner-panel{border:1px solid rgba(16,35,63,.08);border-radius:26px;background:rgba(255,255,255,.92);box-shadow:0 14px 36px rgba(16,35,63,.08)}
        .reiseplaner-board{padding:12px;width:100%;box-sizing:border-box}
        .reiseplaner-board__header{display:none}
        .reiseplaner-spotpick{display:grid;gap:4px;width:100%;text-align:left;padding:12px 14px;border:1px solid #e6ecee;border-radius:14px;background:#fff;cursor:pointer}
        .reiseplaner-spotpick strong{display:block;color:#10233f;font-size:13px}
        .reiseplaner-spotpick span{display:block;color:#128fa3;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
        .reiseplaner-spotpick--empty{cursor:default;background:#f8fafc}
        .reiseplaner-spotsearch{display:grid;gap:8px;margin-bottom:12px}
        .reiseplaner-spotsearch span{font-size:11px;font-weight:900;color:#6b7784;letter-spacing:.11em;text-transform:uppercase}
        .reiseplaner-spotsearch input{width:100%;padding:12px 14px;border:1px solid #dbe4e8;border-radius:14px;background:#fff;color:#10233f;font:inherit}
        .reiseplaner-spotsearch input:focus{outline:2px solid rgba(18,143,163,.18);border-color:#128fa3}
        .reiseplaner-event__shift{width:20px;height:20px;border:0;border-radius:999px;background:#eef5f7;color:#10233f;font-size:12px;font-weight:900;line-height:1;cursor:pointer;box-shadow:0 4px 10px rgba(16,35,63,.08)}
        .reiseplaner-event__dot{display:none}
        .reiseplaner-event strong{font-size:12px;line-height:1.3}
        .reiseplaner-event small,.reiseplaner-event em{font-style:normal;font-size:11px;line-height:1.3;color:#53616e}
        .reiseplaner-settings{display:grid;gap:12px}
        .reiseplaner-settings label{display:grid;gap:6px}
        .reiseplaner-settings span{font-size:11px;font-weight:900;color:#6b7784;letter-spacing:.11em;text-transform:uppercase}
        .reiseplaner-settings input[type="date"],.reiseplaner-settings input[type="number"]{width:100%;padding:10px 12px;border:1px solid #dbe4e8;border-radius:12px;background:#fff;color:#10233f;font:inherit}
        .reiseplaner-settings input[type="range"]{width:100%;accent-color:#128fa3}
        .transport-toggle-row{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:44px;padding:6px 0}
        .transport-toggle-label{display:flex;flex-direction:column;gap:2px}
        .transport-toggle-label strong{font-size:13px;font-weight:600;color:#10233f}
        .transport-toggle-label span{font-size:11px;color:rgba(15,23,42,.55);letter-spacing:0;text-transform:none;font-weight:500}
        .transport-toggle{position:relative;width:40px;height:22px;flex-shrink:0;border:0;border-radius:999px;background:#d9dee5;cursor:pointer;transition:background-color 160ms ease,box-shadow 160ms ease}
        .transport-toggle.is-active{background:#0891a5}
        .transport-toggle-thumb{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.25);transition:transform 160ms ease}
        .transport-toggle.is-active .transport-toggle-thumb{transform:translateX(18px)}
        .transport-toggle:focus-visible{outline:2px solid rgba(8,145,165,.35);outline-offset:2px}
        .reiseplaner-map{height:286px;border-radius:12px;background:
          linear-gradient(180deg,#bfe0e8 0%,#dff3f0 18%,#b9d9a6 18%,#8cc47f 100%);
          position:relative;overflow:hidden}
        .reiseplaner-map::before{content:"";position:absolute;inset:12px;background:linear-gradient(90deg,rgba(255,255,255,.28) 0 3%,transparent 3% 100%),linear-gradient(180deg,rgba(255,255,255,.28) 0 3%,transparent 3% 100%)}
        .reiseplaner-map__overlay{position:absolute;inset:0;background:linear-gradient(135deg,transparent 0 52%,rgba(10,40,50,.06) 52% 54%,transparent 54% 100%)}
        .reiseplaner-map__pin{position:absolute;left:54%;top:46%;width:18px;height:18px;border-radius:50%;background:#128fa3;box-shadow:0 0 0 10px rgba(18,143,163,.16)}
        .reiseplaner-map__pin--secondary{left:63%;top:59%;background:#ef4444;box-shadow:0 0 0 8px rgba(239,68,68,.14)}
        .reiseplaner-map__route{position:absolute;left:49%;top:42%;width:140px;height:72px;border:2px dashed rgba(18,143,163,.45);border-radius:50% 40% 50% 40%;transform:rotate(-16deg)}
        .reiseplaner-favorites{display:grid;gap:10px}
        .reiseplaner-favorite{display:grid;grid-template-columns:46px minmax(0,1fr) auto;gap:10px;align-items:center;padding:10px 12px;border-radius:14px;background:#fff;border:1px solid #e6ecee}
        .reiseplaner-favorite img{width:46px;height:40px;object-fit:cover;border-radius:8px}
        .reiseplaner-favorite strong{display:block;color:#10233f;font-size:12px}
        .reiseplaner-favorite span{display:block;margin-top:2px;color:#6b7784;font-size:11px;line-height:1.3}
        .reiseplaner-favorite small{color:#128fa3;font-size:14px}
        .reiseplaner-section--split{display:none}
        .reiseplaner-list{list-style:none;padding:0;margin:0;display:grid;gap:10px}
        .reiseplaner-list li{display:flex;align-items:center;gap:10px;padding:14px;border:1px solid #e6ecee;border-radius:14px;background:#fbfcfd;color:#334155;font-weight:700}
        .reiseplaner-panel{padding:18px}
        .reiseplaner-panel p{margin:0;color:#53616e;line-height:1.7}
        .reiseplaner-panel--accent{background:linear-gradient(180deg,#fff 0%,#f8fbfc 100%)}
        .reiseplaner-modal{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:20px}
        .reiseplaner-modal__backdrop{position:absolute;inset:0;background:rgba(15,23,42,.42);backdrop-filter:blur(4px)}
        .reiseplaner-modal__panel{position:relative;width:min(560px,100%);padding:20px;border:1px solid rgba(16,35,63,.1);border-radius:24px;background:#fff;box-shadow:0 24px 60px rgba(15,35,62,.22)}
        .reiseplaner-modal__head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px}
        .reiseplaner-modal__head span{display:block;color:#128fa3;font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
        .reiseplaner-modal__head h3{margin:6px 0 0;font-size:22px;letter-spacing:-.03em}
        .reiseplaner-modal__close{width:36px;height:36px;border:0;border-radius:999px;background:#f1f6f7;font-size:24px;line-height:1;color:#10233f}
        .reiseplaner-modal__meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:16px}
        .reiseplaner-modal__meta div{padding:14px 16px;border-radius:16px;background:#f8fafc;border:1px solid #e6ecee}
        .reiseplaner-modal__meta strong{display:block;font-size:11px;font-weight:900;letter-spacing:.11em;text-transform:uppercase;color:#6b7784}
        .reiseplaner-modal__meta span{display:block;margin-top:8px;font-size:15px;color:#10233f;font-weight:700}
        .reiseplaner-spotdetails{display:grid;grid-template-columns:160px minmax(0,1fr);gap:14px;margin:4px 0 16px}
        .reiseplaner-spotdetails__image{min-height:140px;border-radius:18px;background:#eef5f7 center/cover no-repeat}
        .reiseplaner-spotdetails__copy{padding:4px 0}
        .reiseplaner-spotdetails__copy>span{display:block;color:#128fa3;font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
        .reiseplaner-spotdetails__copy strong{display:block;margin-top:6px;font-size:18px;line-height:1.2;color:#10233f}
        .reiseplaner-spotdetails__copy p{margin:10px 0 0;color:#53616e;font-size:14px;line-height:1.6}
        .reiseplaner-spotdetails__meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:12px}
        .reiseplaner-spotdetails__meta div{padding:10px 12px;border-radius:14px;background:#f8fafc;border:1px solid #e6ecee}
        .reiseplaner-spotdetails__meta small{display:block;color:#6b7784;font-size:11px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
        .reiseplaner-spotdetails__meta b{display:block;margin-top:6px;color:#10233f;font-size:13px}
        .remove-planner-activity{width:100%;min-height:40px;margin-top:14px;border:1px solid rgba(220,38,38,.25);border-radius:8px;background:rgba(254,242,242,.8);color:#b91c1c;font-size:13px;font-weight:600;cursor:pointer}
        .remove-planner-activity:hover{background:#fee2e2;border-color:rgba(220,38,38,.4)}
        .remove-planner-activity:disabled{opacity:.55;cursor:not-allowed}
        .reiseplaner-modal__secondary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:16px}
        .reiseplaner-modal__info{padding:14px 16px;border-radius:18px;background:#f8fafc;border:1px solid #e6ecee}
        .reiseplaner-modal__info>span{display:block;margin-bottom:10px;color:#128fa3;font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
        .reiseplaner-modal__info ul{list-style:none;padding:0;margin:0;display:grid;gap:10px}
        .reiseplaner-modal__info li{display:flex;align-items:flex-start;gap:10px}
        .reiseplaner-modal__info li strong{min-width:40px;color:#10233f;font-size:16px}
        .reiseplaner-modal__info li b{display:block;color:#10233f;font-size:13px}
        .reiseplaner-modal__info li small,.reiseplaner-modal__info li span{display:block;color:#6b7784;font-size:12px;line-height:1.45}
        .reiseplaner-modal__actions{display:grid;gap:10px}
        .reiseplaner-modal__actions div{display:flex;align-items:center;gap:10px;color:#334155;font-weight:700}
        .reiseplaner-modal__days{display:grid;gap:10px}
        .reiseplaner-modal__days div{padding:10px 12px;border-radius:14px;background:#fff;border:1px solid #e6ecee}
        .reiseplaner-modal__days b{display:block;color:#10233f;font-size:12px}
        .reiseplaner-modal__days small,.reiseplaner-modal__days span{display:block;margin-top:4px;color:#6b7784;font-size:12px;line-height:1.45}
        .reiseplaner-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 18px;border-radius:14px;text-decoration:none;font-size:14px;font-weight:900}
        .reiseplaner-button--primary{background:linear-gradient(135deg,#128fa3,#0f6f86);color:#fff}
        @keyframes plannerDrop{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:1280px){.planner-main-grid{grid-template-columns:1fr}.planner-sidebar{grid-template-columns:repeat(2,minmax(0,1fr))}.planner-days{grid-template-columns:repeat(5,minmax(190px,1fr))}}
        @media(max-width:1080px){.reiseplaner-compact-hero{flex-direction:column;align-items:flex-start}.reiseplaner-summary{grid-template-columns:1fr}.reiseplaner-summary__trip{grid-template-columns:1fr}.reiseplaner-summary__image{min-height:200px}.reiseplaner-main-grid{grid-template-columns:1fr}.reiseplaner-infobar{grid-template-columns:repeat(2,minmax(0,1fr))}.reiseplaner-modal__meta,.reiseplaner-modal__secondary{grid-template-columns:1fr}}
        @media(max-width:720px){.reiseplaner-page{padding:16px 0 56px}.reiseplaner-shell{width:calc(100% - 24px)}.reiseplaner-summary,.planner-main-grid,.reiseplaner-infobar{grid-template-columns:1fr}.planner-board{padding:12px}.planner-days{grid-template-columns:1fr;min-width:0}.planner-sidebar{grid-template-columns:1fr}.reiseplaner-modal{padding:12px}.reiseplaner-modal__panel{border-radius:20px}}
      `}</style>
    </main>
  );
}
