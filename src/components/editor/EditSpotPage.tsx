"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import ImageUpload from "@/src/components/ImageUpload";
import GalleryUpload from "@/src/components/GalleryUpload";
import { iconNames, iconMap } from "@/src/components/IconLibrary";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import "./spot-editor.css";

// HELPER: Text zu JSON konvertieren
function convertTextToJson(text: string) {
  if (!text) return [];
  const lines = text.split('\n').filter(line => line.trim() !== '');
  return lines.map(line => {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "", image_url: "", category: "", description: "", long_description: "",
    latitude: "", longitude: "", price_level: "", stars: "", opening_hours: "", youtube_url: "",
    youtube_timestamp: "", tour_link: "", booking_link: "", features: [{ label: "", value: "", icon: "Sparkles" as keyof typeof iconMap }],
    best_months: [] as number[], galleryUrlsText: "",
    parking_info: { name: "", price: "", details: "", lat: "", lng: "" },
  });

  // GOOGLE PLACES IMPORT
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
          price_level: p.price_level?.toString() || prev.price_level,
          image_url: p.photos ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${p.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}` : prev.image_url
        }));
      }
    } catch (e) { console.error("Google Import Fehler:", e); }
  };

  // KI BESCHREIBUNG GENERIEREN
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
        long_description: data.long_description || prev.long_description,
        stars: data.stars || prev.stars,
        features: data.features && data.features.length > 0 ? data.features : prev.features
      }));
    } catch { alert("Fehler bei der KI-Generierung"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    async function fetchData() {
      const { data: catData } = await supabase.from("categories").select("name");
      if (catData) setCategories(catData.map(item => item.name));

      if (id) {
        const { data } = await supabase.from("spots").select("*").eq("id", id).single();
        if (data) {
          let textDesc = "";
          if (Array.isArray(data.long_description)) {
            textDesc = data.long_description.map((block: unknown) => {
              const value = block as { type?: unknown; content?: unknown };
              const content = typeof value.content === "string" ? value.content : "";
              return value.type === "heading" ? `### ${content}` : content;
            }).join('\n\n');
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
            price_level: data.price_level?.toString() || "",
            stars: data.stars?.toString() || "",
            opening_hours: data.opening_hours || "",
            youtube_url: data.youtube_url || "",
            youtube_timestamp: data.youtube_timestamp?.toString() || "",
            tour_link: data.tour_link || "",
            booking_link: data.booking_link || "",
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
      price_level: formData.price_level ? parseInt(formData.price_level) : null,
      stars: formData.stars ? parseInt(formData.stars) : null,
      opening_hours: formData.opening_hours || null,
      youtube_url: formData.youtube_url && formData.youtube_url.trim() !== "" ? formData.youtube_url : null,
      youtube_timestamp: toIntForce(formData.youtube_timestamp),
      tour_link: formData.tour_link || null,
      booking_link: formData.booking_link || null,
      best_months: formData.best_months || [],
      details_config: { features: formData.features.filter(f => f.label !== "") },
      gallery_urls: formData.galleryUrlsText ? formData.galleryUrlsText.split("\n").filter(u => u.trim() !== "") : [],
    };

    const { error } = await supabase.from("spots").update(updatePayload).eq("id", id);

    setLoading(false);
    if (error) { alert("Fehler bei der Übertragung: " + error.message); }
    else { alert("Spot erfolgreich aktualisiert!"); router.push(`/spot/${slug}`); }
  };

  return (
    <div className="admin-spot-editor">
      <header className="admin-spot-editor__header">
        <Link href="/admin/editor/list" className="admin-spot-editor__back">
          <ArrowLeft size={15} /> Zurück zu allen Spots
        </Link>
        <span className="admin-spot-editor__eyebrow">Content-Verwaltung</span>
        <h1>{formData.title || "Spot bearbeiten"}</h1>
        <p>Basisdaten, Inhalte, Medien und Standortinformationen verwalten.</p>
      </header>

      <form onSubmit={handleSubmit} className="admin-spot-editor__form">
        <section className="bg-teal-50 p-6 rounded-2xl border-2 border-teal-200">
          <h2 className="text-lg font-bold text-teal-800 mb-4">Google Places Import</h2>
          <div className="flex gap-2">
            <input className="flex-1 p-4 border rounded-xl" placeholder="Ort suchen..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button type="button" onClick={searchGooglePlace} className="bg-teal-500 text-white px-6 py-4 rounded-xl font-bold hover:bg-teal-600">Daten laden</button>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Basis-Informationen</h2>
          <input className="w-full p-4 border rounded-xl" placeholder="Titel des Spots" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          <ImageUpload slug={formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || "temp"} onUpload={(url) => setFormData({...formData, image_url: url})} />
          <div className="grid grid-cols-2 gap-4">
              <input className="w-full p-3 border rounded-xl" placeholder="YouTube URL" value={formData.youtube_url} onChange={(e) => setFormData({...formData, youtube_url: e.target.value})} />
              <input className="w-full p-3 border rounded-xl" placeholder="Startzeit (Sekunden)" type="number" value={formData.youtube_timestamp} onChange={(e) => setFormData({...formData, youtube_timestamp: e.target.value})} />
              <input className="w-full p-3 border rounded-xl" placeholder="Preis-Level" value={formData.price_level} onChange={(e) => setFormData({...formData, price_level: e.target.value})} />
              <input className="w-full p-3 border rounded-xl" placeholder="Sterne (0-5)" value={formData.stars} onChange={(e) => setFormData({...formData, stars: e.target.value})} />
              <input className="w-full p-3 border rounded-xl" placeholder="Öffnungszeiten" value={formData.opening_hours} onChange={(e) => setFormData({...formData, opening_hours: e.target.value})} />
          </div>
          <input className="w-full p-3 border rounded-xl" placeholder="GetYourGuide Tour-Link" value={formData.tour_link} onChange={(e) => setFormData({...formData, tour_link: e.target.value})} />
          <input className="w-full p-3 border rounded-xl" placeholder="Booking.com Affiliate-Link" value={formData.booking_link} onChange={(e) => setFormData({...formData, booking_link: e.target.value})} />
          <div>
            <label className="block text-sm font-bold mb-3 text-slate-700">Kategorie:</label>
            <select className="w-full p-3 border rounded-xl bg-white" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
              <option value="">Kategorie auswählen...</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
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

        <div className="admin-spot-editor__action-bar">
          <div className="admin-spot-editor__actions">
              <Link href={`/spot/${formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} target="_blank"><ExternalLink size={16} />Live-Ansicht</Link>
              <button disabled={loading} type="submit">
                <Save size={16} />
                {loading ? "Wird gespeichert ..." : "Änderungen speichern"}
              </button>
          </div>
        </div>
      </form>
    </div>
  );
}
