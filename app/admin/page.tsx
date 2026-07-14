"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BedDouble,
  Building2,
  FileText,
  MapPin,
} from "lucide-react";
import { supabase } from "@/src/lib/supabase";

interface DashboardCounts {
  spots: number;
  premiumHotels: number;
  premiumRooms: number;
  drafts: number;
}

const initialCounts: DashboardCounts = {
  spots: 0,
  premiumHotels: 0,
  premiumRooms: 0,
  drafts: 0,
};

export default function AdminDashboardPage() {
  const [counts, setCounts] =
    useState<DashboardCounts>(initialCounts);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);

      const [
        spotsResult,
        hotelsResult,
        roomsResult,
        draftHotelsResult,
        draftRoomsResult,
      ] = await Promise.all([
        supabase
          .from("spots")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("premium_hotels")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("premium_rooms")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("premium_hotels")
          .select("id", { count: "exact", head: true })
          .eq("status", "draft"),

        supabase
          .from("premium_rooms")
          .select("id", { count: "exact", head: true })
          .eq("status", "draft"),
      ]);

      if (!isMounted) return;

      setCounts({
        spots: spotsResult.count || 0,
        premiumHotels: hotelsResult.count || 0,
        premiumRooms: roomsResult.count || 0,
        drafts:
          (draftHotelsResult.count || 0) +
          (draftRoomsResult.count || 0),
      });

      setIsLoading(false);
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const cards = [
    {
      label: "Spots",
      value: counts.spots,
      href: "/admin/spots",
      icon: MapPin,
    },
    {
      label: "Premium-Hotels",
      value: counts.premiumHotels,
      href: "/admin/hotels",
      icon: Building2,
    },
    {
      label: "Zimmer",
      value: counts.premiumRooms,
      href: "/admin/rooms",
      icon: BedDouble,
    },
    {
      label: "Entwürfe",
      value: counts.drafts,
      href: "/admin/hotels?status=draft",
      icon: FileText,
    },
  ];

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard__header">
        <div>
          <span>Redaktionssystem</span>
          <h1>Dashboard</h1>
          <p>
            Verwalte Premium-Hotels, Zimmer und alle Inhalte von
            Khao Lak Insider.
          </p>
        </div>
      </header>

      <section className="admin-dashboard__stats">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.label}
              href={card.href}
              className="admin-stat-card"
            >
              <div className="admin-stat-card__icon">
                <Icon size={20} strokeWidth={1.8} />
              </div>

              <span>{card.label}</span>

              <strong>
                {isLoading ? "–" : card.value.toLocaleString("de-DE")}
              </strong>
            </Link>
          );
        })}
      </section>

      <section className="admin-dashboard__quick">
        <div className="admin-dashboard__section-heading">
          <h2>Schnellzugriff</h2>
          <p>Die wichtigsten Verwaltungsbereiche auf einen Blick.</p>
        </div>

        <div className="admin-dashboard__quick-grid">
          <Link href="/admin/hotels">
            <Building2 size={21} />
            <strong>Hotels verwalten</strong>
            <span>
              Premium-Hotels öffnen, bearbeiten und veröffentlichen.
            </span>
          </Link>

          <Link href="/admin/rooms">
            <BedDouble size={21} />
            <strong>Zimmer verwalten</strong>
            <span>
              Zimmerkategorien und deren Ausstattung bearbeiten.
            </span>
          </Link>

          <Link href="/admin/spots">
            <MapPin size={21} />
            <strong>Spots verwalten</strong>
            <span>
              Bestehende Spots ansehen und später bearbeiten.
            </span>
          </Link>
        </div>
      </section>

      <style jsx>{`
        .admin-dashboard {
          max-width: 1220px;
          margin: 0 auto;
        }

        .admin-dashboard__header span {
          display: block;
          margin-bottom: 7px;
          color: #079ca5;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .admin-dashboard__header h1 {
          margin: 0;
          color: #10233f;
          font-size: clamp(30px, 4vw, 42px);
          line-height: 1.1;
          letter-spacing: -0.04em;
        }

        .admin-dashboard__header p {
          max-width: 680px;
          margin: 11px 0 0;
          color: #68778a;
          font-size: 13px;
          line-height: 1.7;
        }

        .admin-dashboard__stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-top: 28px;
        }

        .admin-stat-card {
          display: flex;
          min-width: 0;
          flex-direction: column;
          padding: 18px;
          border: 1px solid #e5ebef;
          border-radius: 16px;
          background: #ffffff;
          color: inherit;
          box-shadow: 0 8px 24px rgba(15, 35, 62, 0.035);
          text-decoration: none;
          transition:
            transform 180ms ease,
            border-color 180ms ease,
            box-shadow 180ms ease;
        }

        .admin-stat-card:hover {
          transform: translateY(-2px);
          border-color: #cfe4e6;
          box-shadow: 0 14px 30px rgba(15, 35, 62, 0.08);
        }

        .admin-stat-card__icon {
          display: inline-flex;
          width: 38px;
          height: 38px;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          border-radius: 11px;
          background: #eafafa;
          color: #079ca5;
        }

        .admin-stat-card > span {
          color: #718096;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .admin-stat-card strong {
          margin-top: 5px;
          color: #10233f;
          font-size: 28px;
          line-height: 1.15;
          letter-spacing: -0.035em;
        }

        .admin-dashboard__quick {
          margin-top: 34px;
          padding: 24px;
          border: 1px solid #e5ebef;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 8px 24px rgba(15, 35, 62, 0.035);
        }

        .admin-dashboard__section-heading h2 {
          margin: 0;
          color: #10233f;
          font-size: 19px;
          line-height: 1.35;
          letter-spacing: -0.025em;
        }

        .admin-dashboard__section-heading p {
          margin: 5px 0 0;
          color: #7a8798;
          font-size: 11px;
          line-height: 1.6;
        }

        .admin-dashboard__quick-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 18px;
        }

        .admin-dashboard__quick-grid a {
          display: flex;
          min-width: 0;
          flex-direction: column;
          padding: 17px;
          border: 1px solid #e8edf2;
          border-radius: 14px;
          background: #fbfcfd;
          color: #10233f;
          text-decoration: none;
          transition:
            background 160ms ease,
            border-color 160ms ease;
        }

        .admin-dashboard__quick-grid a:hover {
          border-color: #cfe4e6;
          background: #f2fbfb;
        }

        .admin-dashboard__quick-grid :global(svg) {
          margin-bottom: 13px;
          color: #079ca5;
        }

        .admin-dashboard__quick-grid strong {
          font-size: 13px;
          line-height: 1.4;
        }

        .admin-dashboard__quick-grid span {
          margin-top: 6px;
          color: #718096;
          font-size: 10px;
          line-height: 1.6;
        }

        @media (max-width: 1050px) {
          .admin-dashboard__stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 680px) {
          .admin-dashboard__stats,
          .admin-dashboard__quick-grid {
            grid-template-columns: 1fr;
          }

          .admin-dashboard__quick {
            padding: 18px;
          }
        }
      `}</style>
    </div>
  );
}