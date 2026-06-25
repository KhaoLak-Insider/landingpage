"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProfilPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Hotel States
  const [hotels, setHotels] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isManual, setIsManual] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
    fetchHotels();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data, error } = await supabase
        .from("profiles")
        .select("*, hotels(name)")
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

  const fetchHotels = async () => {
    const { data } = await supabase.from("hotels").select("*").order("name");
    setHotels(data || []);
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}/${Math.random()}.${fileExt}`;

      let { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", profile.id);

      if (updateError) throw updateError;
      fetchProfile();
    } catch (error) {
      alert("Fehler beim Hochladen des Bildes!");
    } finally {
      setUploading(false);
    }
  };

  const updateHotel = async (hotelId: number | null, customData: any = null) => {
    const updatePayload = customData 
      ? { hotel_id: null, custom_hotel_name: customData.name, custom_hotel_lat: customData.lat, custom_hotel_lng: customData.lng }
      : { hotel_id: hotelId, custom_hotel_name: null, custom_hotel_lat: null, custom_hotel_lng: null };

    const { error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", profile.id);
    
    if (!error) {
      alert("Unterkunft erfolgreich gespeichert!");
      fetchProfile();
    } else {
      console.error(error);
      alert("Fehler beim Speichern");
    }
  };

  const clearHotel = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ hotel_id: null, custom_hotel_name: null, custom_hotel_lat: null, custom_hotel_lng: null })
      .eq("id", profile.id);
    
    if (!error) {
      alert("Unterkunft wurde entfernt!");
      fetchProfile();
    } else {
      console.error(error);
      alert("Fehler beim Entfernen");
    }
  };

  if (loading) return <div className="p-10 text-center">Lade Profil...</div>;

  const filteredHotels = searchTerm.length > 0 
    ? hotels.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase())) 
    : [];

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-3xl shadow-lg border border-slate-100">
      <h2 className="text-2xl font-black mb-6">Dein Profil</h2>
      
      {/* AVATAR BEREICH */}
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

      <div className="space-y-6">
        {/* BASISDATEN */}
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

        <hr className="border-slate-100" />

        {/* UNTERKUNFT BEREICH */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aktuelle Unterkunft</label>
          <div className="mt-2 mb-2 p-3 bg-slate-50 rounded-xl font-semibold text-slate-700 flex justify-between items-center">
            <span>{profile?.hotels?.name || profile?.custom_hotel_name || "Keine Unterkunft gewählt"}</span>
            
            {(profile?.hotel_id || profile?.custom_hotel_name) && (
              <button 
                onClick={clearHotel}
                className="text-red-500 text-xs font-bold hover:text-red-700"
              >
                Löschen
              </button>
            )}
          </div>

          <input 
            className="w-full p-3 border rounded-xl mb-2 text-sm"
            placeholder="Unterkunft suchen..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <div className="max-h-40 overflow-y-auto border rounded-xl mb-2">
            {filteredHotels.map(hotel => (
              <button 
                key={hotel.id}
                onClick={() => updateHotel(hotel.id)}
                className="w-full text-left p-3 hover:bg-slate-50 text-sm border-b last:border-0"
              >
                {hotel.name}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsManual(!isManual)}
            className="text-xs text-teal-600 font-bold hover:underline"
          >
            {isManual ? "Zurück zur Suche" : "Eigene Unterkunft eintragen?"}
          </button>

          {isManual && (
            <div className="mt-4 p-4 border rounded-xl space-y-2 bg-slate-50">
              <input placeholder="Name der Unterkunft" id="man_name" className="w-full p-2 border rounded text-sm" />
              <input placeholder="Breitengrad (lat)" id="man_lat" className="w-full p-2 border rounded text-sm" />
              <input placeholder="Längengrad (lng)" id="man_lng" className="w-full p-2 border rounded text-sm" />
              <button 
                onClick={() => {
                  const name = (document.getElementById("man_name") as HTMLInputElement).value;
                  const lat = parseFloat((document.getElementById("man_lat") as HTMLInputElement).value);
                  const lng = parseFloat((document.getElementById("man_lng") as HTMLInputElement).value);
                  updateHotel(null, { name, lat, lng });
                }}
                className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-bold"
              >
                Speichern
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}