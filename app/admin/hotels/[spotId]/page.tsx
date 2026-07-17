"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Loader2,
  Save,
  TriangleAlert,
} from "lucide-react";
import { supabase } from "@/src/lib/supabase";

import { emptyHotel, emptySpot } from "./constants";
import type {
  FeedbackState,
  HotelForm,
  SpotForm,
} from "./types";
import {
  cleanStringArray,
  getErrorMessage,
  normalizeDateTime,
  normalizeFaqItems,
  normalizeGalleryImages,
  normalizeStringArray,
  normalizeText,
  nullableNumber,
  nullableText,
  toIsoDateTime,
} from "./utils";

import HotelDistances from "./components/HotelDistances";
import HotelEditorial from "./components/HotelEditorial";
import HotelFaq from "./components/HotelFaq";
import HotelGallery from "./components/HotelGallery";
import HotelGeneral from "./components/HotelGeneral";
import HotelHighlights from "./components/HotelHighlights";
import HotelIntroFeatures from "./components/HotelIntroFeatures";
import HotelSeo from "./components/HotelSeo";
import HotelSidebar from "./components/HotelSidebar";
import HotelTranslationBar from "./components/HotelTranslationBar";
import HotelRooms, {
  type AdminRoomSummary,
} from "./components/HotelRooms";

import "./hotel-editor.css";

export default function AdminHotelEditorPage() {
  const params = useParams<{ spotId: string }>();

  const spotId = useMemo(
    () => decodeURIComponent(String(params?.spotId || "").trim()),
    [params],
  );

  const [spot, setSpot] = useState<SpotForm>(emptySpot);
  const [hotel, setHotel] = useState<HotelForm>(emptyHotel);
  const [rooms, setRooms] = useState<AdminRoomSummary[]>([]);
  const roomCount = rooms.length;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const loadEditor = useCallback(async () => {
    if (!spotId) {
      setLoadError("In der URL fehlt die Spot-ID.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    setFeedback(null);

    try {
      const { data: spotData, error: spotError } = await supabase
        .from("spots")
        .select(`
          id,
          slug,
          title,
          title_en,
          description,
          description_en,
          long_description,
          long_description_en,
          seo_title,
          seo_title_en,
          seo_description,
          seo_description_en,
          image_url
        `)
        .eq("id", spotId)
        .maybeSingle();

      if (spotError) throw spotError;
      if (!spotData) {
        throw new Error("Der zugehörige Spot wurde nicht gefunden.");
      }

      const { data: hotelData, error: hotelError } = await supabase
        .from("premium_hotels")
        .select(`
          id,
          spot_id,
          status,
          intro_features_de,
          intro_features_en,
          pool_count,
          room_count,
          restaurant_count,
          bar_count,
          suitable_for_families,
          adults_only,
          hero_summary_de,
          hero_summary_en,
          editorial_summary_de,
          editorial_summary_en,
          distance_bang_niang_market_m,
          distance_coconut_beach_m,
          distance_memories_beach_m,
          distance_nang_thong_center_m,
          distance_nearest_exchange_m,
          distance_phuket_airport_m,
          distance_nearest_7eleven_m,
          gallery_images,
          faq_items,
          source_url,
          verified_at
        `)
        .eq("spot_id", spotId)
        .maybeSingle();

      if (hotelError) throw hotelError;
      if (!hotelData) {
        throw new Error(
          "Für diesen Spot wurde kein Premium-Hotelprofil gefunden.",
        );
      }

      const { data: roomData, error: roomError } = await supabase
        .from("premium_rooms")
        .select(`
          id,
          slug,
          status,
          sort_order,
          name_de,
          name_en,
          short_description_de,
          size_sqm,
          max_occupancy,
          bed_type_de,
          view_de,
          cover_image_url
        `)
        .eq("premium_hotel_id", hotelData.id)
        .order("sort_order", { ascending: true })
        .order("name_de", { ascending: true });

      if (roomError) throw roomError;

      setSpot({
        id: String(spotData.id),
        slug: normalizeText(spotData.slug),
        title: normalizeText(spotData.title),
        title_en: normalizeText(spotData.title_en),
        description: normalizeText(spotData.description),
        description_en: normalizeText(spotData.description_en),
        long_description: normalizeText(spotData.long_description),
        long_description_en: normalizeText(spotData.long_description_en),
        seo_title: normalizeText(spotData.seo_title),
        seo_title_en: normalizeText(spotData.seo_title_en),
        seo_description: normalizeText(spotData.seo_description),
        seo_description_en: normalizeText(spotData.seo_description_en),
        image_url: normalizeText(spotData.image_url),
      });

      setHotel({
        id: String(hotelData.id),
        spot_id: String(hotelData.spot_id),
        status:
          hotelData.status === "published" ||
          hotelData.status === "archived"
            ? hotelData.status
            : "draft",

        intro_features_de: normalizeStringArray(
          hotelData.intro_features_de,
        ),
        intro_features_en: normalizeStringArray(
          hotelData.intro_features_en,
        ),

        pool_count:
          hotelData.pool_count === null
            ? ""
            : String(hotelData.pool_count),
        room_count:
          hotelData.room_count === null
            ? ""
            : String(hotelData.room_count),
        restaurant_count:
          hotelData.restaurant_count === null
            ? ""
            : String(hotelData.restaurant_count),
        bar_count:
          hotelData.bar_count === null
            ? ""
            : String(hotelData.bar_count),

        suitable_for_families: Boolean(
          hotelData.suitable_for_families,
        ),
        adults_only: Boolean(hotelData.adults_only),

        hero_summary_de: normalizeText(hotelData.hero_summary_de),
        hero_summary_en: normalizeText(hotelData.hero_summary_en),

        editorial_summary_de: normalizeText(
          hotelData.editorial_summary_de,
        ),
        editorial_summary_en: normalizeText(
          hotelData.editorial_summary_en,
        ),

        distance_bang_niang_market_m:
          hotelData.distance_bang_niang_market_m === null
            ? ""
            : String(hotelData.distance_bang_niang_market_m),
        distance_coconut_beach_m:
          hotelData.distance_coconut_beach_m === null
            ? ""
            : String(hotelData.distance_coconut_beach_m),
        distance_memories_beach_m:
          hotelData.distance_memories_beach_m === null
            ? ""
            : String(hotelData.distance_memories_beach_m),
        distance_nang_thong_center_m:
          hotelData.distance_nang_thong_center_m === null
            ? ""
            : String(hotelData.distance_nang_thong_center_m),
        distance_nearest_exchange_m:
          hotelData.distance_nearest_exchange_m === null
            ? ""
            : String(hotelData.distance_nearest_exchange_m),
        distance_phuket_airport_m:
          hotelData.distance_phuket_airport_m === null
            ? ""
            : String(hotelData.distance_phuket_airport_m),
        distance_nearest_7eleven_m:
          hotelData.distance_nearest_7eleven_m === null
            ? ""
            : String(hotelData.distance_nearest_7eleven_m),

        gallery_images: normalizeGalleryImages(
          hotelData.gallery_images,
        ),
        faq_items: normalizeFaqItems(hotelData.faq_items),

        source_url: normalizeText(hotelData.source_url),
        verified_at: normalizeDateTime(hotelData.verified_at),
      });

      setRooms(
        (roomData || []).map((room) => ({
          id: String(room.id),
          slug:
            typeof room.slug === "string" ? room.slug : null,
          status:
            room.status === "published" ||
            room.status === "archived"
              ? room.status
              : "draft",
          sort_order:
            typeof room.sort_order === "number"
              ? room.sort_order
              : null,
          name_de: normalizeText(room.name_de),
          name_en:
            typeof room.name_en === "string"
              ? room.name_en
              : null,
          short_description_de:
            typeof room.short_description_de === "string"
              ? room.short_description_de
              : null,
          size_sqm:
            typeof room.size_sqm === "number"
              ? room.size_sqm
              : null,
          max_occupancy:
            typeof room.max_occupancy === "number"
              ? room.max_occupancy
              : null,
          bed_type_de:
            typeof room.bed_type_de === "string"
              ? room.bed_type_de
              : null,
          view_de:
            typeof room.view_de === "string"
              ? room.view_de
              : null,
          cover_image_url:
            typeof room.cover_image_url === "string"
              ? room.cover_image_url
              : null,
        })),
      );
    } catch (error) {
      console.error("Fehler beim Laden des Hotel-Editors:", error);
      setLoadError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [spotId]);

  useEffect(() => {
    void loadEditor();
  }, [loadEditor]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!spot.id || !hotel.id) {
      setFeedback({
        type: "error",
        message: "Die Hotel-Daten sind noch nicht vollständig geladen.",
      });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const cleanedGallery = hotel.gallery_images
        .filter((image) => image.image_url.trim())
        .sort((a, b) => a.media_type === "video" ? -1 : b.media_type === "video" ? 1 : a.sort_order - b.sort_order)
        .map((image, index) => ({
          ...image,
          image_url: image.image_url.trim(),
          title_de: nullableText(image.title_de),
          title_en: nullableText(image.title_en),
          alt_de: nullableText(image.alt_de),
          alt_en: nullableText(image.alt_en),
          credit_name: nullableText(image.credit_name),
          credit_url: nullableText(image.credit_url),
          sort_order: index + 1,
        }));

      const cleanedFaq = hotel.faq_items
        .filter(
          (item) =>
            item.question_de.trim() ||
            item.question_en.trim() ||
            item.answer_de.trim() ||
            item.answer_en.trim(),
        )
        .map((item, index) => ({
          ...item,
          category: item.category.trim(),
          question_de: item.question_de.trim(),
          question_en: item.question_en.trim(),
          answer_de: item.answer_de.trim(),
          answer_en: item.answer_en.trim(),
          sort_order: index + 1,
        }));

      const { error: spotError } = await supabase
        .from("spots")
        .update({
          slug: spot.slug.trim(),
          title: spot.title.trim(),
          title_en: nullableText(spot.title_en),
          description: nullableText(spot.description),
          description_en: nullableText(spot.description_en),
          long_description: nullableText(spot.long_description),
          long_description_en: nullableText(
            spot.long_description_en,
          ),
          seo_title: nullableText(spot.seo_title),
          seo_title_en: nullableText(spot.seo_title_en),
          seo_description: nullableText(spot.seo_description),
          seo_description_en: nullableText(
            spot.seo_description_en,
          ),
          image_url: nullableText(spot.image_url),
        })
        .eq("id", spot.id);

      if (spotError) throw spotError;

      const { error: hotelError } = await supabase
        .from("premium_hotels")
        .update({
          status: hotel.status,

          intro_features_de: cleanStringArray(
            hotel.intro_features_de,
          ),
          intro_features_en: cleanStringArray(
            hotel.intro_features_en,
          ),

          pool_count: nullableNumber(hotel.pool_count),
          room_count: nullableNumber(hotel.room_count),
          restaurant_count: nullableNumber(
            hotel.restaurant_count,
          ),
          bar_count: nullableNumber(hotel.bar_count),

          suitable_for_families: hotel.suitable_for_families,
          adults_only: hotel.adults_only,

          hero_summary_de: nullableText(hotel.hero_summary_de),
          hero_summary_en: nullableText(hotel.hero_summary_en),

          editorial_summary_de: nullableText(
            hotel.editorial_summary_de,
          ),
          editorial_summary_en: nullableText(
            hotel.editorial_summary_en,
          ),

          distance_bang_niang_market_m: nullableNumber(
            hotel.distance_bang_niang_market_m,
          ),
          distance_coconut_beach_m: nullableNumber(
            hotel.distance_coconut_beach_m,
          ),
          distance_memories_beach_m: nullableNumber(
            hotel.distance_memories_beach_m,
          ),
          distance_nang_thong_center_m: nullableNumber(
            hotel.distance_nang_thong_center_m,
          ),
          distance_nearest_exchange_m: nullableNumber(
            hotel.distance_nearest_exchange_m,
          ),
          distance_phuket_airport_m: nullableNumber(
            hotel.distance_phuket_airport_m,
          ),
          distance_nearest_7eleven_m: nullableNumber(
            hotel.distance_nearest_7eleven_m,
          ),

          gallery_images: cleanedGallery,
          faq_items: cleanedFaq,

          source_url: nullableText(hotel.source_url),
          verified_at: toIsoDateTime(hotel.verified_at),
          updated_at: new Date().toISOString(),
        })
        .eq("id", hotel.id);

      if (hotelError) throw hotelError;

      setHotel((current) => ({
        ...current,
        intro_features_de: cleanStringArray(
          current.intro_features_de,
        ),
        intro_features_en: cleanStringArray(
          current.intro_features_en,
        ),
        gallery_images: cleanedGallery.map((image) => ({
          ...image,
          title_de: image.title_de || "",
          title_en: image.title_en || "",
          alt_de: image.alt_de || "",
          alt_en: image.alt_en || "",
          credit_name: image.credit_name || "",
          credit_url: image.credit_url || "",
        })),
        faq_items: cleanedFaq,
      }));

      setFeedback({
        type: "success",
        message: "Das Hotel wurde vollständig gespeichert.",
      });
    } catch (error) {
      console.error("Fehler beim Speichern des Hotels:", error);
      setFeedback({
        type: "error",
        message: `Speichern fehlgeschlagen: ${getErrorMessage(error)}`,
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="admin-hotel-editor admin-hotel-editor--centered">
        <Loader2 className="admin-hotel-editor__spinner" size={30} />
        <p>Hotel-Editor wird geladen …</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="admin-hotel-editor admin-hotel-editor--centered">
        <TriangleAlert size={34} />
        <h1>Hotel konnte nicht geladen werden</h1>
        <p>{loadError}</p>
        <button type="button" onClick={() => void loadEditor()}>
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <form className="admin-hotel-editor" onSubmit={handleSave}>
      <header className="admin-hotel-editor__header">
        <div className="admin-hotel-editor__heading">
          <Link
            href="/admin/hotels"
            className="admin-hotel-editor__back"
          >
            <ArrowLeft size={16} />
            Hotels
          </Link>

          <span className="admin-hotel-editor__eyebrow">
            Premium-Hotel bearbeiten
          </span>

          <h1>{spot.title || "Unbenanntes Hotel"}</h1>
          <p>
            Basisdaten, Premium-Inhalte, Galerie und FAQ zentral verwalten.
          </p>
        </div>

        <div className="admin-hotel-editor__actions">
          {spot.slug && (
            <Link
              href={`/de/spot/${encodeURIComponent(spot.slug)}`}
              target="_blank"
              className="admin-hotel-editor__preview"
            >
              <ExternalLink size={15} />
              Vorschau
            </Link>
          )}

          <button
            type="submit"
            className="admin-hotel-editor__save"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 size={16} className="admin-hotel-editor__spinner" />
            ) : (
              <Save size={16} />
            )}
            {isSaving ? "Wird gespeichert …" : "Hotel speichern"}
          </button>
        </div>
      </header>

      {feedback && (
        <div
          className={`admin-hotel-editor__feedback admin-hotel-editor__feedback--${feedback.type}`}
        >
          {feedback.type === "success" ? (
            <Check size={17} />
          ) : (
            <TriangleAlert size={17} />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <HotelTranslationBar
        spot={spot}
        hotel={hotel}
        setSpot={setSpot}
        setHotel={setHotel}
      />

      <div className="admin-hotel-editor__layout">
        <main className="admin-hotel-editor__main">
          <HotelGeneral
            spot={spot}
            hotel={hotel}
            setSpot={setSpot}
            setHotel={setHotel}
          />
          <HotelIntroFeatures hotel={hotel} setHotel={setHotel} />
          <HotelEditorial hotel={hotel} setHotel={setHotel} />
          <HotelHighlights hotel={hotel} setHotel={setHotel} />
          <HotelRooms spotId={spotId} rooms={rooms} />
          <HotelDistances hotel={hotel} setHotel={setHotel} />
          <HotelGallery hotel={hotel} hotelSlug={spot.slug} setHotel={setHotel} />
          <HotelFaq hotel={hotel} setHotel={setHotel} />
          <HotelSeo spot={spot} setSpot={setSpot} />
        </main>

        <HotelSidebar
          spot={spot}
          hotel={hotel}
          roomCount={roomCount}
          isSaving={isSaving}
          setHotel={setHotel}
        />
      </div>
    </form>
  );
}
