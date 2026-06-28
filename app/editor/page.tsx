"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabase";
import ImageUpload from "@/src/components/ImageUpload";
import GalleryUpload from "@/src/components/GalleryUpload";
import { iconNames, iconMap } from "@/src/components/IconLibrary";
import { MapPin } from "lucide-react"; 

// HELPER: Text zu JSON konvertieren
function convertTextToJson(text: string) {
  if (!text) return [];
  return text.split('\n').map(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('###')) {
      return { type: 'heading', content: trimmedLine.replace(/###\s*/, '') };
    }
    if (trimmedLine === '') return null;
    return { type: 'paragraph', content: trimmedLine };
  }).filter(block => block !== null);
}

export default function SpotEditorPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    title: "", image_url: "", category: "", description: "", long_description: "",
    latitude: "", longitude: "", price_level: "", opening_hours: "", youtube_url: "",
    youtube_timestamp: "", tour_link: "", booking_link: "",
    features: [{ label: "", value: "", icon: "Sparkles" as keyof typeof iconMap }],
    best_months: [] as number[],
    galleryUrlsText: "",
    parking_info: { name: "", price: "", details: "", lat: "", lng: "" },
  });
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // ANGEPASSTE FUNKTION: Google Places Suche via Proxy
  const searchGooglePlace = async () => {
    if (!searchQuery) return;
    try {
      const searchRes = await fetch(`/api/places?input=${encodeURIComponent(searchQuery)}`);
      const searchData = await searchRes.json();
      const placeId = searchData.candidates?.[0]?.place_id;

      if (placeId) {
        const detailsRes = await fetch(`/api/place-details?place_id=${placeId}`);
        const detailsData = await detailsRes.json();
        const p = detailsData.result;

        setFormData(prev => ({
          ...prev,
          title: p.name || prev.title,
          latitude: p.geometry?.location?.lat?.toString() || prev.latitude,
          longitude: p.geometry?.location?.lng?.toString() || prev.longitude,
          description: p.formatted_address || prev.description,
          opening_hours: p.opening_hours?.weekday_text?.join('\n') || prev.opening_hours,
          image_url: p.photos ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${p.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}` : prev.image_url
        }));
      }
    } catch (e) { console.error("Google Import Fehler:", e); }
  };

  // NEUE FUNKTION: KI Beschreibung generieren
  const generateDescription = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-description", {
        method: "POST",
        body: JSON.stringify({ spotData: formData }),
      });
      const data = await res.json();
      
      setFormData(prev => ({
        ...prev,
        description: data.description || prev.description,
        long_description: data.long_description || prev.long_description
      }));
    } catch (e) {
      alert("Fehler bei der KI-Generierung");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from("categories").select("name");
      if (data) setCategories(data.map(item => item.name));
    }
    fetchCategories();
  }, []);

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

    const { error } = await supabase.from("spots").insert([{
      title: formData.title, image_url: formData.image_url, slug: slug,
      category: formData.category, description: formData.description,
      long_description: jsonDescription,
      parking_info: formData.parking_info,
      latitude: parseFloat(formData.latitude) || null,
      longitude: parseFloat(formData.longitude) || null,
      price_level: formData.price_level, opening_hours: formData.opening_hours,
      youtube_url: formData.youtube_url,
      youtube_timestamp: formData.youtube_timestamp,
      tour_link: formData.tour_link,
      booking_link: formData.booking_link,
      best_months: formData.best_months,
      details_config: { features: formData.features.filter(f => f.label !== "") },
      gallery_urls: formData.galleryUrlsText.split("\n").filter(u => u.trim() !== ""),
      is_published: true
    }]);

    setLoading(false);
    if (error) alert("Fehler: " + error.message);
    else {
      alert("Spot erfolgreich angelegt!");
      setFormData({
        title: "", image_url: "", category: "", description: "", long_description: "",
        latitude: "", longitude: "", price_level: "", opening_hours: "", 
        youtube_url: "", youtube_timestamp: "", tour_link: "", booking_link: "",
        features: [{ label: "", value: "", icon: "Sparkles" }], 
        best_months: [], galleryUrlsText: "", parking_info: { name: "", price: "", details: "", lat: "", lng: "" }
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Neuen Spot anlegen</h1>
        <p className="text-slate-500">Erstelle einen neuen Ort für den Khao Lak Insider.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 pb-24">
        
        <section className="bg-teal-50 p-6 rounded-2xl border-2 border-teal-200">
          <h2 className="text-lg font-bold text-teal-800 mb-4">Google Places Import</h2>
          <div className="flex gap-2">
            <input className="flex-1 p-4 border rounded-xl" placeholder="Ort suchen (z.B. Big Buddha Phuket)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button type="button" onClick={searchGooglePlace} className="bg-teal-500 text-white px-6 py-4 rounded-xl font-bold hover:bg-teal-600">Daten laden</button>
          </div>
        </section>
        
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Basis-Informationen</h2>
          <input className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Titel des Spots" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          <ImageUpload slug={formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || "temp"} onUpload={(url) => setFormData({...formData, image_url: url})} />
          
          <div className="grid grid-cols-2 gap-4">
              <input className="w-full p-3 border rounded-xl" placeholder="YouTube URL" value={formData.youtube_url} onChange={(e) => setFormData({...formData, youtube_url: e.target.value})} />
              <input className="w-full p-3 border rounded-xl" placeholder="Startzeit (Sekunden)" value={formData.youtube_timestamp} onChange={(e) => setFormData({...formData, youtube_timestamp: e.target.value})} />
              <input className="w-full p-3 border rounded-xl" placeholder="Preis-Level" value={formData.price_level} onChange={(e) => setFormData({...formData, price_level: e.target.value})} />
              <input className="w-full p-3 border rounded-xl" placeholder="Öffnungszeiten" value={formData.opening_hours} onChange={(e) => setFormData({...formData, opening_hours: e.target.value})} />
          </div>
          <input className="w-full p-3 border rounded-xl" placeholder="GetYourGuide Tour-Link" value={formData.tour_link} onChange={(e) => setFormData({...formData, tour_link: e.target.value})} />
          <input className="w-full p-3 border rounded-xl" placeholder="Booking.com Affiliate-Link" value={formData.booking_link} onChange={(e) => setFormData({...formData, booking_link: e.target.value})} />

          <div>
            <label className="block text-sm font-bold mb-3 text-slate-700">Kategorie:</label>
            <select className="w-full p-4 border rounded-xl bg-white" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
              <option value="">Kategorie wählen...</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Parkplatz-Informationen</h2>
          <input className="w-full p-4 border rounded-xl" placeholder="Name/Ort des Parkplatzes" value={formData.parking_info.name} onChange={(e) => setFormData({...formData, parking_info: {...formData.parking_info, name: e.target.value}})} />
          <div className="grid grid-cols-2 gap-4">
            <input className="w-full p-3 border rounded-xl" placeholder="Gebühr (z.B. kostenlos)" value={formData.parking_info.price} onChange={(e) => setFormData({...formData, parking_info: {...formData.parking_info, price: e.target.value}})} />
            <input className="w-full p-3 border rounded-xl" placeholder="Weitere Details" value={formData.parking_info.details} onChange={(e) => setFormData({...formData, parking_info: {...formData.parking_info, details: e.target.value}})} />
            <input className="w-full p-3 border rounded-xl" placeholder="Parkplatz Breitengrad" value={formData.parking_info.lat} onChange={(e) => setFormData({...formData, parking_info: {...formData.parking_info, lat: e.target.value}})} />
            <input className="w-full p-3 border rounded-xl" placeholder="Parkplatz Längengrad" value={formData.parking_info.lng} onChange={(e) => setFormData({...formData, parking_info: {...formData.parking_info, lng: e.target.value}})} />
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Beschreibungen</h2>
          <textarea className="w-full p-4 border rounded-xl" placeholder="Kurze Beschreibung" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          <textarea className="w-full p-4 border rounded-xl" rows={4} placeholder="Lange Beschreibung (Nutze ### für Überschriften)" value={formData.long_description} onChange={(e) => setFormData({...formData, long_description: e.target.value})} />
          <button type="button" onClick={generateDescription} className="text-teal-600 font-bold hover:underline">
            {loading ? "Schreibe Text..." : "KI-Beschreibung generieren"}
          </button>
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
               const IconComponent = iconMap[f.icon];
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
                {loading ? "Wird gespeichert..." : "Spot veröffentlichen"}
              </button>
          </div>
        </div>
      </form>

      {showPreview && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl relative shadow-2xl">
            <button onClick={() => setShowPreview(false)} className="absolute top-4 right-4 z-50 p-2 bg-white/80 rounded-full hover:bg-slate-100">✕</button>
            <div className="relative w-full h-[300px] bg-slate-900">
              {formData.youtube_url ? (
                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${formData.youtube_url.split('v=')[1]?.split('&')[0]}?start=${formData.youtube_timestamp}`} allowFullScreen />
              ) : formData.image_url ? (
                <img src={formData.image_url} className="w-full h-full object-cover" />
              ) : <div className="w-full h-full bg-slate-200 flex items-center justify-center">Kein Bild</div>}
              <div className="absolute bottom-6 left-8 bg-[#14b8a6] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{formData.category || "Kategorie"}</div>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h1 className="text-4xl font-black mb-2">{formData.title || "Titel..."}</h1>
                <p className="text-lg text-slate-600 mb-8">{formData.description}</p>
                <div className="mb-8 text-slate-600">
                    {convertTextToJson(formData.long_description).map((block: any, i: number) => (
                      block.type === 'heading' 
                        ? <h3 key={i} className="text-xl font-bold mt-6 mb-3">{block.content}</h3>
                        : <p key={i} className="mb-4">{block.content}</p>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {formData.features.map((f, i) => f.label && (
                    <div key={i} className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl border">
                      {(() => { const Icon = iconMap[f.icon]; return Icon ? <Icon size={20} className="text-[#14b8a6]" /> : null; })()}
                      <div><div className="text-[10px] font-bold text-slate-400 uppercase">{f.label}</div><div className="text-sm font-bold">{f.value}</div></div>
                    </div>
                  ))}
                </div>
                {formData.best_months.length > 0 && (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Beste Reisezeit</h3>
                    <div className="grid grid-cols-6 gap-2">
                      {["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"].map((monat, index) => {
                        const isSelected = formData.best_months.includes(index);
                        return (<div key={monat} className={`p-2 rounded-lg text-xs font-bold text-center ${isSelected ? "bg-[#14b8a6] text-white" : "bg-white text-slate-300 border border-slate-200"}`}>{monat}</div>);
                      })}
                    </div>
                  </div>
                )}
                {formData.galleryUrlsText.trim() && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Galerie</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {formData.galleryUrlsText.split("\n").filter(u => u.trim() !== "").map((url, i) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden border"><img src={url} className="w-full h-full object-cover" /></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-slate-50 rounded-2xl border-2 border-dashed h-64 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                <MapPin size={40} className="mb-2 text-slate-300" />
                <p className="text-sm font-bold text-slate-500 mb-1">Vorschau für Karte</p>
                <p className="text-xs">Koordinaten: {formData.latitude || "0.00"}, {formData.longitude || "0.00"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}