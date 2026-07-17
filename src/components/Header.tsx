"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import {
  Language,
} from "@/src/lib/i18n";
import {
  getLanguageFromPathname,
  localizePath,
  switchLanguagePath,
} from "@/src/lib/i18n-routing";
import { User } from "@supabase/supabase-js";

interface HeaderProfile {
  id?: string;
  username?: string | null;
  first_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<HeaderProfile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDiscoverOpen, setIsMobileDiscoverOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdminPath =
    pathname === "/admin" || pathname.startsWith("/admin/");

  const language = getLanguageFromPathname(pathname);
  const copy = language === "en"
    ? {
        discover: "Discover",
        plan: "Plan",
        blog: "Blog",
        community: "Community",
        about: "About us",
        appInfo: "App Info",
        selectLanguage: "Select language",
        german: "German",
        english: "English",
        profile: "Profile",
        favorites: "Favorites",
        logout: "Log out",
        login: "Log in",
      }
    : {
        discover: "Entdecken",
        plan: "Planen",
        blog: "Blog",
        community: "Community",
        about: "Über uns",
        appInfo: "App Info",
        selectLanguage: "Sprache auswählen",
        german: "Deutsch",
        english: "Englisch",
        profile: "Profil",
        favorites: "Favoriten",
        logout: "Abmelden",
        login: "Login",
      };

  function changeLanguage(newLanguage: Language) {
    router.push(
      switchLanguagePath(
        `${pathname}${searchParams.size ? `?${searchParams}` : ""}`,
        newLanguage
      ),
      {
        scroll: false,
      }
    );
  }

  function localizedHref(path: string) {
    return localizePath(path, language);
  }

  const discoverItems = language === "en"
    ? [
        ["strand", "Beaches"],
        ["essen-trinken", "Food & Drink"],
        ["unterkunft", "Accommodation"],
        ["ausfluege", "Excursions"],
        ["markt", "Markets"],
        ["natur", "Nature"],
        ["tempel", "Temples"],
      ]
    : [
        ["strand", "Strände"],
        ["essen-trinken", "Essen & Trinken"],
        ["unterkunft", "Unterkünfte"],
        ["ausfluege", "Ausflüge"],
        ["markt", "Märkte"],
        ["natur", "Natur"],
        ["tempel", "Tempel"],
      ];

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select(
            "username, first_name, avatar_url, role"
          )
          .eq("id", user.id)
          .single();

        setProfile(profile);
      }
    };

    fetchUserData();

    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          if (
            payload.new.id === user?.id ||
            payload.new.id === profile?.id
          ) {
            fetchUserData();
          }
        }
      )
      .subscribe();

    const { data: authListener } =
      supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user ?? null);

          if (session?.user) {
            fetchUserData();
          } else {
            setProfile(null);
          }
        }
      );

    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [user?.id, profile?.id]);

  return (
    <nav
      className={`relative z-50 flex items-center border-b border-slate-100 bg-white px-4 py-3 text-slate-900 md:px-8 md:py-6 ${
        isAdminPath ? "min-[901px]:ml-[248px]" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-12">
        <Link href={localizedHref("/")}>
          <Image
            src="https://pub-e91d905941ab460b95ac5248c28e16f3.r2.dev/assets/logo.png"
            alt="Khao Lak Insider"
            width={180}
            height={60}
            priority
            className="h-14 w-auto md:h-20"
          />
        </Link>

        <div className="hidden gap-8 text-sm font-semibold md:flex text-slate-600">
          <Link
            href={localizedHref("/")}
            className="transition hover:text-teal-500"
          >
            Home
          </Link>

          <Link
            href={localizedHref("/app")}
            className="transition hover:text-teal-500"
          >
            {copy.appInfo}
          </Link>

          <div className="group/discover relative flex items-center gap-1">
            <Link
              href={localizedHref("/entdecken")}
              className="transition hover:text-teal-500"
            >
              {copy.discover}
            </Link>
            <ChevronDown size={14} className="transition group-hover/discover:rotate-180 group-hover/discover:text-teal-500" aria-hidden="true" />

            <div className="invisible absolute left-1/2 top-full w-[470px] -translate-x-1/2 pt-5 opacity-0 transition-all duration-200 group-hover/discover:visible group-hover/discover:opacity-100 group-focus-within/discover:visible group-focus-within/discover:opacity-100">
              <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_22px_55px_rgba(15,35,62,.15)]">
                <Link
                  href={localizedHref("/entdecken")}
                  className="flex items-center justify-between rounded-xl bg-[#eefafa] px-4 py-3 text-[#087f85] transition hover:bg-[#dff6f5]"
                >
                  <span><strong className="block text-sm">{language === "en" ? "Discover all places" : "Alle Orte entdecken"}</strong><small className="mt-0.5 block font-medium text-[#4d7c80]">{language === "en" ? "Browse every Khao Lak Insider spot" : "Alle Khao-Lak-Spots im Überblick"}</small></span>
                  <span aria-hidden="true">→</span>
                </Link>
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {discoverItems.map(([slug, label]) => (
                    <Link
                      key={slug}
                      href={localizedHref(`/entdecken?category=${slug}`)}
                      className="rounded-xl px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-[#079ca5]"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Link
            href={localizedHref("/planen")}
            className="transition hover:text-teal-500"
          >
            {copy.plan}
          </Link>

          <Link
            href={localizedHref("/blog")}
            className="transition hover:text-teal-500"
          >
            {copy.blog}
          </Link>

          <Link
            href={localizedHref("/community")}
            className="transition hover:text-teal-500"
          >
            {copy.community}
          </Link>

          <Link
            href={localizedHref("/ueber-uns")}
            className="transition hover:text-teal-500"
          >
            {copy.about}
          </Link>
        </div>
      </div>

      <div className="flex-grow" />

      <div className="flex items-center gap-2 md:gap-5">
        <select
          value={language}
          onChange={(event) =>
            changeLanguage(
              event.target.value as Language
            )
          }
          aria-label={copy.selectLanguage}
          className="max-w-[92px] rounded-full border border-slate-200 bg-white px-2 py-2 text-xs font-bold text-slate-700 outline-none transition hover:border-teal-400 focus:border-teal-500 sm:max-w-none sm:px-4 sm:text-sm"
        >
          <option value="de">🇩🇪 {copy.german}</option>
          <option value="en">🇬🇧 {copy.english}</option>
        </select>

        {user ? (
          <div className="group relative flex cursor-pointer items-center gap-2">
            <div className="flex items-center gap-2 pr-2">
              <span className="hidden text-sm font-bold text-slate-900 lg:inline">
                {profile?.username || copy.profile}
              </span>

              <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-300 bg-slate-200">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-500">
                    {profile?.first_name?.[0] ||
                      user.email?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              <svg
                className="hidden h-4 w-4 text-slate-500 transition-transform group-hover:rotate-180 md:block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            <div className="invisible absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-100 bg-white opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
              <div className="p-2">
                <Link
                  href={localizedHref("/profil")}
                  className="block rounded-lg px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  {copy.profile}
                </Link>

                <Link
                  href={localizedHref("/favorites")}
                  className="block rounded-lg px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  {copy.favorites}
                </Link>

                {(profile?.role === "admin" ||
                  profile?.role === "editor") && (
                  <>
                    <div className="my-1 border-t border-slate-100" />

                    <Link
                      href="/admin"
                      className="block rounded-lg px-4 py-2 text-sm font-bold text-teal-700 hover:bg-teal-50"
                    >
                      Admin-CMS
                    </Link>
                  </>
                )}

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() =>
                    supabase.auth.signOut()
                  }
                  className="w-full rounded-lg px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50"
                >
                  {copy.logout}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Link
            href={localizedHref("/login")}
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            {copy.login}
          </Link>
        )}

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-header-menu"
          aria-label={isMobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-[#10233f] transition hover:border-[#0eb4bb] hover:text-[#079ca5] md:hidden"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div
        id="mobile-header-menu"
        className={`absolute inset-x-0 top-full border-b border-slate-200 bg-white px-4 shadow-[0_16px_30px_rgba(15,35,62,.1)] md:hidden ${
          isMobileMenuOpen ? "block" : "hidden"
        }`}
      >
        <div className="flex flex-col py-3 text-sm font-bold text-[#334155]">
          <Link
            href={localizedHref("/")}
            onClick={() => setIsMobileMenuOpen(false)}
            className="rounded-xl px-4 py-3 transition hover:bg-[#eefafa] hover:text-[#079ca5]"
          >
            Home
          </Link>

          <Link
            href={localizedHref("/app")}
            onClick={() => setIsMobileMenuOpen(false)}
            className="rounded-xl px-4 py-3 transition hover:bg-[#eefafa] hover:text-[#079ca5]"
          >
            {copy.appInfo}
          </Link>

          <div>
            <div className="flex items-center">
              <Link
                href={localizedHref("/entdecken")}
                onClick={() => setIsMobileMenuOpen(false)}
                className="min-w-0 flex-1 rounded-xl px-4 py-3 transition hover:bg-[#eefafa] hover:text-[#079ca5]"
              >
                {copy.discover}
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileDiscoverOpen((current) => !current)}
                aria-expanded={isMobileDiscoverOpen}
                aria-label={language === "en" ? "Show discover categories" : "Entdecken-Kategorien anzeigen"}
                className="mr-1 flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-[#eefafa] hover:text-[#079ca5]"
              >
                <ChevronDown size={17} className={`transition ${isMobileDiscoverOpen ? "rotate-180" : ""}`} />
              </button>
            </div>
            {isMobileDiscoverOpen && (
              <div className="mx-3 mb-2 grid grid-cols-2 gap-1 rounded-xl bg-slate-50 p-2">
                {discoverItems.map(([slug, label]) => (
                  <Link
                    key={slug}
                    href={localizedHref(`/entdecken?category=${slug}`)}
                    onClick={() => { setIsMobileMenuOpen(false); setIsMobileDiscoverOpen(false); }}
                    className="rounded-lg px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-white hover:text-[#079ca5]"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {[
            ["/planen", copy.plan],
            ["/blog", copy.blog],
            ["/community", copy.community],
            ["/ueber-uns", copy.about],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={localizedHref(href)}
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-xl px-4 py-3 transition hover:bg-[#eefafa] hover:text-[#079ca5]"
            >
              {label}
            </Link>
          ))}

          {user && (
            <>
              <div className="my-2 border-t border-slate-100" />
              <Link href={localizedHref("/profil")} onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-3 hover:bg-slate-50">
                {copy.profile}
              </Link>
              <Link href={localizedHref("/favorites")} onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-3 hover:bg-slate-50">
                {copy.favorites}
              </Link>
              {(profile?.role === "admin" || profile?.role === "editor") && (
                <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-[#079ca5] hover:bg-[#eefafa]">
                  Admin-CMS
                </Link>
              )}
              <button
                type="button"
                onClick={() => supabase.auth.signOut()}
                className="rounded-xl px-4 py-3 text-left text-red-600 hover:bg-red-50"
              >
                {copy.logout}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
