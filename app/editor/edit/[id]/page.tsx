"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import ImageUpload from "@/src/components/ImageUpload";
import GalleryUpload from "@/src/components/GalleryUpload";
import { iconNames, iconMap } from "@/src/components/IconLibrary";
import { MapPin } from "lucide-react";

// HELPER: Text zu JSON konvertieren
function convertTextToJson(text: string) {
  if (!text) return [];
  const lines = text.split('\n').filter(line => line.trim() !== '');
  return lines.map(line => {
    // Erkennt ### am Anfang (mit oder ohne Leerzeichen)
    if (line.trim().startsWith('###')) {
      return { 
        type: 'heading', 
        content: line.trim().replace(/###\s*/, '') 
      };
    }
    return { type: 'paragraph', content: line.trim() };
  });
}

export default function EditSpotPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "", image_url: "", category: "", description: "", long_description: "",
    latitude: "", longitude: "", price_level: "", opening_hours: "", youtube_url: "",
    youtube_timestamp: "", tour_link: "", features: [{ label: "", value: "", icon: "Sparkles" as keyof typeof iconMap }],
    best_months: [] as number[], galleryUrlsText: "",
    parking_info: { name: "", price: "", details: "", lat: "", lng: "" },
  });
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // Kategorien laden
      const { data: catData } = await supabase.from("categories").select("name");
      if (catData) setCategories(catData.map(item => item.name));

      // Spot Daten laden
      if (id) {
        const { data } = await supabase.from("spots").select("*").eq("id", id).single();
        if (data) {
          let textDesc = "";
          if (Array.isArray(data.long_description)) {
            textDesc = data.long_description.map((b: any) => 
              b.type === 'heading' ? `### ${b.content}` : b.content
            ).join('\n\n');
          } else {
            textDesc = data.long_description || "";
          }

          setFormData({
            title: data.title || "",
            image_url: data.image_url || "",
            category: data.category || "",
            description: data.description || "",
            long_description: textDesc,
            latitude: data.latitude?.toString() || "",
            longitude: data.longitude?.toString() || "",
            price_level: data.price_level || "",
            opening_hours: data.opening_hours || "",
            youtube_url: data.youtube_url || "",
            youtube_timestamp: data.youtube_timestamp?.toString() || "",
            tour_link: data.tour_link || "",
            features: data.details_config?.features || [{ label: "", value: "", icon: "Sparkles" }],
            best_months: data.best_months || [],
            galleryUrlsText: data.gallery_urls?.join("\n") || "",
            parking_info: data.parking_info || { name: "", price: "", details: "", lat: "", lng: "" },
          });
        }
      }
    }
    fetchData();
  }, [id]);

  const toggleMonth = (monthIndex: number) => {
    setFormData(prev => ({
      ...prev,
      best_months: prev.best_months.includes(monthIndex)
        ? prev.best_months.filter(m => m !== monthIndex)
        : [...prev.best_months, monthIndex].sort((a, b) => a - b)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const jsonDescription = convertTextToJson(formData.long_description);
    
    const toNum = (val: string) => (val && val.trim() !== "" ? parseFloat(val) : null);
    const toIntForce = (val: string) => (val && val.trim() !== "" ? parseInt(val) : 0);

    const updatePayload = {
      title: formData.title || null,
      image_url: formData.image_url || null,
      slug: slug,
      category: formData.category || null,
      description: formData.description || null,
      long_description: jsonDescription,
      parking_info: formData.parking_info || null,
      latitude: toNum(formData.latitude),
      longitude: toNum(formData.longitude),
      price_level: formData.price_level || null,
      opening_hours: formData.opening_hours || null,
      youtube_url: formData.youtube_url && formData.youtube_url.trim() !== "" ? formData.youtube_url : null,
      youtube_timestamp: toIntForce(formData.youtube_timestamp),
      tour_link: formData.tour_link || null,
      best_months: formData.best_months || [],
      details_config: { features: formData.features.filter(f => f.label !== "") },
      gallery_urls: formData.galleryUrlsText ? formData.galleryUrlsText.split("\n").filter(u => u.trim() !== "") : [],
    };

    const { error } = await supabase.from("spots").update(updatePayload).eq("id", id);

    setLoading(false);
    if (error) {
      console.error("Supabase Error Details:", error);
      alert("Fehler bei der Übertragung: " + error.message);
    } else { 
      alert("Spot erfolgreich aktualisiert!"); 
      router.push("/editor/list"); 
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Spot bearbeiten</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 pb-24">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Basis-Informationen</h2>
          <input className="w-full p-4 border rounded-xl" placeholder="Titel des Spots" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          <ImageUpload slug={formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || "temp"} onUpload={(url) => setFormData({...formData, image_url: url})} />
          <div className="grid grid-cols-2 gap-4">
              <input className="w-full p-3 border rounded-xl" placeholder="YouTube URL" value={formData.youtube_url} onChange={(e) => setFormData({...formData, youtube_url: e.target.value})} />
              <input className="w-full p-3 border rounded-xl" placeholder="Startzeit (Sekunden)" type="number" value={formData.youtube_timestamp} onChange={(e) => setFormData({...formData, youtube_timestamp: e.target.value})} />
          </div>
          <input className="w-full p-3 border rounded-xl" placeholder="GetYourGuide Tour-Link" value={formData.tour_link} onChange={(e) => setFormData({...formData, tour_link: e.target.value})} />
          <div>
            <label className="block text-sm font-bold mb-3 text-slate-700">Kategorie:</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <label key={cat} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${formData.category === cat ? "bg-teal-50 border-teal-500 text-teal-700" : "hover:bg-slate-50"}`}>
                  <input type="radio" value={cat} checked={formData.category === cat} onChange={(e) => setFormData({...formData, category: e.target.value})} className="mr-2" /> {cat}
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Parkplatz-Informationen</h2>
          <input className="w-full p-4 border rounded-xl" placeholder="Name/Ort des Parkplatzes" value={formData.parking_info.name} onChange={(e) => setFormData({...formData, parking_info: {...formData.parking_info, name: e.target.value}})} />
          <div className="grid grid-cols-2 gap-4">
            <input className="w-full p-3 border rounded-xl" placeholder="Gebühr" value={formData.parking_info.price} onChange={(e) => setFormData({...formData, parking_info: {...formData.parking_info, price: e.target.value}})} />
            <input className="w-full p-3 border rounded-xl" placeholder="Details" value={formData.parking_info.details} onChange={(e) => setFormData({...formData, parking_info: {...formData.parking_info, details: e.target.value}})} />
            <input className="w-full p-3 border rounded-xl" placeholder="Breitengrad" value={formData.parking_info.lat} onChange={(e) => setFormData({...formData, parking_info: {...formData.parking_info, lat: e.target.value}})} />
            <input className="w-full p-3 border rounded-xl" placeholder="Längengrad" value={formData.parking_info.lng} onChange={(e) => setFormData({...formData, parking_info: {...formData.parking_info, lng: e.target.value}})} />
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Beschreibungen</h2>
          <textarea className="w-full p-4 border rounded-xl" placeholder="Kurze Beschreibung" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          <textarea className="w-full p-4 border rounded-xl" rows={4} placeholder="Lange Beschreibung (### für Überschriften)" value={formData.long_description} onChange={(e) => setFormData({...formData, long_description: e.target.value})} />
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-4">Beste Reisezeit</h2>
          <div className="grid grid-cols-6 gap-2">
            {["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"].map((monat, index) => (
              <button key={monat} type="button" onClick={() => toggleMonth(index)} 
                className={`p-3 rounded-lg text-sm font-bold transition-all ${formData.best_months.includes(index) ? "bg-teal-500 text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                {monat}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Features & Koordinaten</h2>
          <div className="grid grid-cols-2 gap-4">
            <input className="w-full p-3 border rounded-xl" placeholder="Breitengrad" value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: e.target.value})} />
            <input className="w-full p-3 border rounded-xl" placeholder="Längengrad" value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Features hinzufügen:</label>
            {formData.features.map((f, i) => {
               const IconComponent = iconMap[f.icon] || iconMap["MapPin"];
               return (
                 <div key={i} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl">
                    <input className="p-2 border rounded-lg w-1/4" placeholder="Label" value={f.label} onChange={(e) => { const n = [...formData.features]; n[i].label = e.target.value; setFormData({...formData, features: n}); }} />
                    <input className="p-2 border rounded-lg w-1/4" placeholder="Wert" value={f.value} onChange={(e) => { const n = [...formData.features]; n[i].value = e.target.value; setFormData({...formData, features: n}); }} />
                    <div className="flex items-center gap-2 w-1/2">
                      <div className="p-2 bg-white border rounded-lg shrink-0"><IconComponent size={20} className="text-teal-600" /></div>
                      <select className="p-2 border rounded-lg w-full bg-white text-sm truncate" value={f.icon} onChange={(e) => { const n = [...formData.features]; n[i].icon = e.target.value as keyof typeof iconMap; setFormData({...formData, features: n}); }}>
                        {iconNames.map(name => <option key={name} value={name}>{name}</option>)}
                      </select>
                   </div>
                 </div>
               );
            })}
            <button type="button" onClick={() => setFormData({...formData, features: [...formData.features, {label: "", value: "", icon: "Sparkles"}]})} className="text-teal-600 text-sm font-bold hover:underline">+ Feature hinzufügen</button>
          </div>
        </section>

        <GalleryUpload slug={formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || "temp"} onUpload={(urls) => setFormData(prev => ({...prev, galleryUrlsText: prev.galleryUrlsText ? prev.galleryUrlsText + "\n" + urls.join("\n") : urls.join("\n")}))} />
        <textarea className="w-full p-3 border rounded-xl font-mono text-xs" value={formData.galleryUrlsText} onChange={(e) => setFormData({...formData, galleryUrlsText: e.target.value})} placeholder="Galerie-URLs..." rows={3} />

        <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 shadow-lg z-50">
          <div className="max-w-4xl mx-auto flex justify-end gap-4">
             <button type="button" onClick={() => setShowPreview(true)} className="bg-slate-100 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all">Vorschau</button>
             <button disabled={loading} type="submit" className="bg-teal-500 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:bg-teal-600 transition-all shadow-xl shadow-teal-500/20">
               {loading ? "Wird gespeichert..." : "Änderungen speichern"}
             </button>
          </div>
        </div>
      </form>
    </div>
  );
}