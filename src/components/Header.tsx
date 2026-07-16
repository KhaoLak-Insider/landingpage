"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import {
  getLanguage,
  Language,
} from "@/src/lib/i18n";
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

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdminPath =
    pathname === "/admin" || pathname.startsWith("/admin/");

  const language = getLanguage({
    lng: searchParams.get("lng") ?? undefined,
  });

  function changeLanguage(newLanguage: Language) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("lng", newLanguage);

    const queryString = params.toString();

    router.push(
      queryString
        ? `${pathname}?${queryString}`
        : pathname,
      {
        scroll: false,
      }
    );
  }

  function localizedHref(path: string) {
    const separator = path.includes("?") ? "&" : "?";

    return `${path}${separator}lng=${language}`;
  }

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
      className={`relative z-50 flex items-center border-b border-slate-100 bg-white px-8 py-6 text-slate-900 ${
        isAdminPath ? "min-[901px]:ml-[248px]" : ""
      }`}
    >
      <div className="flex items-center gap-12">
        <Link href={localizedHref("/")}>
          <Image
            src="https://pub-e91d905941ab460b95ac5248c28e16f3.r2.dev/assets/logo.png"
            alt="Khao Lak Insider"
            width={180}
            height={60}
            priority
            className="h-20 w-auto"
          />
        </Link>

        <div className="hidden gap-8 text-sm font-semibold md:flex text-slate-600">
          <Link
            href={localizedHref("/entdecken")}
            className="transition hover:text-teal-500"
          >
            Entdecken
          </Link>

          <Link
            href={localizedHref("/planen")}
            className="transition hover:text-teal-500"
          >
            Planen
          </Link>

          <a
            href="#"
            className="transition hover:text-teal-500"
          >
            Erleben
          </a>

          <Link
            href={localizedHref("/blog")}
            className="transition hover:text-teal-500"
          >
            Blog
          </Link>

          <Link
            href={localizedHref("/community")}
            className="transition hover:text-teal-500"
          >
            Community
          </Link>
        </div>
      </div>

      <div className="flex-grow" />

      <div className="flex items-center gap-5">
        <select
          value={language}
          onChange={(event) =>
            changeLanguage(
              event.target.value as Language
            )
          }
          aria-label="Sprache auswählen"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 outline-none transition hover:border-teal-400 focus:border-teal-500"
        >
          <option value="de">🇩🇪 Deutsch</option>
          <option value="en">🇬🇧 English</option>
        </select>

        {user ? (
          <div className="group relative flex cursor-pointer items-center gap-2">
            <div className="flex items-center gap-2 pr-2">
              <span className="text-sm font-bold text-slate-900">
                {profile?.username || "Profil"}
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
                className="h-4 w-4 text-slate-500 transition-transform group-hover:rotate-180"
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
                  Profil
                </Link>

                <Link
                  href={localizedHref("/favorites")}
                  className="block rounded-lg px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Favoriten
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
                  Abmelden
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Link
            href={localizedHref("/login")}
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
