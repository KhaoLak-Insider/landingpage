"use client";

import type { ReactNode } from "react";
import {
  Accessibility,
  Bike,
  Car,
  Check,
  Clock3,
  ConciergeBell,
  HeartHandshake,
  Luggage,
  ParkingCircle,
  Shirt,
  Sparkles,
  Users,
  Wifi,
} from "lucide-react";
import type { Language } from "@/src/lib/i18n";
import type {
  HotelAmenityRecord,
  HotelProfileRecord,
} from "@/src/types/spot";

interface HotelFacilitiesProps {
  facilities: HotelAmenityRecord[];
  hotelProfile: HotelProfileRecord;
  language: Language;
  userRole?: string | null;
}

interface FacilityDetails {
  facility_key?: string;
  available?: boolean;
  complimentary?: boolean;
  fee_note_de?: string;
  fee_note_en?: string;
  availability_note_de?: string;
  availability_note_en?: string;
}

const labels = {
  de: {
    eyebrow: "Ausstattung & Services",
    title: "Praktische Leistungen im Resort",
    subtitle:
      "Die wichtigsten Einrichtungen und Services für einen komfortablen Aufenthalt.",
    available: "Verfügbar",
    complimentary: "Kostenlos",
    paid: "Kostenpflichtig",
    openingHours: "Verfügbarkeit",
    location: "Lage",
    wifi: "WLAN",
    parking: "Parkplatz",
    reception: "Rezeption",
    laundry: "Wäscheservice",
    luggage: "Gepäckaufbewahrung",
    concierge: "Concierge",
    accessibility: "Barrierefreiheit",
    bicycle: "Fahrradverleih",
    childcare: "Kinderbetreuung",
    shuttle: "Shuttle",
    service: "Service",
    facility: "Einrichtung",
    draft: "Redaktionelle Vorschau",
    draftNotice:
      "Diese Angaben sind noch nicht zur Veröffentlichung freigegeben.",
  },
  en: {
    eyebrow: "Facilities & services",
    title: "Practical services at the resort",
    subtitle:
      "The most important facilities and services for a comfortable stay.",
    available: "Available",
    complimentary: "Complimentary",
    paid: "Paid",
    openingHours: "Availability",
    location: "Location",
    wifi: "Wi-Fi",
    parking: "Parking",
    reception: "Reception",
    laundry: "Laundry service",
    luggage: "Luggage storage",
    concierge: "Concierge",
    accessibility: "Accessibility",
    bicycle: "Bicycle rental",
    childcare: "Childcare",
    shuttle: "Shuttle",
    service: "Service",
    facility: "Facility",
    draft: "Editorial preview",
    draftNotice:
      "This information has not yet been approved for publication.",
  },
} as const;

function localizedValue(
  facility: HotelAmenityRecord,
  language: Language,
  field:
    | "name"
    | "description"
    | "location"
    | "opening_hours"
): string {
  const primary =
    language === "en"
      ? facility[`${field}_en`]
      : facility[`${field}_de`];

  const fallback =
    language === "en"
      ? facility[`${field}_de`]
      : facility[`${field}_en`];

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

function localizedList(
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

function getDetails(
  facility: HotelAmenityRecord
): FacilityDetails {
  if (
    !facility.details ||
    typeof facility.details !== "object"
  ) {
    return {};
  }

  return facility.details as FacilityDetails;
}

function getLocalizedDetail(
  details: FacilityDetails,
  language: Language,
  field: "fee_note" | "availability_note"
): string {
  const primary =
    language === "en"
      ? details[`${field}_en`]
      : details[`${field}_de`];

  const fallback =
    language === "en"
      ? details[`${field}_de`]
      : details[`${field}_en`];

  return primary?.trim() || fallback?.trim() || "";
}

function getFacilityMeta(
  key: string | undefined,
  type: HotelAmenityRecord["amenity_type"],
  language: Language
): {
  label: string;
  icon: ReactNode;
} {
  const copy = labels[language];

  switch (key) {
    case "wifi":
      return {
        label: copy.wifi,
        icon: <Wifi size={18} />,
      };

    case "parking":
      return {
        label: copy.parking,
        icon: <ParkingCircle size={18} />,
      };

    case "reception":
      return {
        label: copy.reception,
        icon: <Clock3 size={18} />,
      };

    case "laundry":
      return {
        label: copy.laundry,
        icon: <Shirt size={18} />,
      };

    case "luggage":
      return {
        label: copy.luggage,
        icon: <Luggage size={18} />,
      };

    case "concierge":
      return {
        label: copy.concierge,
        icon: <ConciergeBell size={18} />,
      };

    case "accessibility":
      return {
        label: copy.accessibility,
        icon: <Accessibility size={18} />,
      };

    case "bicycle":
      return {
        label: copy.bicycle,
        icon: <Bike size={18} />,
      };

    case "childcare":
      return {
        label: copy.childcare,
        icon: <Users size={18} />,
      };

    case "shuttle":
      return {
        label: copy.shuttle,
        icon: <Car size={18} />,
      };

    default:
      return {
        label:
          type === "service"
            ? copy.service
            : copy.facility,
        icon:
          type === "service"
            ? <HeartHandshake size={18} />
            : <Sparkles size={18} />,
      };
  }
}

export default function HotelFacilities({
  facilities,
  hotelProfile,
  language,
  userRole,
}: HotelFacilitiesProps) {
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

  if (facilities.length === 0) {
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
            <ConciergeBell size={17} />
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
            "repeat(auto-fit, minmax(235px, 1fr))",
          gap: 14,
        }}
      >
        {facilities.map((facility) => {
          const details = getDetails(facility);

          const name = localizedValue(
            facility,
            language,
            "name"
          );

          const description = localizedValue(
            facility,
            language,
            "description"
          );

          const location = localizedValue(
            facility,
            language,
            "location"
          );

          const openingHours = localizedValue(
            facility,
            language,
            "opening_hours"
          );

          const highlights = localizedList(
            facility.highlights_de,
            facility.highlights_en,
            language
          );

          const feeNote = getLocalizedDetail(
            details,
            language,
            "fee_note"
          );

          const availabilityNote = getLocalizedDetail(
            details,
            language,
            "availability_note"
          );

          const meta = getFacilityMeta(
            details.facility_key,
            facility.amenity_type,
            language
          );

          return (
            <article
              key={facility.id}
              style={{
                minHeight: 220,
                padding: 22,
                borderRadius: 22,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 12px 30px rgba(15,23,42,0.07)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 15,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f0fdfa",
                    color: "#0f766e",
                    border: "1px solid #ccfbf1",
                  }}
                >
                  {meta.icon}
                </div>

                {details.complimentary === true && (
                  <span
                    style={{
                      padding: "6px 9px",
                      borderRadius: 999,
                      background: "#ecfdf5",
                      color: "#047857",
                      fontSize: 9,
                      fontWeight: 800,
                    }}
                  >
                    {copy.complimentary}
                  </span>
                )}

                {details.complimentary === false && (
                  <span
                    style={{
                      padding: "6px 9px",
                      borderRadius: 999,
                      background: "#fff7ed",
                      color: "#c2410c",
                      fontSize: 9,
                      fontWeight: 800,
                    }}
                  >
                    {feeNote || copy.paid}
                  </span>
                )}
              </div>

              <div>
                <div
                  style={{
                    color: "#0f766e",
                    fontSize: 9,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 7,
                  }}
                >
                  {meta.label}
                </div>

                <h3
                  style={{
                    margin: 0,
                    color: "#0f172a",
                    fontSize: 18,
                    lineHeight: 1.25,
                    fontWeight: 800,
                    letterSpacing: "-0.025em",
                  }}
                >
                  {name}
                </h3>

                {description && (
                  <p
                    style={{
                      margin: "9px 0 0",
                      color: "#64748b",
                      fontSize: 12,
                      lineHeight: 1.65,
                    }}
                  >
                    {description}
                  </p>
                )}
              </div>

              {(openingHours ||
                location ||
                availabilityNote) && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 7,
                  }}
                >
                  {openingHours && (
                    <FacilityLine
                      icon={<Clock3 size={14} />}
                      value={openingHours}
                    />
                  )}

                  {location && (
                    <FacilityLine
                      icon={<ParkingCircle size={14} />}
                      value={location}
                    />
                  )}

                  {availabilityNote && (
                    <FacilityLine
                      icon={<Check size={14} />}
                      value={availabilityNote}
                    />
                  )}
                </div>
              )}

              {highlights.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 7,
                    marginTop: "auto",
                  }}
                >
                  {highlights.map((highlight) => (
                    <span
                      key={highlight}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "6px 9px",
                        borderRadius: 999,
                        background: "#f8fafc",
                        color: "#475569",
                        fontSize: 9,
                        fontWeight: 700,
                      }}
                    >
                      <Check size={12} />
                      {highlight}
                    </span>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function FacilityLine({
  icon,
  value,
}: {
  icon: ReactNode;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 7,
        color: "#64748b",
        fontSize: 10,
        fontWeight: 600,
        lineHeight: 1.45,
      }}
    >
      <span
        style={{
          flexShrink: 0,
          color: "#0f766e",
          marginTop: 1,
        }}
      >
        {icon}
      </span>

      {value}
    </div>
  );
}
