"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import SpotImageManager from "@/src/components/editor/SpotImageManager";
import { iconNames, iconMap } from "@/src/components/IconLibrary";
import { ArrowLeft, ExternalLink, Languages, Save } from "lucide-react";
import { mergeSpotCategoryDetails } from "@/src/lib/spot-category-details";
import { translateTexts } from "@/src/lib/admin/deepl";
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
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; name_en: string | null; parent_id: string | null }>
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const [formData, setFormData] = useState({
    title: "", title_en: "", image_url: "", category: "", description: "", description_en: "", long_description: "", long_description_en: "",
    latitude: "", longitude: "", price_level: "", stars: "", opening_hours: "", youtube_url: "",
    youtube_timestamp: "", tour_link: "", booking_link: "", features: [{ label: "", label_en: "", value: "", value_en: "", icon: "Sparkles" as keyof typeof iconMap }],
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
      const selectedCategory = categories.find((item) => item.name === formData.category);
      const parentCategory = selectedCategory?.parent_id
        ? categories.find((item) => item.id === selectedCategory.parent_id)
        : null;
      const res = await fetch("/api/generate-description", {
        method: "POST",
        body: JSON.stringify({
          spotData: {
            ...formData,
            category_family: parentCategory?.name || selectedCategory?.name || formData.category,
          },
        }),
      });
      const data = await res.json();
      setFormData(prev => ({
        ...prev,
        description: data.description || prev.description,
        long_description: data.long_description || prev.long_description,
        stars: data.stars || prev.stars,
        features: data.features && data.features.length > 0
          ? data.features.map((feature: { label?: string; value?: string; icon?: keyof typeof iconMap }) => ({
              label: feature.label || "", label_en: "", value: feature.value || "", value_en: "", icon: feature.icon || "Sparkles",
            }))
          : prev.features
      }));
    } catch { alert("Fehler bei der KI-Generierung"); }
    finally { setLoading(false); }
  };

  const translateToEnglish = async () => {
    const entries = [
      ["title_en", formData.title],
      ["description_en", formData.description],
      ["long_description_en", formData.long_description],
    ] as const;
    const availableEntries = entries.filter(([, value]) => value.trim());
    const featureEntries = formData.features.flatMap((feature, index) => [
      { index, field: "label_en" as const, value: feature.label },
      { index, field: "value_en" as const, value: feature.value },
    ]).filter((entry) => entry.value.trim());

    if (availableEntries.length === 0 && featureEntries.length === 0) {
      alert("Bitte zuerst deutsche Texte oder Insider-Fakten eingeben.");
      return;
    }

    setIsTranslating(true);
    try {
      const translations = await translateTexts(
        [
          ...availableEntries.map(([, value]) => value),
          ...featureEntries.map((entry) => entry.value),
        ],
        { sourceLang: "DE", targetLang: "EN-GB" },
      );
      setFormData((current) => {
        const next = { ...current };
        availableEntries.forEach(([field], index) => {
          next[field] = translations[index];
        });
        next.features = current.features.map((feature) => ({ ...feature }));
        featureEntries.forEach((entry, index) => {
          next.features[entry.index][entry.field] =
            translations[availableEntries.length + index];
        });
        return next;
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Die Übersetzung ist fehlgeschlagen.");
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      const { data: catData } = await supabase
        .from("categories")
        .select("id, name, name_en, parent_id")
        .eq("is_active", true)
        .order("sort_order")
        .order("name");
      if (catData) setCategories(catData);

      if (id) {
        const [{ data }, { data: categoryDetails }] = await Promise.all([
          supabase.from("spots").select("*").eq("id", id).single(),
          supabase
            .from("spot_category_details")
            .select("*")
            .eq("spot_id", id)
            .maybeSingle(),
        ]);
        if (data) {
          const resolvedData = mergeSpotCategoryDetails(data, categoryDetails);

          setFormData({
            title: resolvedData.title || "",
            title_en: resolvedData.title_en || "",
            image_url: resolvedData.image_url || "",
            category: resolvedData.category || "",
            description: resolvedData.description || "",
            description_en: resolvedData.description_en || "",
            long_description: convertDescriptionToText(resolvedData.long_description),
            long_description_en: convertDescriptionToText(resolvedData.long_description_en),
            latitude: resolvedData.latitude?.toString() || "",
            longitude: resolvedData.longitude?.toString() || "",
            price_level: resolvedData.price_level?.toString() || "",
            stars: resolvedData.stars?.toString() || "",
            opening_hours: resolvedData.opening_hours || "",
            youtube_url: resolvedData.youtube_url || "",
            youtube_timestamp: resolvedData.youtube_timestamp?.toString() || "",
            tour_link: resolvedData.tour_link || "",
            booking_link: resolvedData.booking_link || "",
            features: Array.isArray(resolvedData.details_config?.features)
              ? resolvedData.details_config.features.map((feature: Record<string, unknown>) => ({
                  label: typeof feature.label === "string" ? feature.label : "",
                  label_en: typeof feature.label_en === "string" ? feature.label_en : "",
                  value: typeof feature.value === "string" ? feature.value : "",
                  value_en: typeof feature.value_en === "string" ? feature.value_en : "",
                  icon: (typeof feature.icon === "string" ? feature.icon : "Sparkles") as keyof typeof iconMap,
                }))
              : [{ label: "", label_en: "", value: "", value_en: "", icon: "Sparkles" }],
            best_months: resolvedData.best_months || [],
            galleryUrlsText: resolvedData.gallery_urls?.join("\n") || "",
            parking_info: resolvedData.parking_info || { name: "", price: "", details: "", lat: "", lng: "" },
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
    const jsonDescriptionEn = convertTextToJson(formData.long_description_en);
    
    const toNum = (val: string) => (val && val.trim() !== "" ? parseFloat(val) : null);
    const toIntForce = (val: string) => (val && val.trim() !== "" ? parseInt(val) : 0);
    const categoryId = categories.find(
      (category) => category.name === formData.category,
    )?.id ?? null;
    const categoryEn = categories.find(
      (category) => category.name === formData.category,
    )?.name_en ?? null;

    const updatePayload = {
      title: formData.title || null,
      title_en: formData.title_en || null,
      image_url: formData.image_url || null,
      slug: slug,
      category: formData.category || null,
      category_en: categoryEn,
      category_id: categoryId,
      description: formData.description || null,
      description_en: formData.description_en || null,
      long_description: jsonDescription,
      long_description_en: jsonDescriptionEn,
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
          <div className="grid gap-4 md:grid-cols-2">
            <input className="w-full p-4 border rounded-xl" placeholder="Titel Deutsch" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            <input className="w-full p-4 border rounded-xl" placeholder="Titel Englisch" value={formData.title_en} onChange={(e) => setFormData({...formData, title_en: e.target.value})} />
          </div>
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
              {categories.map((category) => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
            <h2 className="text-lg font-bold text-slate-800">Beschreibungen</h2>
            <button type="button" onClick={translateToEnglish} disabled={isTranslating} className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-bold text-teal-700 hover:bg-teal-100 disabled:opacity-60">
              <Languages size={16} /> {isTranslating ? "DeepL übersetzt …" : "Texte & Insider-Fakten DE → EN"}
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <textarea className="w-full p-4 border rounded-xl" placeholder="Kurzbeschreibung Deutsch" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            <textarea className="w-full p-4 border rounded-xl" placeholder="Kurzbeschreibung Englisch" value={formData.description_en} onChange={(e) => setFormData({...formData, description_en: e.target.value})} />
            <textarea className="w-full p-4 border rounded-xl" rows={10} placeholder="Langbeschreibung Deutsch (### für Überschriften)" value={formData.long_description} onChange={(e) => setFormData({...formData, long_description: e.target.value})} />
            <textarea className="w-full p-4 border rounded-xl" rows={10} placeholder="Langbeschreibung Englisch (### für Überschriften)" value={formData.long_description_en} onChange={(e) => setFormData({...formData, long_description_en: e.target.value})} />
          </div>
          <button type="button" onClick={generateDescription} className="text-teal-600 font-bold hover:underline">
            {loading ? "Schreibe Text..." : "KI-Beschreibung auf Deutsch generieren"}
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
                 <div key={i} className="grid gap-2 items-center bg-slate-50 p-3 rounded-xl md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_1.1fr]">
                    <input className="p-2 border rounded-lg" placeholder="Label Deutsch" value={f.label} onChange={(e) => { const n = [...formData.features]; n[i].label = e.target.value; setFormData({...formData, features: n}); }} />
                    <input className="p-2 border rounded-lg" placeholder="Wert Deutsch" value={f.value} onChange={(e) => { const n = [...formData.features]; n[i].value = e.target.value; setFormData({...formData, features: n}); }} />
                    <input className="p-2 border rounded-lg" placeholder="Label Englisch" value={f.label_en} onChange={(e) => { const n = [...formData.features]; n[i].label_en = e.target.value; setFormData({...formData, features: n}); }} />
                    <input className="p-2 border rounded-lg" placeholder="Wert Englisch" value={f.value_en} onChange={(e) => { const n = [...formData.features]; n[i].value_en = e.target.value; setFormData({...formData, features: n}); }} />
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-white border rounded-lg shrink-0"><IconComponent size={20} className="text-teal-600" /></div>
                      <select className="p-2 border rounded-lg w-full bg-white text-sm truncate" value={f.icon} onChange={(e) => { const n = [...formData.features]; n[i].icon = e.target.value as keyof typeof iconMap; setFormData({...formData, features: n}); }}>
                        {iconNames.map(name => <option key={name} value={name}>{name}</option>)}
                      </select>
                   </div>
                 </div>
               );
            })}
            <button type="button" onClick={() => setFormData({...formData, features: [...formData.features, {label: "", label_en: "", value: "", value_en: "", icon: "Sparkles"}]})} className="text-teal-600 text-sm font-bold hover:underline">+ Feature hinzufügen</button>
          </div>
        </section>

        <SpotImageManager
          category={formData.category}
          slug={formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}
          heroUrl={formData.image_url}
          galleryUrls={formData.galleryUrlsText.split("\n").map((url) => url.trim()).filter(Boolean)}
          onHeroChange={(url) => setFormData((current) => ({ ...current, image_url: url }))}
          onGalleryChange={(urls) => setFormData((current) => ({ ...current, galleryUrlsText: urls.join("\n") }))}
        />

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

function convertDescriptionToText(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((block: unknown) => {
      const item = block as { type?: unknown; content?: unknown };
      const content = typeof item.content === "string" ? item.content : "";
      return item.type === "heading" ? `### ${content}` : content;
    }).filter(Boolean).join("\n\n");
  }
  return typeof value === "string" ? value : "";
}
