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
          .select("username, first_name, avatar_url")
          .eq("id", user.id)
          .single();
        setProfile(profile);
      }
    };

    fetchUserData();

    // Realtime-Abonnement für Profil-Änderungen
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles' 
      }, (payload) => {
        // Wenn das Update den aktuellen User betrifft, Daten neu laden
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
        setProfile(null);
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
        </div>
      </div>

      <div className="flex-grow" />

      {user ? (
        <div className="flex items-center gap-4">
          <Link href="/profil" className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-900">
              {profile?.username || "Profil"}
            </span>
            {/* Avatar Anzeige */}
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
          </Link>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-sm font-bold text-slate-500 hover:text-red-500 ml-4"
          >
            Logout
          </button>
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