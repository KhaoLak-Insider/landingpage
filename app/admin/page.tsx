"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BedDouble,
  Building2,
  FileText,
  MapPin,
  PencilLine,
  Plus,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { supabase } from "@/src/lib/supabase";

interface DashboardCounts {
  spots: number;
  premiumHotels: number;
  premiumRooms: number;
  drafts: number;
  googleImages: number;
  manualImages: number;
  unknownImages: number;
}

const initialCounts: DashboardCounts = {
  spots: 0,
  premiumHotels: 0,
  premiumRooms: 0,
  drafts: 0,
  googleImages: 0,
  manualImages: 0,
  unknownImages: 0,
};

export default function AdminDashboardPage() {
  const [counts, setCounts] =
    useState<DashboardCounts>(initialCounts);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingImages, setIsRefreshingImages] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

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
        googleImagesResult,
        manualImagesResult,
        unknownImagesResult,
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

        supabase
          .from("spots")
          .select("id", { count: "exact", head: true })
          .eq("image_source", "google"),

        supabase
          .from("spots")
          .select("id", { count: "exact", head: true })
          .eq("image_source", "manual"),

        supabase
          .from("spots")
          .select("id", { count: "exact", head: true })
          .or("image_source.is.null,image_source.eq."),
      ]);

      if (!isMounted) return;

      setCounts({
        spots: spotsResult.count || 0,
        premiumHotels: hotelsResult.count || 0,
        premiumRooms: roomsResult.count || 0,
        drafts:
          (draftHotelsResult.count || 0) +
          (draftRoomsResult.count || 0),
        googleImages: googleImagesResult.count || 0,
        manualImages: manualImagesResult.count || 0,
        unknownImages: unknownImagesResult.count || 0,
      });

      setIsLoading(false);
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  async function refreshGoogleImages() {
    setIsRefreshingImages(true);
    setRefreshMessage(null);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const response = await fetch("/api/admin/refresh-google-spot-images", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Bilder konnten nicht aktualisiert werden.");
      setRefreshMessage(`Aktualisiert: ${payload.updated || 0}, übersprungen: ${payload.skipped || 0}`);
    } catch (error) {
      setRefreshMessage(error instanceof Error ? error.message : "Unbekannter Fehler.");
    } finally {
      setIsRefreshingImages(false);
    }
  }

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

        <Link
          href="/admin/hotels/new"
          className="admin-dashboard__create-hotel"
        >
          <Plus size={17} strokeWidth={2} />
          Neues Premium-Hotel anlegen
        </Link>
      </header>

      <section className="admin-dashboard__maintenance">
        <div>
          <span>Wartung</span>
          <strong>Google-Bilder aktualisieren</strong>
          <p>
            Erneuert nur Spots mit Google-Photo-Referenz. Eigene Uploads bleiben unverändert.
          </p>
        </div>
        <button
          type="button"
          className="admin-dashboard__refresh"
          onClick={refreshGoogleImages}
          disabled={isRefreshingImages}
        >
          {isRefreshingImages ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {isRefreshingImages ? "Aktualisiere..." : "Alle Bilder aktualisieren"}
        </button>
      {refreshMessage ? <small className="admin-dashboard__maintenance-message">{refreshMessage}</small> : null}
      </section>

      <section className="admin-dashboard__source-report">
        <div className="admin-dashboard__section-heading">
          <h2>Bildquellen</h2>
          <p>Aufteilung der Spot-Bilder nach Herkunft.</p>
        </div>

        <div className="admin-dashboard__source-grid">
          <article>
            <span>Google</span>
            <strong>{isLoading ? "–" : counts.googleImages.toLocaleString("de-DE")}</strong>
            <small>Wird über den Google-Proxy geladen</small>
          </article>
          <article>
            <span>Manuell</span>
            <strong>{isLoading ? "–" : counts.manualImages.toLocaleString("de-DE")}</strong>
            <small>Eigene Uploads bleiben erhalten</small>
          </article>
          <article>
            <span>Unbekannt</span>
            <strong>{isLoading ? "–" : counts.unknownImages.toLocaleString("de-DE")}</strong>
            <small>Sollte nach dem Backfill gegen 0 gehen</small>
          </article>
        </div>
      </section>

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

          <Link href="/admin/editor">
            <Plus size={21} />
            <strong>Spot anlegen</strong>
            <span>
              Einen neuen Ort mit Inhalten, Medien und Standort erfassen.
            </span>
          </Link>

          <Link href="/admin/editor/list">
            <PencilLine size={21} />
            <strong>Spots bearbeiten</strong>
            <span>
              Bestehende Spots auswählen und ihre Inhalte aktualisieren.
            </span>
          </Link>

          <Link href="/admin/blog">
            <FileText size={21} />
            <strong>Blog verwalten</strong>
            <span>
              Deutsche und englische Beiträge erstellen und bearbeiten.
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

        .admin-dashboard__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
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

        .admin-dashboard__create-hotel {
          display: inline-flex;
          flex: 0 0 auto;
          align-items: center;
          gap: 8px;
          padding: 11px 15px;
          border-radius: 11px;
          background: #079ca5;
          color: #ffffff;
          font-size: 12px;
          font-weight: 750;
          line-height: 1.4;
          text-decoration: none;
          box-shadow: 0 8px 20px rgba(7, 156, 165, 0.2);
          transition:
            background 160ms ease,
            transform 160ms ease,
            box-shadow 160ms ease;
        }

        .admin-dashboard__create-hotel:hover {
          transform: translateY(-1px);
          background: #078b93;
          box-shadow: 0 11px 24px rgba(7, 156, 165, 0.25);
        }

        .admin-dashboard__maintenance {
          display: grid;
          gap: 10px;
          margin-top: 18px;
          padding: 18px 20px;
          border: 1px solid #dbe7ea;
          border-radius: 16px;
          background: linear-gradient(135deg, #f5fcfc, #ffffff);
          box-shadow: 0 10px 30px rgba(15, 35, 62, 0.04);
        }

        .admin-dashboard__maintenance span {
          display: block;
          color: #079ca5;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .admin-dashboard__maintenance strong {
          display: block;
          margin-top: 4px;
          color: #10233f;
          font-size: 16px;
        }

        .admin-dashboard__maintenance p {
          margin: 8px 0 0;
          color: #68778a;
          font-size: 12px;
          line-height: 1.6;
        }

        .admin-dashboard__refresh {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: fit-content;
          min-height: 41px;
          padding: 0 14px;
          border: 0;
          border-radius: 11px;
          background: #079ca5;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .admin-dashboard__refresh:disabled {
          cursor: wait;
          opacity: 0.7;
        }

        .admin-dashboard__maintenance-message {
          color: #53616e;
          font-size: 12px;
        }

        .admin-dashboard__source-report {
          margin-top: 18px;
          padding: 20px;
          border: 1px solid #e5ebef;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 8px 24px rgba(15, 35, 62, 0.035);
        }

        .admin-dashboard__source-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 16px;
        }

        .admin-dashboard__source-grid article {
          padding: 16px;
          border: 1px solid #e8edf2;
          border-radius: 14px;
          background: #fbfcfd;
        }

        .admin-dashboard__source-grid span {
          display: block;
          color: #079ca5;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .admin-dashboard__source-grid strong {
          display: block;
          margin-top: 8px;
          color: #10233f;
          font-size: 26px;
          line-height: 1;
          letter-spacing: -0.035em;
        }

        .admin-dashboard__source-grid small {
          display: block;
          margin-top: 8px;
          color: #718096;
          font-size: 11px;
          line-height: 1.5;
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
          grid-template-columns: repeat(2, minmax(0, 1fr));
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

          .admin-dashboard__source-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 680px) {
          .admin-dashboard__header {
            flex-direction: column;
          }

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
