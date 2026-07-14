"use client";

import Link from "next/link";
import {
  BedDouble,
  ChevronRight,
  ImageIcon,
  Plus,
  Users,
} from "lucide-react";

export type AdminRoomStatus = "draft" | "published" | "archived";

export interface AdminRoomSummary {
  id: string;
  slug: string | null;
  status: AdminRoomStatus;
  sort_order: number | null;
  name_de: string;
  name_en: string | null;
  short_description_de: string | null;
  size_sqm: number | null;
  max_occupancy: number | null;
  bed_type_de: string | null;
  view_de: string | null;
  cover_image_url: string | null;
}

interface Props {
  spotId: string;
  rooms: AdminRoomSummary[];
}

function getStatusLabel(status: AdminRoomStatus): string {
  if (status === "published") return "Veröffentlicht";
  if (status === "archived") return "Archiviert";
  return "Entwurf";
}

export default function HotelRooms({ spotId, rooms }: Props) {
  return (
    <section className="admin-hotel-card hotel-rooms-admin">
      <div className="admin-hotel-card__header hotel-rooms-admin__header">
        <div>
          <span>Zimmerverwaltung</span>
          <h2>Zimmer und Villen</h2>
        </div>

        <div className="hotel-rooms-admin__header-actions">
          <span className="hotel-rooms-admin__count">
            <BedDouble size={15} />
            {rooms.length} {rooms.length === 1 ? "Zimmertyp" : "Zimmertypen"}
          </span>

          <Link
            href={`/admin/hotels/${encodeURIComponent(spotId)}/rooms/new`}
            className="hotel-rooms-admin__add"
          >
            <Plus size={14} />
            Neues Zimmer
          </Link>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="hotel-rooms-admin__empty">
          <span className="hotel-rooms-admin__empty-icon">
            <BedDouble size={28} />
          </span>
          <h3>Noch keine Zimmer vorhanden</h3>
          <p>
            Lege den ersten Zimmertyp an, um ihn anschließend auf der
            Premium-Hotelseite anzeigen zu können.
          </p>

          <Link
            href={`/admin/hotels/${encodeURIComponent(spotId)}/rooms/new`}
          >
            <Plus size={14} />
            Erstes Zimmer anlegen
          </Link>
        </div>
      ) : (
        <div className="hotel-rooms-admin__list">
          {rooms.map((room) => (
            <Link
              href={`/admin/hotels/${encodeURIComponent(
                spotId,
              )}/rooms/${encodeURIComponent(room.id)}`}
              className="hotel-rooms-admin__row"
              key={room.id}
            >
              <div className="hotel-rooms-admin__image">
                {room.cover_image_url ? (
                  <img
                    src={room.cover_image_url}
                    alt={room.name_de}
                  />
                ) : (
                  <ImageIcon size={22} />
                )}
              </div>

              <div className="hotel-rooms-admin__content">
                <div className="hotel-rooms-admin__title-row">
                  <div>
                    <h3>{room.name_de}</h3>
                    {room.name_en && <span>{room.name_en}</span>}
                  </div>

                  <span
                    className={`hotel-rooms-admin__status hotel-rooms-admin__status--${room.status}`}
                  >
                    {getStatusLabel(room.status)}
                  </span>
                </div>

                {room.short_description_de && (
                  <p>{room.short_description_de}</p>
                )}

                <div className="hotel-rooms-admin__meta">
                  {room.size_sqm !== null && (
                    <span>{room.size_sqm} m²</span>
                  )}

                  {room.max_occupancy !== null && (
                    <span>
                      <Users size={13} />
                      max. {room.max_occupancy}
                    </span>
                  )}

                  {room.bed_type_de && <span>{room.bed_type_de}</span>}
                  {room.view_de && <span>{room.view_de}</span>}
                </div>
              </div>

              <span className="hotel-rooms-admin__open">
                <ChevronRight size={18} />
              </span>
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        .hotel-rooms-admin__header {
          align-items: center;
        }

        .hotel-rooms-admin__header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .hotel-rooms-admin__count,
        .hotel-rooms-admin__add {
          display: inline-flex;
          min-height: 36px;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 11px;
          border-radius: 10px;
          font-size: 9px;
          font-weight: 800;
          text-decoration: none;
        }

        .hotel-rooms-admin__count {
          margin: 0;
          background: #eef8f8;
          color: #087f86;
          letter-spacing: 0;
          text-transform: none;
        }

        .hotel-rooms-admin__add {
          background: #079ca5;
          color: #fff;
        }

        .hotel-rooms-admin__list {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .hotel-rooms-admin__row {
          display: grid;
          grid-template-columns: 86px minmax(0, 1fr) 38px;
          align-items: center;
          gap: 14px;
          padding: 10px;
          border: 1px solid #e4eaee;
          border-radius: 14px;
          background: #fbfcfd;
          color: inherit;
          text-decoration: none;
          transition:
            border-color 150ms ease,
            background 150ms ease,
            transform 150ms ease,
            box-shadow 150ms ease;
        }

        .hotel-rooms-admin__row:hover {
          transform: translateY(-1px);
          border-color: #b8dcde;
          background: #fff;
          box-shadow: 0 8px 20px rgba(15, 35, 62, 0.05);
        }

        .hotel-rooms-admin__image {
          display: flex;
          width: 86px;
          height: 68px;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 10px;
          background: #edf3f4;
          color: #7b8b98;
        }

        .hotel-rooms-admin__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hotel-rooms-admin__content {
          min-width: 0;
        }

        .hotel-rooms-admin__title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
        }

        .hotel-rooms-admin__title-row > div {
          min-width: 0;
        }

        .hotel-rooms-admin h3 {
          overflow: hidden;
          margin: 0;
          color: #21354d;
          font-size: 12px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .hotel-rooms-admin__title-row > div > span {
          display: block;
          overflow: hidden;
          margin-top: 3px;
          color: #8995a4;
          font-size: 9px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .hotel-rooms-admin__content p {
          display: -webkit-box;
          overflow: hidden;
          margin: 7px 0 0;
          color: #68778a;
          font-size: 9px;
          line-height: 1.55;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .hotel-rooms-admin__meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 14px;
          margin-top: 9px;
          color: #617083;
          font-size: 8px;
          font-weight: 700;
        }

        .hotel-rooms-admin__meta span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .hotel-rooms-admin__status {
          flex: 0 0 auto;
          padding: 6px 8px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 800;
        }

        .hotel-rooms-admin__status--published {
          background: #e9fbf4;
          color: #087b58;
        }

        .hotel-rooms-admin__status--draft {
          background: #fff7e2;
          color: #a16306;
        }

        .hotel-rooms-admin__status--archived {
          background: #eef2f6;
          color: #64748b;
        }

        .hotel-rooms-admin__open {
          display: flex;
          width: 34px;
          height: 34px;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          color: #7b8798;
        }

        .hotel-rooms-admin__row:hover .hotel-rooms-admin__open {
          background: #e9f8f8;
          color: #079ca5;
        }

        .hotel-rooms-admin__empty {
          display: flex;
          min-height: 210px;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
        }

        .hotel-rooms-admin__empty-icon {
          display: flex;
          width: 54px;
          height: 54px;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          background: #edf8f8;
          color: #079ca5;
        }

        .hotel-rooms-admin__empty h3 {
          margin: 13px 0 5px;
          color: #304258;
          font-size: 13px;
        }

        .hotel-rooms-admin__empty p {
          max-width: 420px;
          margin: 0;
          color: #7b8798;
          font-size: 9px;
          line-height: 1.7;
        }

        .hotel-rooms-admin__empty a {
          display: inline-flex;
          min-height: 38px;
          align-items: center;
          gap: 6px;
          margin-top: 14px;
          padding: 0 12px;
          border-radius: 10px;
          background: #079ca5;
          color: #fff;
          font-size: 9px;
          font-weight: 800;
          text-decoration: none;
        }

        @media (max-width: 700px) {
          .hotel-rooms-admin__header {
            align-items: flex-start;
          }

          .hotel-rooms-admin__header-actions {
            width: 100%;
          }

          .hotel-rooms-admin__count,
          .hotel-rooms-admin__add {
            flex: 1;
          }

          .hotel-rooms-admin__row {
            grid-template-columns: 68px minmax(0, 1fr) 32px;
            gap: 10px;
          }

          .hotel-rooms-admin__image {
            width: 68px;
            height: 60px;
          }

          .hotel-rooms-admin__title-row {
            align-items: flex-start;
            flex-direction: column;
            gap: 7px;
          }
        }
      `}</style>
    </section>
  );
}
