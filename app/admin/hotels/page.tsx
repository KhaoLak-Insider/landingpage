"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  ChevronRight,
  ImageIcon,
  Plus,
  Search,
} from "lucide-react";
import { supabase } from "@/src/lib/supabase";

interface PremiumHotelListItem {
  id: string;
  spot_id: string;
  status: "draft" | "published" | "archived";
  room_count?: number | null;
  pool_count?: number | null;
  restaurant_count?: number | null;
  bar_count?: number | null;
  gallery_images?: unknown;
  faq_items?: unknown;
  updated_at?: string | null;
  spots?: {
    id: string;
    slug: string;
    title: string;
    title_en?: string | null;
    image_url?: string | null;
  } | null;
}

type StatusFilter = "all" | "published" | "draft" | "archived";

const statusLabels: Record<
  Exclude<StatusFilter, "all">,
  string
> = {
  published: "Veröffentlicht",
  draft: "Entwurf",
  archived: "Archiviert",
};

function getArrayLength(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

function formatDate(value?: string | null): string {
  if (!value) return "Keine Angabe";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Keine Angabe";
  }

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<PremiumHotelListItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;

    async function loadHotels() {
      setIsLoading(true);
      setErrorMessage(null);

      const { data, error } = await supabase
        .from("premium_hotels")
        .select(`
          id,
          spot_id,
          status,
          room_count,
          pool_count,
          restaurant_count,
          bar_count,
          gallery_images,
          faq_items,
          updated_at,
          spots (
            id,
            slug,
            title,
            title_en,
            image_url
          )
        `)
        .order("updated_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.error(
          "Fehler beim Laden der Premium-Hotels:",
          error,
        );
        setErrorMessage(
          "Die Premium-Hotels konnten nicht geladen werden.",
        );
        setHotels([]);
      } else {
        const normalizedHotels: PremiumHotelListItem[] = (data ?? []).map((hotel: any) => ({
          ...hotel,
          spots: Array.isArray(hotel.spots)
            ? hotel.spots[0] ?? null
            : hotel.spots ?? null,
        }));

        setHotels(normalizedHotels);
      }

      setIsLoading(false);
    }

    loadHotels();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredHotels = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return hotels.filter((hotel) => {
      const matchesStatus =
        statusFilter === "all" || hotel.status === statusFilter;

      if (!matchesStatus) return false;

      if (!query) return true;

      const title = String(hotel.spots?.title || "").toLowerCase();
      const titleEn = String(
        hotel.spots?.title_en || "",
      ).toLowerCase();
      const slug = String(hotel.spots?.slug || "").toLowerCase();

      return (
        title.includes(query) ||
        titleEn.includes(query) ||
        slug.includes(query)
      );
    });
  }, [hotels, searchValue, statusFilter]);

  const counts = useMemo(
    () => ({
      all: hotels.length,
      published: hotels.filter(
        (hotel) => hotel.status === "published",
      ).length,
      draft: hotels.filter((hotel) => hotel.status === "draft")
        .length,
      archived: hotels.filter(
        (hotel) => hotel.status === "archived",
      ).length,
    }),
    [hotels],
  );

  return (
    <div className="admin-hotels">
      <header className="admin-hotels__header">
        <div>
          <span className="admin-hotels__eyebrow">
            Premium-Verwaltung
          </span>
          <h1>Hotels</h1>
          <p>
            Verwalte Premium-Hotelprofile, Zimmer, Galerie und FAQ.
          </p>
        </div>

        <Link
          href="/admin/hotels/new"
          className="admin-hotels__new"
        >
          <Plus size={17} />
          <span>Premium-Hotel anlegen</span>
        </Link>
      </header>

      <section className="admin-hotels__toolbar">
        <label className="admin-hotels__search">
          <Search size={17} />
          <input
            type="search"
            value={searchValue}
            onChange={(event) =>
              setSearchValue(event.target.value)
            }
            placeholder="Hotel suchen …"
          />
        </label>

        <div className="admin-hotels__filters">
          {(
            [
              ["all", "Alle"],
              ["published", "Veröffentlicht"],
              ["draft", "Entwürfe"],
              ["archived", "Archiviert"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={
                statusFilter === value ? "is-active" : ""
              }
              onClick={() => setStatusFilter(value)}
            >
              <span>{label}</span>
              <strong>{counts[value]}</strong>
            </button>
          ))}
        </div>
      </section>

      {errorMessage && (
        <div className="admin-hotels__error">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="admin-hotels__loading">
          <div />
          <p>Premium-Hotels werden geladen …</p>
        </div>
      ) : filteredHotels.length === 0 ? (
        <section className="admin-hotels__empty">
          <Building2 size={34} strokeWidth={1.5} />
          <h2>Keine Hotels gefunden</h2>
          <p>
            Für diese Suche oder diesen Status gibt es aktuell keine
            Einträge.
          </p>
        </section>
      ) : (
        <section className="admin-hotels__list">
          {filteredHotels.map((hotel) => {
            const title =
              hotel.spots?.title ||
              hotel.spots?.title_en ||
              "Unbenanntes Hotel";

            const galleryCount = getArrayLength(
              hotel.gallery_images,
            );
            const faqCount = getArrayLength(hotel.faq_items);

            return (
              <Link
                key={hotel.id}
                href={`/admin/hotels/${encodeURIComponent(
                  hotel.spot_id,
                )}`}
                className="admin-hotel-card"
              >
                <div className="admin-hotel-card__image">
                  {hotel.spots?.image_url ? (
                    <img
                      src={hotel.spots.image_url}
                      alt={title}
                    />
                  ) : (
                    <span>
                      <ImageIcon size={24} />
                    </span>
                  )}
                </div>

                <div className="admin-hotel-card__content">
                  <div className="admin-hotel-card__title-row">
                    <div>
                      <h2>{title}</h2>
                      <p>{hotel.spots?.slug || "Kein Slug"}</p>
                    </div>

                    <span
                      className={`admin-hotel-card__status admin-hotel-card__status--${hotel.status}`}
                    >
                      {statusLabels[hotel.status]}
                    </span>
                  </div>

                  <div className="admin-hotel-card__facts">
                    <span>
                      <strong>{hotel.room_count ?? 0}</strong>
                      Zimmer
                    </span>
                    <span>
                      <strong>{hotel.pool_count ?? 0}</strong>
                      Pools
                    </span>
                    <span>
                      <strong>{galleryCount}</strong>
                      Bilder
                    </span>
                    <span>
                      <strong>{faqCount}</strong>
                      FAQ
                    </span>
                  </div>

                  <div className="admin-hotel-card__footer">
                    <span>
                      Aktualisiert am {formatDate(hotel.updated_at)}
                    </span>

                    <strong>
                      Bearbeiten
                      <ChevronRight size={16} />
                    </strong>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      )}

      <style jsx>{`
        .admin-hotels {
          max-width: 1220px;
          margin: 0 auto;
        }

        .admin-hotels__header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
        }

        .admin-hotels__eyebrow {
          display: block;
          margin-bottom: 7px;
          color: #079ca5;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .admin-hotels__header h1 {
          margin: 0;
          color: #10233f;
          font-size: clamp(30px, 4vw, 42px);
          line-height: 1.1;
          letter-spacing: -0.04em;
        }

        .admin-hotels__header p {
          margin: 10px 0 0;
          color: #68778a;
          font-size: 13px;
          line-height: 1.7;
        }

        .admin-hotels__new {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 15px;
          border-radius: 11px;
          background: #079ca5;
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          box-shadow: 0 8px 20px rgba(7, 156, 165, 0.2);
        }

        .admin-hotels__new:hover {
          background: #07868e;
        }

        .admin-hotels__toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-top: 28px;
          padding: 14px;
          border: 1px solid #e5ebef;
          border-radius: 16px;
          background: #ffffff;
          box-shadow: 0 8px 24px rgba(15, 35, 62, 0.03);
        }

        .admin-hotels__search {
          display: flex;
          min-width: 260px;
          flex: 1;
          align-items: center;
          gap: 9px;
          padding: 0 12px;
          border: 1px solid #dfe7eb;
          border-radius: 11px;
          background: #f9fbfc;
          color: #8290a2;
        }

        .admin-hotels__search input {
          width: 100%;
          min-height: 39px;
          border: 0;
          outline: 0;
          background: transparent;
          color: #10233f;
          font-family: inherit;
          font-size: 11px;
        }

        .admin-hotels__filters {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .admin-hotels__filters button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 10px;
          border: 1px solid #e0e7eb;
          border-radius: 999px;
          background: #ffffff;
          color: #66768a;
          font-family: inherit;
          font-size: 10px;
          font-weight: 650;
          cursor: pointer;
        }

        .admin-hotels__filters button strong {
          display: inline-flex;
          min-width: 19px;
          height: 19px;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #eef3f5;
          color: #43536a;
          font-size: 9px;
        }

        .admin-hotels__filters button.is-active {
          border-color: #bfe1e3;
          background: #eafafa;
          color: #078f98;
        }

        .admin-hotels__filters button.is-active strong {
          background: #079ca5;
          color: #ffffff;
        }

        .admin-hotels__error {
          margin-top: 18px;
          padding: 13px 15px;
          border: 1px solid #fecdd3;
          border-radius: 12px;
          background: #fff1f2;
          color: #be123c;
          font-size: 11px;
          font-weight: 600;
        }

        .admin-hotels__loading,
        .admin-hotels__empty {
          display: flex;
          min-height: 300px;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          margin-top: 18px;
          padding: 28px;
          border: 1px solid #e5ebef;
          border-radius: 18px;
          background: #ffffff;
          color: #718096;
          text-align: center;
        }

        .admin-hotels__loading > div {
          width: 32px;
          height: 32px;
          border: 3px solid #dbe7ea;
          border-top-color: #079ca5;
          border-radius: 999px;
          animation: spin 700ms linear infinite;
        }

        .admin-hotels__loading p {
          margin: 12px 0 0;
          font-size: 11px;
        }

        .admin-hotels__empty :global(svg) {
          color: #9fb0bd;
        }

        .admin-hotels__empty h2 {
          margin: 14px 0 0;
          color: #10233f;
          font-size: 18px;
        }

        .admin-hotels__empty p {
          margin: 7px 0 0;
          font-size: 11px;
          line-height: 1.6;
        }

        .admin-hotels__list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 18px;
        }

        .admin-hotel-card {
          display: grid;
          grid-template-columns: 150px minmax(0, 1fr);
          min-height: 150px;
          overflow: hidden;
          border: 1px solid #e5ebef;
          border-radius: 16px;
          background: #ffffff;
          color: inherit;
          box-shadow: 0 8px 24px rgba(15, 35, 62, 0.03);
          text-decoration: none;
          transition:
            transform 180ms ease,
            border-color 180ms ease,
            box-shadow 180ms ease;
        }

        .admin-hotel-card:hover {
          transform: translateY(-2px);
          border-color: #cfe4e6;
          box-shadow: 0 14px 30px rgba(15, 35, 62, 0.075);
        }

        .admin-hotel-card__image {
          display: flex;
          min-height: 150px;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #edf4f4;
          color: #8da1ad;
        }

        .admin-hotel-card__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .admin-hotel-card__content {
          display: flex;
          min-width: 0;
          flex-direction: column;
          justify-content: space-between;
          padding: 17px 19px 15px;
        }

        .admin-hotel-card__title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
        }

        .admin-hotel-card__title-row > div {
          min-width: 0;
        }

        .admin-hotel-card__title-row h2 {
          margin: 0;
          overflow: hidden;
          color: #10233f;
          font-size: 16px;
          line-height: 1.35;
          letter-spacing: -0.02em;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .admin-hotel-card__title-row p {
          margin: 4px 0 0;
          overflow: hidden;
          color: #8a98a8;
          font-size: 9px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .admin-hotel-card__status {
          flex: 0 0 auto;
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .admin-hotel-card__status--published {
          background: #dcfce7;
          color: #15803d;
        }

        .admin-hotel-card__status--draft {
          background: #fff7ed;
          color: #c2410c;
        }

        .admin-hotel-card__status--archived {
          background: #eef2f7;
          color: #64748b;
        }

        .admin-hotel-card__facts {
          display: flex;
          flex-wrap: wrap;
          gap: 9px 20px;
          margin-top: 14px;
        }

        .admin-hotel-card__facts span {
          display: inline-flex;
          align-items: baseline;
          gap: 5px;
          color: #718096;
          font-size: 9px;
        }

        .admin-hotel-card__facts strong {
          color: #10233f;
          font-size: 11px;
        }

        .admin-hotel-card__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid #eef2f4;
        }

        .admin-hotel-card__footer > span {
          color: #8a98a8;
          font-size: 9px;
        }

        .admin-hotel-card__footer strong {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #079ca5;
          font-size: 10px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 820px) {
          .admin-hotels__header,
          .admin-hotels__toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .admin-hotels__new {
            align-self: flex-start;
          }

          .admin-hotels__search {
            min-width: 0;
          }
        }

        @media (max-width: 600px) {
          .admin-hotel-card {
            grid-template-columns: 1fr;
          }

          .admin-hotel-card__image {
            height: 180px;
            min-height: 180px;
          }

          .admin-hotel-card__title-row {
            flex-direction: column;
          }

          .admin-hotel-card__footer {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}