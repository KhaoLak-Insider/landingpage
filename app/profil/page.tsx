"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProfilPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Fehler beim Laden des Profils:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      // Der Pfad entspricht exakt deiner Policy: UserID/Dateiname
      const filePath = `${profile.id}/${Math.random()}.${fileExt}`;

      let { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Öffentliche URL holen
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      
      // Profil in der DB aktualisieren
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", profile.id);

      if (updateError) throw updateError;
      
      fetchProfile(); // Daten neu laden
    } catch (error) {
      alert("Fehler beim Hochladen des Bildes!");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Lade Profil...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-3xl shadow-lg border border-slate-100">
      <h2 className="text-2xl font-black mb-6">Dein Profil</h2>
      
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden mb-4 border border-slate-300 flex items-center justify-center">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-slate-500">
              {profile?.first_name?.[0] || profile?.username?.[0] || "?"}
            </span>
          )}
        </div>
        
        <label className="cursor-pointer bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-slate-800 transition">
          {uploading ? "Wird hochgeladen..." : "Bild ändern"}
          <input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} />
        </label>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Benutzername</label>
          <p className="font-semibold text-slate-900 text-lg">{profile?.username}</p>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vorname</label>
          <p className="font-semibold text-slate-900 text-lg">{profile?.first_name || "Nicht angegeben"}</p>
        </div>
      </div>
    </div>
  );
}