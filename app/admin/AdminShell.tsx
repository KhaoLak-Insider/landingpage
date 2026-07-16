"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BedDouble,
  Building2,
  FilePlus2,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  PencilLine,
  Menu,
  Settings,
  Utensils,
  X,
} from "lucide-react";
import { supabase } from "@/src/lib/supabase";

interface AdminShellProps {
  children: ReactNode;
}

interface AdminUser {
  email: string;
  role: string;
}

const navigation = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Hotels", href: "/admin/hotels", icon: Building2 },
  { label: "Zimmer", href: "/admin/rooms", icon: BedDouble },
  { label: "Spots", href: "/admin/spots", icon: MapPin },
  { label: "Spot anlegen", href: "/admin/editor", icon: FilePlus2 },
  { label: "Spots bearbeiten", href: "/admin/editor/list", icon: PencilLine },
  { label: "Blogbeitrag schreiben", href: "/admin/editor/blog", icon: FileText },
  { label: "Restaurants", href: "/admin/restaurants", icon: Utensils },
  { label: "Blog", href: "/admin/blog", icon: FileText },
  { label: "Einstellungen", href: "/admin/settings", icon: Settings },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/admin" || href === "/admin/editor") {
    return pathname === href;
  }

  if (href === "/admin/editor/list") {
    return (
      pathname === href ||
      pathname.startsWith("/admin/editor/edit/")
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAccess() {
      setIsLoading(true);
      setAccessDenied(false);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!isMounted) return;

      if (profileError) {
        console.error("Fehler beim Laden des Admin-Profils:", profileError);
      }

      const role = String(profile?.role || "").trim().toLowerCase();

      if (role !== "admin" && role !== "editor") {
        setAccessDenied(true);
        setIsLoading(false);
        return;
      }

      setAdminUser({
        email: user.email || "Admin",
        role,
      });

      setIsLoading(false);
    }

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (isLoading) {
    return (
      <main className="admin-state">
        <div className="admin-state__spinner" />
        <p>Admin-Bereich wird geladen …</p>

        <style jsx>{`
          .admin-state {
            display: flex;
            min-height: 100vh;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 14px;
            background: #f8fafc;
            color: #64748b;
            font-family: "Poppins", sans-serif;
          }

          .admin-state__spinner {
            width: 34px;
            height: 34px;
            border: 3px solid #dbe7ea;
            border-top-color: #079ca5;
            border-radius: 999px;
            animation: spin 700ms linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="admin-denied">
        <div>
          <strong>Zugriff verweigert</strong>
          <p>
            Dieser Bereich ist nur für Administratoren und Redakteure
            freigegeben.
          </p>
          <Link href="/">Zur Startseite</Link>
        </div>

        <style jsx>{`
          .admin-denied {
            display: flex;
            min-height: 100vh;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background: #f8fafc;
            font-family: "Poppins", sans-serif;
          }

          .admin-denied > div {
            width: min(100%, 440px);
            padding: 28px;
            border: 1px solid #e5ebef;
            border-radius: 18px;
            background: #ffffff;
            box-shadow: 0 16px 40px rgba(15, 35, 62, 0.08);
            text-align: center;
          }

          .admin-denied strong {
            color: #10233f;
            font-size: 22px;
          }

          .admin-denied p {
            margin: 12px 0 20px;
            color: #64748b;
            font-size: 13px;
            line-height: 1.7;
          }

          .admin-denied a {
            color: #079ca5;
            font-size: 13px;
            font-weight: 700;
            text-decoration: none;
          }
        `}</style>
      </main>
    );
  }

  return (
    <div className="admin-layout">
      <button
        type="button"
        className="admin-mobile-menu"
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Admin-Menü öffnen"
      >
        <Menu size={20} />
      </button>

      {isSidebarOpen && (
        <button
          type="button"
          className="admin-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Admin-Menü schließen"
        />
      )}

      <aside className={`admin-sidebar${isSidebarOpen ? " is-open" : ""}`}>
        <div className="admin-sidebar__header">
          <Link href="/admin" className="admin-brand">
            <span className="admin-brand__mark">KI</span>

            <span>
              <strong>Khao Lak Insider</strong>
              <small>Administration</small>
            </span>
          </Link>

          <button
            type="button"
            className="admin-sidebar__close"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Admin-Menü schließen"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="admin-nav" aria-label="Admin-Navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav__item${isActive ? " is-active" : ""}`}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-user">
            <span className="admin-user__avatar">
              {adminUser?.email?.charAt(0).toUpperCase() || "A"}
            </span>

            <span className="admin-user__copy">
              <strong>{adminUser?.email}</strong>
              <small>{adminUser?.role}</small>
            </span>
          </div>

          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            <span>Abmelden</span>
          </button>
        </div>
      </aside>

      <main className="admin-content">{children}</main>

      <style jsx>{`
        .admin-layout {
          min-height: 100vh;
          background: #f6f8fa;
          color: #10233f;
          font-family: "Poppins", sans-serif;
        }

        .admin-sidebar {
          position: fixed;
          inset: 0 auto 0 0;
          z-index: 50;
          display: flex;
          width: 248px;
          flex-direction: column;
          border-right: 1px solid #e4e9ee;
          background: #ffffff;
        }

        .admin-sidebar__header {
          display: flex;
          min-height: 76px;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          border-bottom: 1px solid #edf1f4;
        }

        .admin-brand {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 11px;
          color: inherit;
          text-decoration: none;
        }

        .admin-brand__mark {
          display: inline-flex;
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: #079ca5;
          color: #ffffff;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        .admin-brand > span:last-child {
          display: flex;
          min-width: 0;
          flex-direction: column;
        }

        .admin-brand strong {
          overflow: hidden;
          font-size: 12px;
          line-height: 1.35;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .admin-brand small {
          color: #8492a4;
          font-size: 9px;
          line-height: 1.4;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .admin-sidebar__close {
          display: none;
          width: 34px;
          height: 34px;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 999px;
          background: #f1f5f7;
          color: #334155;
          cursor: pointer;
        }

        .admin-nav {
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 5px;
          padding: 18px 13px;
          overflow-y: auto;
        }

        .admin-nav__item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 11px 12px;
          border-radius: 10px;
          color: #5c6a7d;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          transition:
            background 160ms ease,
            color 160ms ease;
        }

        .admin-nav__item:hover {
          background: #f3f8f8;
          color: #087f86;
        }

        .admin-nav__item.is-active {
          background: #eafafa;
          color: #078f98;
        }

        .admin-sidebar__footer {
          padding: 14px;
          border-top: 1px solid #edf1f4;
        }

        .admin-user {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 11px;
          background: #f8fafc;
        }

        .admin-user__avatar {
          display: inline-flex;
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #10233f;
          color: #ffffff;
          font-size: 12px;
          font-weight: 800;
        }

        .admin-user__copy {
          display: flex;
          min-width: 0;
          flex: 1;
          flex-direction: column;
        }

        .admin-user__copy strong {
          overflow: hidden;
          font-size: 10px;
          line-height: 1.4;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .admin-user__copy small {
          color: #8492a4;
          font-size: 9px;
          line-height: 1.4;
          text-transform: capitalize;
        }

        .admin-logout {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
          padding: 9px 12px;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: #7b8798;
          font-family: inherit;
          font-size: 10px;
          font-weight: 650;
          cursor: pointer;
        }

        .admin-logout:hover {
          background: #fff1f2;
          color: #be123c;
        }

        .admin-content {
          min-height: 100vh;
          margin-left: 248px;
          padding: 34px 38px 64px;
        }

        .admin-mobile-menu {
          position: fixed;
          top: 14px;
          left: 14px;
          z-index: 40;
          display: none;
          width: 40px;
          height: 40px;
          align-items: center;
          justify-content: center;
          border: 1px solid #dfe6eb;
          border-radius: 11px;
          background: #ffffff;
          color: #10233f;
          box-shadow: 0 8px 20px rgba(15, 35, 62, 0.08);
          cursor: pointer;
        }

        .admin-backdrop {
          position: fixed;
          inset: 0;
          z-index: 45;
          border: 0;
          background: rgba(15, 23, 42, 0.38);
          backdrop-filter: blur(2px);
        }

        @media (max-width: 900px) {
          .admin-sidebar {
            transform: translateX(-100%);
            transition: transform 220ms ease;
          }

          .admin-sidebar.is-open {
            transform: translateX(0);
          }

          .admin-sidebar__close,
          .admin-mobile-menu {
            display: inline-flex;
          }

          .admin-content {
            margin-left: 0;
            padding: 76px 18px 48px;
          }
        }
      `}</style>
    </div>
  );
}
