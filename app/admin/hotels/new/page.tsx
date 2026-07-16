"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Check,
  Languages,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { supabase } from "@/src/lib/supabase";
import ImageUpload from "@/src/components/ImageUpload";
import GalleryUpload from "@/src/components/GalleryUpload";
import { translateTexts } from "@/src/lib/admin/deepl";
import WebsiteRoomImporter, {
  type ImportedRoomCandidate,
} from "./components/WebsiteRoomImporter";

type ContentStatus = "draft" | "published" | "archived";

type ImportedRoomSelection = ImportedRoomCandidate & {
  selected: boolean;
};

type FormState = {
  title: string;
  title_en: string;
  slug: string;
  description: string;
  description_en: string;
  long_description: string;
  long_description_en: string;
  hero_summary_de: string;
  hero_summary_en: string;
  editorial_summary_de: string;
  editorial_summary_en: string;
  seo_title: string;
  seo_title_en: string;
  seo_description: string;
  seo_description_en: string;
  image_url: string;
  gallery_urls: string[];
  latitude: string;
  longitude: string;
  address: string;
  website_url: string;
  opening_hours: string;
  stars: string;
  price_level: string;
  pool_count: string;
  room_count: string;
  restaurant_count: string;
  bar_count: string;
  suitable_for_families: boolean;
  adults_only: boolean;
  intro_features_de: string[];
  intro_features_en: string[];
  source_url: string;
  status: ContentStatus;
};

const initialForm: FormState = {
  title: "",
  title_en: "",
  slug: "",
  description: "",
  description_en: "",
  long_description: "",
  long_description_en: "",
  hero_summary_de: "",
  hero_summary_en: "",
  editorial_summary_de: "",
  editorial_summary_en: "",
  seo_title: "",
  seo_title_en: "",
  seo_description: "",
  seo_description_en: "",
  image_url: "",
  gallery_urls: [],
  latitude: "",
  longitude: "",
  address: "",
  website_url: "",
  opening_hours: "",
  stars: "",
  price_level: "",
  pool_count: "",
  room_count: "",
  restaurant_count: "",
  bar_count: "",
  suitable_for_families: true,
  adults_only: false,
  intro_features_de: ["", "", ""],
  intro_features_en: ["", "", ""],
  source_url: "",
  status: "draft",
};

function createSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function nullableText(value: string): string | null {
  const cleaned = value.trim();
  return cleaned ? cleaned : null;
}

function nullableNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}


function convertTextToJson(
  value: string,
): Array<{ type: "heading" | "paragraph"; content: string }> {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) =>
      line.startsWith("###")
        ? {
            type: "heading" as const,
            content: line.replace(/^###\s*/, ""),
          }
        : {
            type: "paragraph" as const,
            content: line,
          },
    );
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "Ein unbekannter Fehler ist aufgetreten.";
}

export default function NewPremiumHotelPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [googleQuery, setGoogleQuery] = useState("");
  const [importedRooms, setImportedRooms] = useState<
    ImportedRoomSelection[]
  >([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const resolvedSlug = useMemo(
    () => form.slug.trim() || createSlug(form.title),
    [form.slug, form.title],
  );

  function updateField<K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function importGooglePlace() {
    if (!googleQuery.trim()) return;
    setIsImporting(true);
    setFeedback(null);

    try {
      const searchResponse = await fetch(
        `/api/places?input=${encodeURIComponent(googleQuery.trim())}`,
      );
      const searchData = await searchResponse.json();
      const placeId = searchData.candidates?.[0]?.place_id;
      if (!placeId) throw new Error("Kein passendes Hotel gefunden.");

      const detailsResponse = await fetch(
        `/api/place-details?place_id=${encodeURIComponent(placeId)}`,
      );
      const detailsData = await detailsResponse.json();
      const place = detailsData.result;
      if (!place) throw new Error("Hoteldetails konnten nicht geladen werden.");

      const photoReference = place.photos?.[0]?.photo_reference;
      const googlePhoto = photoReference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${encodeURIComponent(photoReference)}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || ""}`
        : "";

      setForm((current) => ({
        ...current,
        title: place.name || current.title,
        slug: current.slug || createSlug(place.name || current.title),
        image_url: place.photo_url || googlePhoto || current.image_url,
        latitude:
          place.geometry?.location?.lat != null
            ? String(place.geometry.location.lat)
            : current.latitude,
        longitude:
          place.geometry?.location?.lng != null
            ? String(place.geometry.location.lng)
            : current.longitude,
        address: place.formatted_address || current.address,
        website_url: place.website || current.website_url,
        source_url: place.website || place.url || current.source_url,
        opening_hours:
          place.opening_hours?.weekday_text?.join("\n") ||
          current.opening_hours,
        price_level:
          place.price_level != null
            ? String(place.price_level)
            : current.price_level,
        stars: current.stars,
      }));

      setFeedback({
        type: "success",
        message: "Google-Places-Daten wurden übernommen. Bitte prüfen.",
      });
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsImporting(false);
    }
  }

  async function generateHotelTexts() {
    if (!form.title.trim()) {
      setFeedback({
        type: "error",
        message: "Bitte zuerst den Hotelnamen eintragen.",
      });
      return;
    }

    setIsGenerating(true);
    setFeedback(null);

    const baseSpotData = {
      title: form.title,
      category: "Unterkunft",
      template: "premium-hotel",
      address: form.address,
      stars: form.stars,
      price_level: form.price_level,
      pool_count: form.pool_count,
      room_count: form.room_count,
      restaurant_count: form.restaurant_count,
      bar_count: form.bar_count,
      suitable_for_families: form.suitable_for_families,
      adults_only: form.adults_only,
    };

    async function requestHotelText(promptContext: string) {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotData: {
            ...baseSpotData,
            prompt_context: promptContext,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "KI-Texte konnten nicht erstellt werden.",
        );
      }

      return data;
    }

    try {
      const [heroData, shortData, longData] = await Promise.all([
        requestHotelText(
          "Erstelle ausschließlich eine sehr kurze, hochwertige Hero-Beschreibung auf Deutsch. Maximal zwei kurze Sätze und ungefähr 180 bis 260 Zeichen. Nenne Lage, Atmosphäre und die wichtigsten Eigenschaften. Keine unbelegten Superlative. Gib den Text bevorzugt als hero_summary_de oder description zurück.",
        ),
        requestHotelText(
          "Erstelle eine sachliche Kurzbeschreibung auf Deutsch für den Abschnitt Über das Hotel. Ungefähr 80 bis 130 Wörter. Beschreibe Lage, Atmosphäre, Zielgruppen und die wichtigsten Einrichtungen. Keine unbelegten Superlative. Gib den Text als description zurück.",
        ),
        requestHotelText(
          "Erstelle eine ausführliche redaktionelle Langbeschreibung auf Deutsch für eine hochwertige Premium-Hotelseite. Ungefähr 250 bis 450 Wörter. Nutze klare Absätze und bei Bedarf Überschriften mit ###. Behandle Lage, Anlage, Zimmer, Pools, Gastronomie, Atmosphäre und geeignete Zielgruppen. Keine erfundenen Details oder unbelegten Superlative. Gib den Text als long_description zurück.",
        ),
      ]);

      const heroText =
        heroData.hero_summary_de ||
        heroData.hero_summary ||
        heroData.description ||
        "";

      const shortText =
        shortData.description ||
        shortData.hero_summary_de ||
        "";

      const longText =
        longData.long_description ||
        longData.description ||
        "";

      setForm((current) => ({
        ...current,
        hero_summary_de: heroText || current.hero_summary_de,
        description: shortText || current.description,
        long_description: longText || current.long_description,
        editorial_summary_de:
          longData.editorial_summary_de ||
          shortData.editorial_summary_de ||
          current.editorial_summary_de,
        seo_title:
          shortData.seo_title ||
          heroData.seo_title ||
          current.seo_title,
        seo_description:
          shortData.seo_description ||
          heroData.seo_description ||
          current.seo_description,
        intro_features_de:
          Array.isArray(shortData.intro_features_de) &&
          shortData.intro_features_de.length > 0
            ? shortData.intro_features_de.slice(0, 3)
            : Array.isArray(heroData.intro_features_de) &&
                heroData.intro_features_de.length > 0
              ? heroData.intro_features_de.slice(0, 3)
              : current.intro_features_de,
      }));

      setFeedback({
        type: "success",
        message:
          "Hero-Kurzbeschreibung, Kurzbeschreibung und Langbeschreibung wurden auf Deutsch erstellt.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function translateToEnglish() {
    setIsTranslating(true);
    setFeedback(null);

    try {
      const fields = [
        ["title", "title_en"],
        ["description", "description_en"],
        ["long_description", "long_description_en"],
        ["hero_summary_de", "hero_summary_en"],
        ["editorial_summary_de", "editorial_summary_en"],
        ["seo_title", "seo_title_en"],
        ["seo_description", "seo_description_en"],
      ] as const;

      const pendingFields = fields.filter(([source]) => form[source].trim());
      const featureSources = form.intro_features_de
        .map((value, index) => ({ value: value.trim(), index }))
        .filter((item) => item.value);

      const translations = await translateTexts(
        [
          ...pendingFields.map(([source]) => form[source]),
          ...featureSources.map((item) => item.value),
        ],
        { sourceLang: "DE", targetLang: "EN-GB" },
      );

      setForm((current) => {
        const next = { ...current };
        pendingFields.forEach(([, target], index) => {
          next[target] = translations[index];
        });

        const translatedFeatures = [...current.intro_features_en];
        featureSources.forEach((feature, index) => {
          translatedFeatures[feature.index] =
            translations[pendingFields.length + index];
        });
        next.intro_features_en = translatedFeatures;
        return next;
      });

      setFeedback({
        type: "success",
        message: "Die englischen Texte wurden mit DeepL erstellt.",
      });
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsTranslating(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim() || !resolvedSlug) return;

    setIsSaving(true);
    setFeedback(null);
    let createdSpotId: string | null = null;

    try {
      const { data: duplicate, error: duplicateError } = await supabase
        .from("spots")
        .select("id")
        .eq("slug", resolvedSlug)
        .maybeSingle();

      if (duplicateError) throw duplicateError;
      if (duplicate) {
        throw new Error(`Der Slug „${resolvedSlug}“ existiert bereits.`);
      }

      const { data: spotData, error: spotError } = await supabase
        .from("spots")
        .insert({
          title: form.title.trim(),
          title_en: nullableText(form.title_en),
          slug: resolvedSlug,
          category: "Unterkunft",
          category_en: "Accommodation",
          template: "premium-hotel",
          description: nullableText(form.description),
          description_en: nullableText(form.description_en),
          long_description: form.long_description.trim()
            ? convertTextToJson(form.long_description)
            : [],
          long_description_en: form.long_description_en.trim()
            ? convertTextToJson(form.long_description_en)
            : [],
          seo_title: nullableText(form.seo_title),
          seo_title_en: nullableText(form.seo_title_en),
          seo_description: nullableText(form.seo_description),
          seo_description_en: nullableText(form.seo_description_en),
          image_url: nullableText(form.image_url),
          gallery_urls: form.gallery_urls.filter(Boolean),
          latitude: nullableNumber(form.latitude),
          longitude: nullableNumber(form.longitude),
          opening_hours: nullableText(form.opening_hours),
          stars: form.stars ? Number.parseInt(form.stars, 10) : null,
          price_level: nullableNumber(form.price_level),
          is_published: true,
          show_on_homepage: true,
          show_in_app: true,
        })
        .select("id")
        .single();

      if (spotError) throw spotError;
      createdSpotId = String(spotData.id);

      const galleryImages = form.gallery_urls
        .filter((url) => url.trim())
        .map((url, index) => ({
          id: crypto.randomUUID(),
          image_url: url.trim(),
          title_de: null,
          title_en: null,
          alt_de: null,
          alt_en: null,
          credit_name: null,
          credit_url: null,
          status: "draft",
          sort_order: index + 1,
          is_cover: index === 0,
          is_featured: index < 3,
        }));

      const { data: hotelData, error: hotelError } = await supabase
        .from("premium_hotels")
        .insert({
          spot_id: createdSpotId,
          status: form.status,
          hero_summary_de: nullableText(form.hero_summary_de),
          hero_summary_en: nullableText(form.hero_summary_en),
          intro_features_de: form.intro_features_de
            .map((value) => value.trim())
            .filter(Boolean),
          intro_features_en: form.intro_features_en
            .map((value) => value.trim())
            .filter(Boolean),
          pool_count: nullableNumber(form.pool_count),
          room_count:
            importedRooms.length > 0
              ? importedRooms.filter((room) => room.selected)
                  .length
              : nullableNumber(form.room_count),
          restaurant_count: nullableNumber(form.restaurant_count),
          bar_count: nullableNumber(form.bar_count),
          suitable_for_families: form.suitable_for_families,
          adults_only: form.adults_only,
          editorial_summary_de: nullableText(form.editorial_summary_de),
          editorial_summary_en: nullableText(form.editorial_summary_en),
          gallery_images: galleryImages,
          faq_items: [],
          source_url: nullableText(form.source_url),
          verified_at: null,
        })
        .select("id")
        .single();

      if (hotelError) throw hotelError;

      const selectedRooms = importedRooms.filter(
        (room) => room.selected && room.name_de.trim(),
      );

      if (selectedRooms.length > 0) {
        const { error: roomsError } = await supabase
          .from("premium_rooms")
          .insert(
            selectedRooms.map((room, index) => ({
              premium_hotel_id: hotelData.id,
              slug:
                room.slug ||
                createSlug(room.name_en || room.name_de),
              status: "draft",
              sort_order: index + 1,

              name_de: room.name_de.trim(),
              name_en: nullableText(room.name_en),

              short_description_de: nullableText(
                room.short_description_de,
              ),
              short_description_en: nullableText(
                room.short_description_en,
              ),
              description_de: nullableText(
                room.description_de,
              ),
              description_en: nullableText(
                room.description_en,
              ),

              size_sqm: room.size_sqm,
              max_adults: room.max_adults,
              max_children: room.max_children,
              max_occupancy: room.max_occupancy,

              bed_type_de: nullableText(room.bed_type_de),
              bed_type_en: nullableText(room.bed_type_en),
              view_de: nullableText(room.view_de),
              view_en: nullableText(room.view_en),
              bathroom_de: nullableText(room.bathroom_de),
              bathroom_en: nullableText(room.bathroom_en),

              cover_image_url: nullableText(
                room.cover_image_url,
              ),
              images: room.images,
              highlights_de: room.highlights_de,
              highlights_en: room.highlights_en,
              amenities_de: room.amenities_de,
              amenities_en: room.amenities_en,
            })),
          );

        if (roomsError) throw roomsError;
      }

      router.push(`/admin/hotels/${encodeURIComponent(createdSpotId)}`);
      router.refresh();
    } catch (error) {
      if (createdSpotId) {
        await supabase.from("spots").delete().eq("id", createdSpotId);
      }
      setFeedback({
        type: "error",
        message: `Hotel konnte nicht angelegt werden: ${getErrorMessage(error)}`,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="new-premium-hotel" onSubmit={handleSubmit}>
      <header className="new-premium-hotel__header">
        <div>
          <Link href="/admin/hotels">
            <ArrowLeft size={16} /> Zurück zu Hotels
          </Link>
          <span>Premium-Hotel</span>
          <h1>Neues Hotel anlegen</h1>
          <p>
            Basisdaten importieren, Texte erzeugen und danach direkt im
            vollständigen Hotel-Editor weiterarbeiten.
          </p>
        </div>
        <button type="submit" disabled={isSaving}>
          {isSaving ? <Loader2 size={16} /> : <Check size={16} />}
          {isSaving ? "Wird angelegt …" : "Premium-Hotel anlegen"}
        </button>
      </header>

      {feedback && (
        <div className={`feedback feedback--${feedback.type}`}>
          {feedback.type === "success" ? (
            <Check size={17} />
          ) : (
            <TriangleAlert size={17} />
          )}
          {feedback.message}
        </div>
      )}

      <section className="import-card">
        <div className="import-card__intro">
          <MapPin size={22} />
          <div>
            <strong>Google Places Import</strong>
            <p>Name, Adresse, Koordinaten, Website und Bild übernehmen.</p>
          </div>
        </div>
        <div className="import-card__form">
          <label>
            <Search size={16} />
            <input
              value={googleQuery}
              onChange={(event) => setGoogleQuery(event.target.value)}
              placeholder="z. B. Moracea by Khao Lak Resort"
            />
          </label>
          <button type="button" onClick={importGooglePlace} disabled={isImporting}>
            {isImporting ? <Loader2 size={15} /> : <Search size={15} />}
            Daten laden
          </button>
        </div>
      </section>

      <section className="action-row">
        <button type="button" onClick={generateHotelTexts} disabled={isGenerating}>
          {isGenerating ? <Loader2 size={16} /> : <Sparkles size={16} />}
          Hero, Kurz- und Langtext mit KI erstellen
        </button>
        <button type="button" onClick={translateToEnglish} disabled={isTranslating}>
          {isTranslating ? <Loader2 size={16} /> : <Languages size={16} />}
          Mit DeepL nach Englisch übersetzen
        </button>
      </section>

      <div className="layout">
        <main>
          <section className="card">
            <div className="card__header">
              <div><span>Grunddaten</span><h2>Hotelprofil</h2></div>
              <Building2 size={21} />
            </div>
            <div className="grid grid--two">
              <Field label="Hotelname Deutsch *">
                <input
                  value={form.title}
                  onChange={(event) => {
                    const title = event.target.value;
                    setForm((current) => ({
                      ...current,
                      title,
                      slug:
                        !current.slug || current.slug === createSlug(current.title)
                          ? createSlug(title)
                          : current.slug,
                    }));
                  }}
                  required
                />
              </Field>
              <Field label="Hotelname Englisch">
                <input value={form.title_en} onChange={(e) => updateField("title_en", e.target.value)} />
              </Field>
              <Field label="Slug *">
                <input value={resolvedSlug} onChange={(e) => updateField("slug", createSlug(e.target.value))} required />
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => updateField("status", e.target.value as ContentStatus)}>
                  <option value="draft">Entwurf</option>
                  <option value="published">Veröffentlicht</option>
                  <option value="archived">Archiviert</option>
                </select>
              </Field>
              <Field label="Adresse">
                <input value={form.address} onChange={(e) => updateField("address", e.target.value)} />
              </Field>
              <Field label="Offizielle Website">
                <input type="url" value={form.website_url} onChange={(e) => updateField("website_url", e.target.value)} />
              </Field>
              <Field label="Quellen-URL">
                <input type="url" value={form.source_url} onChange={(e) => updateField("source_url", e.target.value)} />
              </Field>
              <Field label="Öffnungszeiten / Rezeption">
                <textarea rows={4} value={form.opening_hours} onChange={(e) => updateField("opening_hours", e.target.value)} />
              </Field>
            </div>
          </section>

          <section className="card">
            <div className="card__header"><div><span>Beschreibung</span><h2>Texte</h2></div></div>
            <div className="grid grid--two">
              <TextField label="Hero-Kurzbeschreibung Deutsch" value={form.hero_summary_de} onChange={(value) => updateField("hero_summary_de", value)} rows={4} />
              <TextField label="Hero-Kurzbeschreibung Englisch" value={form.hero_summary_en} onChange={(value) => updateField("hero_summary_en", value)} rows={4} />
              <TextField label="Kurzbeschreibung Deutsch" value={form.description} onChange={(value) => updateField("description", value)} rows={6} />
              <TextField label="Kurzbeschreibung Englisch" value={form.description_en} onChange={(value) => updateField("description_en", value)} rows={6} />
              <TextField label="Langbeschreibung Deutsch" value={form.long_description} onChange={(value) => updateField("long_description", value)} rows={10} />
              <TextField label="Langbeschreibung Englisch" value={form.long_description_en} onChange={(value) => updateField("long_description_en", value)} rows={10} />
              <TextField label="Editorial Deutsch" value={form.editorial_summary_de} onChange={(value) => updateField("editorial_summary_de", value)} rows={7} />
              <TextField label="Editorial Englisch" value={form.editorial_summary_en} onChange={(value) => updateField("editorial_summary_en", value)} rows={7} />
            </div>
          </section>

          <section className="card">
            <div className="card__header"><div><span>Einleitung</span><h2>Drei Intro-Features</h2></div></div>
            <div className="feature-grid">
              {form.intro_features_de.map((feature, index) => (
                <div key={index}>
                  <Field label={`Feature ${index + 1} Deutsch`}>
                    <input value={feature} onChange={(e) => {
                      const values = [...form.intro_features_de];
                      values[index] = e.target.value;
                      updateField("intro_features_de", values);
                    }} />
                  </Field>
                  <Field label={`Feature ${index + 1} Englisch`}>
                    <input value={form.intro_features_en[index] || ""} onChange={(e) => {
                      const values = [...form.intro_features_en];
                      values[index] = e.target.value;
                      updateField("intro_features_en", values);
                    }} />
                  </Field>
                </div>
              ))}
            </div>
          </section>

          <WebsiteRoomImporter
            websiteUrl={form.website_url}
            rooms={importedRooms}
            onRoomsChange={setImportedRooms}
          />

          <section className="card">
            <div className="card__header"><div><span>SEO</span><h2>Suchmaschinen</h2></div></div>
            <div className="grid grid--two">
              <Field label="SEO-Titel Deutsch"><input value={form.seo_title} onChange={(e) => updateField("seo_title", e.target.value)} /></Field>
              <Field label="SEO-Titel Englisch"><input value={form.seo_title_en} onChange={(e) => updateField("seo_title_en", e.target.value)} /></Field>
              <TextField label="SEO-Beschreibung Deutsch" value={form.seo_description} onChange={(value) => updateField("seo_description", value)} rows={5} />
              <TextField label="SEO-Beschreibung Englisch" value={form.seo_description_en} onChange={(value) => updateField("seo_description_en", value)} rows={5} />
            </div>
          </section>

          <section className="card">
            <div className="card__header"><div><span>Medien</span><h2>Hauptbild und Galerie</h2></div></div>
            <ImageUpload slug={resolvedSlug || "temp-hotel"} onUpload={(url) => updateField("image_url", url)} />
            {form.image_url && <img className="cover" src={form.image_url} alt={form.title || "Hotelbild"} />}
            <div className="gallery-upload">
              <GalleryUpload slug={resolvedSlug || "temp-hotel"} onUpload={(urls) => updateField("gallery_urls", [...form.gallery_urls, ...urls])} />
              {form.gallery_urls.length > 0 && (
                <div className="gallery-grid">
                  {form.gallery_urls.map((url, index) => (
                    <article key={`${url}-${index}`}>
                      <img src={url} alt={`Galeriebild ${index + 1}`} />
                      <button type="button" onClick={() => updateField("gallery_urls", form.gallery_urls.filter((_, itemIndex) => itemIndex !== index))}>
                        Entfernen
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        <aside>
          <section className="sidecard">
            <span>Kennzahlen</span>
            <div className="side-grid">
              <Field label="Zimmer">
                <input
                  type="number"
                  min="0"
                  value={
                    importedRooms.length > 0
                      ? String(
                          importedRooms.filter(
                            (room) => room.selected,
                          ).length,
                        )
                      : form.room_count
                  }
                  onChange={(e) =>
                    updateField("room_count", e.target.value)
                  }
                />
              </Field>
              <Field label="Pools"><input type="number" min="0" value={form.pool_count} onChange={(e) => updateField("pool_count", e.target.value)} /></Field>
              <Field label="Restaurants"><input type="number" min="0" value={form.restaurant_count} onChange={(e) => updateField("restaurant_count", e.target.value)} /></Field>
              <Field label="Bars"><input type="number" min="0" value={form.bar_count} onChange={(e) => updateField("bar_count", e.target.value)} /></Field>
            </div>
          </section>

          <section className="sidecard">
            <span>Zielgruppe</span>
            <label className="check"><input type="checkbox" checked={form.suitable_for_families} onChange={(e) => updateField("suitable_for_families", e.target.checked)} />Familienfreundlich</label>
            <label className="check"><input type="checkbox" checked={form.adults_only} onChange={(e) => updateField("adults_only", e.target.checked)} />Adults Only</label>
          </section>

          <section className="sidecard">
            <span>Lage und Klassifizierung</span>
            <Field label="Breitengrad"><input type="number" step="any" value={form.latitude} onChange={(e) => updateField("latitude", e.target.value)} /></Field>
            <Field label="Längengrad"><input type="number" step="any" value={form.longitude} onChange={(e) => updateField("longitude", e.target.value)} /></Field>
            <Field label="Landeskategorie">
              <select
                value={form.stars}
                onChange={(event) => updateField("stars", event.target.value)}
              >
                <option value="">Keine Angabe</option>
                <option value="1">1 Stern</option>
                <option value="2">2 Sterne</option>
                <option value="3">3 Sterne</option>
                <option value="4">4 Sterne</option>
                <option value="5">5 Sterne</option>
              </select>
            </Field>
            <Field label="Preisniveau"><input type="number" min="0" max="5" value={form.price_level} onChange={(e) => updateField("price_level", e.target.value)} /></Field>
          </section>

          <button className="submit" type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 size={16} /> : <Check size={16} />}
            {isSaving ? "Wird angelegt …" : "Premium-Hotel anlegen"}
          </button>
        </aside>
      </div>

      <style jsx>{`
        .new-premium-hotel{max-width:1260px;margin:0 auto;color:#10233f}.new-premium-hotel__header{display:flex;align-items:flex-end;justify-content:space-between;gap:24px}.new-premium-hotel__header a{display:inline-flex;align-items:center;gap:6px;margin-bottom:18px;color:#718096;font-size:11px;font-weight:700;text-decoration:none}.new-premium-hotel__header>div>span,.card__header span,.sidecard>span{display:block;margin-bottom:6px;color:#079ca5;font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.new-premium-hotel__header h1{margin:0;font-size:clamp(30px,4vw,42px);letter-spacing:-.04em}.new-premium-hotel__header p{max-width:720px;margin:10px 0 0;color:#68778a;font-size:12px;line-height:1.7}.new-premium-hotel__header>button,.submit{display:inline-flex;min-height:43px;align-items:center;justify-content:center;gap:8px;padding:0 15px;border:0;border-radius:11px;background:#079ca5;color:#fff;font:inherit;font-size:10px;font-weight:800;cursor:pointer}.feedback{display:flex;align-items:center;gap:9px;margin-top:20px;padding:12px 14px;border-radius:12px;font-size:10px;font-weight:700}.feedback--success{border:1px solid #b8ead7;background:#ecfdf5;color:#087b58}.feedback--error{border:1px solid #fecaca;background:#fff1f2;color:#be123c}.import-card{display:grid;grid-template-columns:minmax(0,1fr) minmax(380px,.9fr);align-items:center;gap:20px;margin-top:24px;padding:18px;border:1px solid #cde8e9;border-radius:16px;background:linear-gradient(135deg,#f0fbfb,#fff)}.import-card__intro{display:flex;align-items:center;gap:12px;color:#078f96}.import-card__intro strong{color:#19334c;font-size:12px}.import-card__intro p{margin:4px 0 0;color:#718096;font-size:9px}.import-card__form{display:flex;gap:9px}.import-card__form label{display:flex;flex:1;align-items:center;gap:8px;padding:0 11px;border:1px solid #d7e4e7;border-radius:10px;background:#fff}.import-card__form input{height:40px;border:0!important}.import-card__form button,.action-row button{display:inline-flex;min-height:40px;align-items:center;justify-content:center;gap:7px;padding:0 13px;border:0;border-radius:10px;background:#079ca5;color:#fff;font:inherit;font-size:9px;font-weight:800;cursor:pointer}.action-row{display:flex;gap:10px;margin-top:14px}.action-row button:last-child{background:#173b60}.layout{display:grid;grid-template-columns:minmax(0,1fr) 270px;align-items:start;gap:22px;margin-top:22px}.layout main,.layout aside{display:flex;min-width:0;flex-direction:column;gap:18px}.layout aside{position:sticky;top:24px}.card,.sidecard{padding:21px;border:1px solid #e4eaee;border-radius:17px;background:#fff;box-shadow:0 9px 26px rgba(15,35,62,.035)}.card__header{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:19px;padding-bottom:16px;border-bottom:1px solid #edf1f3;color:#7b8798}.card__header h2{margin:0;font-size:19px}.grid{display:grid;gap:15px}.grid--two{grid-template-columns:repeat(2,minmax(0,1fr))}.new-premium-hotel label,.sidecard{display:flex;flex-direction:column;gap:7px}.new-premium-hotel label>span{color:#526174;font-size:9px;font-weight:750}.new-premium-hotel input,.new-premium-hotel textarea,.new-premium-hotel select{width:100%;border:1px solid #dfe6eb;border-radius:10px;outline:none;background:#fbfcfd;color:#1d2e45;font:inherit;font-size:10px}.new-premium-hotel input,.new-premium-hotel select{height:41px;padding:0 11px}.new-premium-hotel textarea{padding:11px;line-height:1.6;resize:vertical}.feature-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.feature-grid>div{display:flex;flex-direction:column;gap:11px;padding:13px;border:1px solid #e3e9ed;border-radius:13px;background:#fafcfc}.cover{display:block;width:100%;max-height:420px;margin-top:14px;border-radius:14px;object-fit:cover}.gallery-upload{margin-top:18px}.gallery-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:14px}.gallery-grid article{position:relative;overflow:hidden;aspect-ratio:4/3;border-radius:11px;background:#eef3f4}.gallery-grid article img{width:100%;height:100%;object-fit:cover}.gallery-grid article button{position:absolute;right:7px;bottom:7px;padding:6px 8px;border:0;border-radius:8px;background:rgba(190,18,60,.9);color:#fff;font:inherit;font-size:8px;font-weight:800}.side-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.check{display:flex!important;align-items:center;flex-direction:row!important;gap:9px!important;padding:10px;border:1px solid #e4eaee;border-radius:10px;background:#fafcfc;color:#435469;font-size:9px;font-weight:750}.check input{width:16px;height:16px;accent-color:#079ca5}.submit{width:100%}button:disabled{cursor:wait;opacity:.65}@media(max-width:980px){.layout{grid-template-columns:1fr}.layout aside{position:static;display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.new-premium-hotel__header{align-items:stretch;flex-direction:column}.new-premium-hotel__header>button{width:100%}.import-card{grid-template-columns:1fr}.import-card__form,.action-row{flex-direction:column}.grid--two,.feature-grid,.layout aside,.gallery-grid{grid-template-columns:1fr}}
      `}</style>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span>{label}</span>
      {children}
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <label>
      <span>{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
