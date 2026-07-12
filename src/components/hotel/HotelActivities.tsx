"use client";

import type { ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChefHat,
  Clock3,
  Dumbbell,
  Leaf,
  MapPin,
  Music,
  Sparkles,
  TicketCheck,
  Users,
  WalletCards,
} from "lucide-react";
import type { Language } from "@/src/lib/i18n";
import type {
  HotelAmenityRecord,
  HotelProfileRecord,
} from "@/src/types/spot";

interface HotelActivitiesProps {
  activities: HotelAmenityRecord[];
  hotelProfile: HotelProfileRecord;
  language: Language;
  userRole?: string | null;
}

interface ActivitySchedule {
  day: string;
  start?: string;
  end?: string;
}

interface ActivityDetails {
  category?: string;
  included?: boolean;
  price?: number;
  currency?: string;
  duration_minutes?: number;
  meeting_point_de?: string;
  meeting_point_en?: string;
  reservation_required?: boolean;
  minimum_age?: number;
  schedule?: ActivitySchedule[];
  tags_de?: string[];
  tags_en?: string[];
  external_url?: string | null;
}

const labels = {
  de: {
    eyebrow: "Aktivitäten & Erlebnisse",
    title: "Erlebnisse innerhalb des Resorts",
    subtitle:
      "Sport, Wellness, Kulinarik und Unterhaltung – übersichtlich mit Zeiten und Teilnahmebedingungen.",
    sport: "Sport",
    wellness: "Wellness",
    culinary: "Kulinarik",
    kids: "Kinder",
    nature: "Natur",
    entertainment: "Unterhaltung",
    culture: "Kultur",
    other: "Aktivität",
    included: "Inklusive",
    paid: "Kostenpflichtig",
    reservationRequired: "Reservierung erforderlich",
    noReservation: "Ohne Reservierung",
    duration: "Dauer",
    minimumAge: "Mindestalter",
    years: "Jahre",
    meetingPoint: "Treffpunkt",
    schedule: "Zeiten",
    daily: "Täglich",
    monday: "Montag",
    tuesday: "Dienstag",
    wednesday: "Mittwoch",
    thursday: "Donnerstag",
    friday: "Freitag",
    saturday: "Samstag",
    sunday: "Sonntag",
    details: "Mehr erfahren",
    draft: "Redaktionelle Vorschau",
    draftNotice:
      "Diese Aktivitäten sind noch nicht zur Veröffentlichung freigegeben.",
  },
  en: {
    eyebrow: "Activities & experiences",
    title: "Experiences within the resort",
    subtitle:
      "Sports, wellness, culinary experiences and entertainment with clear schedules and participation details.",
    sport: "Sport",
    wellness: "Wellness",
    culinary: "Culinary",
    kids: "Kids",
    nature: "Nature",
    entertainment: "Entertainment",
    culture: "Culture",
    other: "Activity",
    included: "Included",
    paid: "Paid",
    reservationRequired: "Reservation required",
    noReservation: "No reservation required",
    duration: "Duration",
    minimumAge: "Minimum age",
    years: "years",
    meetingPoint: "Meeting point",
    schedule: "Schedule",
    daily: "Daily",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
    details: "Learn more",
    draft: "Editorial preview",
    draftNotice:
      "These activities have not yet been approved for publication.",
  },
} as const;

function getDetails(
  activity: HotelAmenityRecord
): ActivityDetails {
  const details = activity.details;

  if (!details || typeof details !== "object") {
    return {};
  }

  return details as ActivityDetails;
}

function getLocalizedValue(
  activity: HotelAmenityRecord,
  language: Language,
  field:
    | "name"
    | "description"
    | "location"
    | "opening_hours"
): string {
  const primary =
    language === "en"
      ? activity[`${field}_en`]
      : activity[`${field}_de`];

  const fallback =
    language === "en"
      ? activity[`${field}_de`]
      : activity[`${field}_en`];

  if (
    typeof primary === "string" &&
    primary.trim() !== ""
  ) {
    return primary.trim();
  }

  if (
    typeof fallback === "string" &&
    fallback.trim() !== ""
  ) {
    return fallback.trim();
  }

  return "";
}

function getLocalizedArray(
  germanValue: unknown,
  englishValue: unknown,
  language: Language
): string[] {
  const primary =
    language === "en"
      ? englishValue
      : germanValue;

  const fallback =
    language === "en"
      ? germanValue
      : englishValue;

  const source = Array.isArray(primary)
    ? primary
    : Array.isArray(fallback)
      ? fallback
      : [];

  return source.filter(
    (item): item is string =>
      typeof item === "string" &&
      item.trim() !== ""
  );
}

function formatPrice(
  value: number,
  currency?: string
): string {
  const normalizedCurrency =
    currency?.trim().toUpperCase() || "THB";

  try {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: normalizedCurrency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value} ${normalizedCurrency}`;
  }
}

function formatDuration(
  minutes: number,
  language: Language
): string {
  if (minutes < 60) {
    return language === "en"
      ? `${minutes} min`
      : `${minutes} Min.`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return language === "en"
      ? `${hours} hr`
      : `${hours} Std.`;
  }

  return language === "en"
    ? `${hours} hr ${remainingMinutes} min`
    : `${hours} Std. ${remainingMinutes} Min.`;
}

function getCategoryMeta(
  category: string | undefined,
  language: Language
): {
  label: string;
  icon: ReactNode;
} {
  const copy = labels[language];

  switch (category) {
    case "sport":
      return {
        label: copy.sport,
        icon: <Dumbbell size={16} />,
      };

    case "wellness":
      return {
        label: copy.wellness,
        icon: <Sparkles size={16} />,
      };

    case "culinary":
      return {
        label: copy.culinary,
        icon: <ChefHat size={16} />,
      };

    case "kids":
      return {
        label: copy.kids,
        icon: <Users size={16} />,
      };

    case "nature":
      return {
        label: copy.nature,
        icon: <Leaf size={16} />,
      };

    case "entertainment":
      return {
        label: copy.entertainment,
        icon: <Music size={16} />,
      };

    case "culture":
      return {
        label: copy.culture,
        icon: <CalendarDays size={16} />,
      };

    default:
      return {
        label: copy.other,
        icon: <Sparkles size={16} />,
      };
  }
}

function getMeetingPoint(
  details: ActivityDetails,
  fallback: string,
  language: Language
): string {
  const localized =
    language === "en"
      ? details.meeting_point_en
      : details.meeting_point_de;

  const secondary =
    language === "en"
      ? details.meeting_point_de
      : details.meeting_point_en;

  return (
    localized?.trim() ||
    secondary?.trim() ||
    fallback
  );
}

function formatSchedule(
  schedule: ActivitySchedule[],
  language: Language
): string[] {
  const copy = labels[language];

  return schedule.map((entry) => {
    const day =
      copy[
        entry.day as keyof typeof copy
      ] || entry.day;

    const time =
      entry.start && entry.end
        ? `${entry.start}–${entry.end}`
        : entry.start || entry.end || "";

    return time ? `${day}: ${time}` : day;
  });
}

export default function HotelActivities({
  activities,
  hotelProfile,
  language,
  userRole,
}: HotelActivitiesProps) {
  const copy = labels[language];

  const normalizedRole = String(userRole || "")
    .trim()
    .toLowerCase();

  const isEditor =
    normalizedRole === "admin" ||
    normalizedRole === "editor";

  const isPublished =
    hotelProfile.status === "published";

  if (!isPublished && !isEditor) {
    return null;
  }

  if (activities.length === 0) {
    return null;
  }

  return (
    <section
      style={{
        maxWidth: 1180,
        margin: "0 auto 48px",
        padding: "0 28px",
      }}
    >
      <div
        style={{
          marginBottom: 26,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div style={{ maxWidth: 760 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
              color: "#0f766e",
              fontSize: 11,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.13em",
            }}
          >
            <TicketCheck size={17} />
            {copy.eyebrow}
          </div>

          <h2
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "clamp(28px, 4vw, 42px)",
              lineHeight: 1.12,
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            {copy.title}
          </h2>

          <p
            style={{
              margin: "12px 0 0",
              maxWidth: 720,
              color: "#64748b",
              fontSize: 15,
              lineHeight: 1.75,
            }}
          >
            {copy.subtitle}
          </p>
        </div>

        {!isPublished && isEditor && (
          <div
            style={{
              maxWidth: 290,
              padding: "12px 14px",
              borderRadius: 16,
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              color: "#9a3412",
            }}
          >
            <div
              style={{
                marginBottom: 4,
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {copy.draft}
            </div>

            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                lineHeight: 1.5,
              }}
            >
              {copy.draftNotice}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(290px, 1fr))",
          gap: 18,
        }}
      >
        {activities.map((activity) => {
          const details = getDetails(activity);

          const name = getLocalizedValue(
            activity,
            language,
            "name"
          );

          const description = getLocalizedValue(
            activity,
            language,
            "description"
          );

          const location = getLocalizedValue(
            activity,
            language,
            "location"
          );

          const openingHours = getLocalizedValue(
            activity,
            language,
            "opening_hours"
          );

          const meetingPoint = getMeetingPoint(
            details,
            location,
            language
          );

          const highlights = getLocalizedArray(
            activity.highlights_de,
            activity.highlights_en,
            language
          );

          const tags = getLocalizedArray(
            details.tags_de,
            details.tags_en,
            language
          );

          const schedule = Array.isArray(
            details.schedule
          )
            ? formatSchedule(
                details.schedule,
                language
              )
            : [];

          const category = getCategoryMeta(
            details.category,
            language
          );

          return (
            <article
              key={activity.id}
              style={{
                overflow: "hidden",
                borderRadius: 24,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 16px 40px rgba(15,23,42,0.08)",
              }}
            >
              {activity.image_url && (
                <div
                  style={{
                    position: "relative",
                    height: 210,
                    overflow: "hidden",
                    background: "#e2e8f0",
                  }}
                >
                  <img
                    src={activity.image_url}
                    alt={name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      left: 14,
                      top: 14,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "8px 11px",
                      borderRadius: 999,
                      background:
                        "rgba(15,23,42,0.82)",
                      color: "#ffffff",
                      fontSize: 10,
                      fontWeight: 800,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {category.icon}
                    {category.label}
                  </div>
                </div>
              )}

              <div style={{ padding: 24 }}>
                {!activity.image_url && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      marginBottom: 11,
                      color: "#0f766e",
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {category.icon}
                    {category.label}
                  </div>
                )}

                <h3
                  style={{
                    margin: 0,
                    color: "#0f172a",
                    fontSize: 22,
                    lineHeight: 1.2,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {name}
                </h3>

                {description && (
                  <p
                    style={{
                      margin: "12px 0 0",
                      color: "#64748b",
                      fontSize: 13,
                      lineHeight: 1.7,
                    }}
                  >
                    {description}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 18,
                  }}
                >
                  {details.included === true && (
                    <ActivityBadge
                      icon={<Check size={13} />}
                      label={copy.included}
                    />
                  )}

                  {details.included === false && (
                    <ActivityBadge
                      icon={<WalletCards size={13} />}
                      label={
                        typeof details.price === "number"
                          ? formatPrice(
                              details.price,
                              details.currency
                            )
                          : copy.paid
                      }
                    />
                  )}

                  {typeof details.duration_minutes ===
                    "number" && (
                    <ActivityBadge
                      icon={<Clock3 size={13} />}
                      label={formatDuration(
                        details.duration_minutes,
                        language
                      )}
                    />
                  )}

                  {details.reservation_required ===
                    true && (
                    <ActivityBadge
                      icon={<TicketCheck size={13} />}
                      label={
                        copy.reservationRequired
                      }
                    />
                  )}
                </div>

                {(meetingPoint ||
                  openingHours ||
                  typeof details.minimum_age ===
                    "number") && (
                  <div
                    style={{
                      display: "grid",
                      gap: 10,
                      marginTop: 20,
                    }}
                  >
                    {meetingPoint && (
                      <ActivityFact
                        icon={<MapPin size={16} />}
                        label={copy.meetingPoint}
                        value={meetingPoint}
                      />
                    )}

                    {openingHours && (
                      <ActivityFact
                        icon={<Clock3 size={16} />}
                        label={copy.schedule}
                        value={openingHours}
                      />
                    )}

                    {typeof details.minimum_age ===
                      "number" && (
                      <ActivityFact
                        icon={<Users size={16} />}
                        label={copy.minimumAge}
                        value={`${details.minimum_age} ${copy.years}`}
                      />
                    )}
                  </div>
                )}

                {schedule.length > 0 && (
                  <div
                    style={{
                      marginTop: 20,
                      padding: "13px 14px",
                      borderRadius: 15,
                      background: "#f8fafc",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        marginBottom: 9,
                        color: "#0f766e",
                        fontSize: 9,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                      }}
                    >
                      <CalendarDays size={15} />
                      {copy.schedule}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {schedule.map((entry) => (
                        <div
                          key={entry}
                          style={{
                            color: "#475569",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {entry}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(highlights.length > 0 ||
                  tags.length > 0) && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 18,
                    }}
                  >
                    {[...highlights, ...tags].map(
                      (item) => (
                        <span
                          key={item}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "7px 10px",
                            borderRadius: 999,
                            background: "#f0fdfa",
                            color: "#115e59",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          <Check size={13} />
                          {item}
                        </span>
                      )
                    )}
                  </div>
                )}

                {details.external_url && (
                  <div
                    style={{
                      marginTop: 22,
                      paddingTop: 18,
                      borderTop: "1px solid #e2e8f0",
                    }}
                  >
                    <a
                      href={details.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "10px 13px",
                        borderRadius: 12,
                        background: "#0f766e",
                        color: "#ffffff",
                        textDecoration: "none",
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      {copy.details}
                      <ArrowRight size={15} />
                    </a>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ActivityBadge({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 10px",
        borderRadius: 999,
        background: "#ecfeff",
        color: "#155e75",
        border: "1px solid #cffafe",
        fontSize: 10,
        fontWeight: 800,
      }}
    >
      {icon}
      {label}
    </span>
  );
}

function ActivityFact({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "11px 12px",
        borderRadius: 14,
        background: "#f8fafc",
        border: "1px solid #f1f5f9",
      }}
    >
      <div
        style={{
          color: "#0f766e",
          marginTop: 1,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            color: "#64748b",
            fontSize: 9,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            marginBottom: 3,
          }}
        >
          {label}
        </div>

        <div
          style={{
            color: "#334155",
            fontSize: 11,
            fontWeight: 700,
            lineHeight: 1.45,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
