"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, first_name, avatar_url, role")
          .eq("id", user.id)
          .single();
        setProfile(profile);
      }
    };

    fetchUserData();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles' 
      }, (payload) => {
        if (payload.new.id === user?.id || payload.new.id === profile?.id) {
          fetchUserData();
        }
      })
      .subscribe();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData();
      } else {
        profile && setProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [user?.id, profile?.id]);

  return (
    <nav className="relative z-50 flex items-center px-8 py-6 bg-white border-b border-slate-100 text-slate-900">
      <div className="flex items-center gap-12">
        <Link href="/">
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
          <Link href="/entdecken" className="hover:text-teal-500 transition">Entdecken</Link>
          <a href="#" className="hover:text-teal-500 transition">Planen</a>
          <a href="#" className="hover:text-teal-500 transition">Erleben</a>
          <Link href="/blog" className="hover:text-teal-500 transition">Blog</Link>
          <Link href="/community" className="hover:text-teal-500 transition">Community</Link>
        </div>
      </div>

      <div className="flex-grow" />

      {user ? (
        <div className="relative group flex items-center gap-2 cursor-pointer">
          <div className="flex items-center gap-2 pr-2">
            <span className="text-sm font-bold text-slate-900">
              {profile?.username || "Profil"}
            </span>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border border-slate-300">
              {profile?.avatar_url ? (
                <Image 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  width={40} 
                  height={40} 
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-xs font-bold text-slate-500">
                  {profile?.first_name?.[0] || user.email?.[0].toUpperCase()}
                </div>
              )}
            </div>
            <svg className="w-4 h-4 text-slate-500 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <div className="p-2">
              <Link href="/profil" className="block px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg">Profil</Link>
              <Link href="/favorites" className="block px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg">Favoriten</Link>
              
              {/* Sichtbarkeit nur für Admins/Editoren */}
              {(profile?.role === 'admin' || profile?.role === 'editor') && (
                <>
                  <div className="border-t border-slate-100 my-1"></div>
                  <Link href="/editor" className="block px-4 py-2 text-sm font-bold text-teal-600 hover:bg-teal-50 rounded-lg">
                    Spot einpflegen
                  </Link>
                  {/* NEU: Blogbeitrag erstellen */}
                  <Link href="/editor/blog" className="block px-4 py-2 text-sm font-bold text-teal-600 hover:bg-teal-50 rounded-lg">
                    Blogbeitrag schreiben
                  </Link>
                  <Link href="/editor/list" className="block px-4 py-2 text-sm font-bold text-teal-600 hover:bg-teal-50 rounded-lg">
                    Spots bearbeiten
                  </Link>
                </>
              )}

              <div className="border-t border-slate-100 my-1"></div>
              <button 
                onClick={() => supabase.auth.signOut()} 
                className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      ) : (
        <Link
          href="/login"
          className="rounded-full px-6 py-3 text-sm font-bold transition bg-slate-900 text-white hover:bg-slate-800"
        >
          Login
        </Link>
      )}
    </nav>
  );
}