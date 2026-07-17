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

import { emptyRoom } from "./constants";
import type {
  FeedbackState,
  HotelReference,
  RoomForm,
  SpotReference,
} from "./types";
import {
  cleanStringArray,
  getErrorMessage,
  normalizeImages,
  normalizeStringArray,
  normalizeText,
  nullableNumber,
  nullableText,
} from "./utils";

import RoomAmenities from "./components/RoomAmenities";
import RoomCapacity from "./components/RoomCapacity";
import RoomDescriptions from "./components/RoomDescriptions";
import RoomDetails from "./components/RoomDetails";
import RoomGallery from "./components/RoomGallery";
import RoomGeneral from "./components/RoomGeneral";
import RoomHighlights from "./components/RoomHighlights";
import RoomSidebar from "./components/RoomSidebar";

import "./room-editor.css";

export default function AdminRoomEditorPage() {
  const params = useParams<{ spotId: string; roomId: string }>();

  const spotId = useMemo(
    () => decodeURIComponent(String(params?.spotId || "").trim()),
    [params],
  );

  const roomId = useMemo(
    () => decodeURIComponent(String(params?.roomId || "").trim()),
    [params],
  );

  const [room, setRoom] = useState<RoomForm>(emptyRoom);
  const [hotel, setHotel] = useState<HotelReference | null>(null);
  const [spot, setSpot] = useState<SpotReference | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const loadRoom = useCallback(async () => {
    if (!spotId || !roomId) {
      setLoadError("In der URL fehlt die Spot-ID oder Zimmer-ID.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    setFeedback(null);

    try {
      const { data: roomData, error: roomError } = await supabase
        .from("premium_rooms")
        .select(`
          id,
          premium_hotel_id,
          slug,
          status,
          sort_order,
          name_de,
          name_en,
          short_description_de,
          short_description_en,
          description_de,
          description_en,
          size_sqm,
          max_adults,
          max_children,
          max_occupancy,
          bed_type_de,
          bed_type_en,
          view_de,
          view_en,
          bathroom_de,
          bathroom_en,
          cover_image_url,
          images,
          highlights_de,
          highlights_en,
          amenities_de,
          amenities_en
        `)
        .eq("id", roomId)
        .maybeSingle();

      if (roomError) throw roomError;
      if (!roomData) throw new Error("Das Zimmer wurde nicht gefunden.");

      const { data: hotelData, error: hotelError } = await supabase
        .from("premium_hotels")
        .select("id, spot_id")
        .eq("id", roomData.premium_hotel_id)
        .maybeSingle();

      if (hotelError) throw hotelError;
      if (!hotelData) {
        throw new Error(
          "Das zugehörige Premium-Hotel wurde nicht gefunden.",
        );
      }

      if (String(hotelData.spot_id) !== spotId) {
        throw new Error(
          "Das Zimmer gehört nicht zu dem Hotel aus der aktuellen URL.",
        );
      }

      const { data: spotData, error: spotError } = await supabase
        .from("spots")
        .select("id, slug, title")
        .eq("id", spotId)
        .maybeSingle();

      if (spotError) throw spotError;
      if (!spotData) {
        throw new Error("Der zugehörige Hotel-Spot wurde nicht gefunden.");
      }

      setRoom({
        id: String(roomData.id),
        premium_hotel_id: String(roomData.premium_hotel_id),
        slug: normalizeText(roomData.slug),
        status:
          roomData.status === "published" ||
          roomData.status === "archived"
            ? roomData.status
            : "draft",
        sort_order:
          roomData.sort_order === null ? "" : String(roomData.sort_order),

        name_de: normalizeText(roomData.name_de),
        name_en: normalizeText(roomData.name_en),

        short_description_de: normalizeText(
          roomData.short_description_de,
        ),
        short_description_en: normalizeText(
          roomData.short_description_en,
        ),
        description_de: normalizeText(roomData.description_de),
        description_en: normalizeText(roomData.description_en),

        size_sqm:
          roomData.size_sqm === null ? "" : String(roomData.size_sqm),
        max_adults:
          roomData.max_adults === null ? "" : String(roomData.max_adults),
        max_children:
          roomData.max_children === null
            ? ""
            : String(roomData.max_children),
        max_occupancy:
          roomData.max_occupancy === null
            ? ""
            : String(roomData.max_occupancy),

        bed_type_de: normalizeText(roomData.bed_type_de),
        bed_type_en: normalizeText(roomData.bed_type_en),
        view_de: normalizeText(roomData.view_de),
        view_en: normalizeText(roomData.view_en),
        bathroom_de: normalizeText(roomData.bathroom_de),
        bathroom_en: normalizeText(roomData.bathroom_en),

        cover_image_url: normalizeText(roomData.cover_image_url),
        images: normalizeImages(roomData.images),

        highlights_de: normalizeStringArray(roomData.highlights_de),
        highlights_en: normalizeStringArray(roomData.highlights_en),
        amenities_de: normalizeStringArray(roomData.amenities_de),
        amenities_en: normalizeStringArray(roomData.amenities_en),
      });

      setHotel({
        id: String(hotelData.id),
        spot_id: String(hotelData.spot_id),
      });

      setSpot({
        id: String(spotData.id),
        slug: normalizeText(spotData.slug),
        title: normalizeText(spotData.title),
      });
    } catch (error) {
      console.error("Fehler beim Laden des Zimmer-Editors:", error);
      setLoadError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [roomId, spotId]);

  useEffect(() => {
    void loadRoom();
  }, [loadRoom]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!room.id) {
      setFeedback({
        type: "error",
        message: "Das Zimmer ist noch nicht vollständig geladen.",
      });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const cleanedImages = room.images
        .map((image) => ({
          url: image.url.trim(),
          alt_de: nullableText(image.alt_de || ""),
          alt_en: nullableText(image.alt_en || ""),
        }))
        .filter((image) => Boolean(image.url));

      const { error } = await supabase
        .from("premium_rooms")
        .update({
          slug: nullableText(room.slug),
          status: room.status,
          sort_order: nullableNumber(room.sort_order),

          name_de: room.name_de.trim(),
          name_en: nullableText(room.name_en),

          short_description_de: nullableText(
            room.short_description_de,
          ),
          short_description_en: nullableText(
            room.short_description_en,
          ),
          description_de: nullableText(room.description_de),
          description_en: nullableText(room.description_en),

          size_sqm: nullableNumber(room.size_sqm),
          max_adults: nullableNumber(room.max_adults),
          max_children: nullableNumber(room.max_children),
          max_occupancy: nullableNumber(room.max_occupancy),

          bed_type_de: nullableText(room.bed_type_de),
          bed_type_en: nullableText(room.bed_type_en),
          view_de: nullableText(room.view_de),
          view_en: nullableText(room.view_en),
          bathroom_de: nullableText(room.bathroom_de),
          bathroom_en: nullableText(room.bathroom_en),

          cover_image_url: nullableText(room.cover_image_url),
          images: cleanedImages,

          highlights_de: cleanStringArray(room.highlights_de),
          highlights_en: cleanStringArray(room.highlights_en),
          amenities_de: cleanStringArray(room.amenities_de),
          amenities_en: cleanStringArray(room.amenities_en),

          updated_at: new Date().toISOString(),
        })
        .eq("id", room.id);

      if (error) throw error;

      setRoom((current) => ({
        ...current,
        images: cleanedImages.map((image) => ({
          url: image.url,
          alt_de: image.alt_de || "",
          alt_en: image.alt_en || "",
        })),
        highlights_de: cleanStringArray(current.highlights_de),
        highlights_en: cleanStringArray(current.highlights_en),
        amenities_de: cleanStringArray(current.amenities_de),
        amenities_en: cleanStringArray(current.amenities_en),
      }));

      setFeedback({
        type: "success",
        message: "Das Zimmer wurde vollständig gespeichert.",
      });
    } catch (error) {
      console.error("Fehler beim Speichern des Zimmers:", error);
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
      <div className="admin-room-editor admin-room-editor--centered">
        <Loader2 className="admin-room-editor__spinner" size={30} />
        <p>Zimmer-Editor wird geladen …</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="admin-room-editor admin-room-editor--centered">
        <TriangleAlert size={34} />
        <h1>Zimmer konnte nicht geladen werden</h1>
        <p>{loadError}</p>

        <div className="admin-room-editor__error-actions">
          <Link href={`/admin/hotels/${encodeURIComponent(spotId)}`}>
            Zurück zum Hotel
          </Link>

          <button type="button" onClick={() => void loadRoom()}>
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="admin-room-editor" onSubmit={handleSave}>
      <header className="admin-room-editor__header">
        <div className="admin-room-editor__heading">
          <Link
            href={`/admin/hotels/${encodeURIComponent(spotId)}`}
            className="admin-room-editor__back"
          >
            <ArrowLeft size={16} />
            Zurück zu {spot?.title || "Hotel"}
          </Link>

          <span className="admin-room-editor__eyebrow">
            Zimmer und Villen
          </span>

          <h1>{room.name_de || "Unbenanntes Zimmer"}</h1>
          <p>
            Alle Zimmerdaten, Highlights, Ausstattungen und Bilder zentral
            verwalten.
          </p>
        </div>

        <div className="admin-room-editor__actions">
          {spot?.slug && room.slug && (
            <Link
              href={`/de/spot/${encodeURIComponent(
                spot.slug,
              )}/zimmer/${encodeURIComponent(room.slug)}`}
              target="_blank"
              className="admin-room-editor__preview"
            >
              <ExternalLink size={15} />
              Vorschau
            </Link>
          )}

          <button
            type="submit"
            className="admin-room-editor__save"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 size={16} className="admin-room-editor__spinner" />
            ) : (
              <Save size={16} />
            )}
            {isSaving ? "Wird gespeichert …" : "Zimmer speichern"}
          </button>
        </div>
      </header>

      {feedback && (
        <div
          className={`admin-room-editor__feedback admin-room-editor__feedback--${feedback.type}`}
        >
          {feedback.type === "success" ? (
            <Check size={17} />
          ) : (
            <TriangleAlert size={17} />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="admin-room-editor__layout">
        <main className="admin-room-editor__main">
          <RoomGeneral room={room} setRoom={setRoom} />
          <RoomDescriptions room={room} setRoom={setRoom} />
          <RoomCapacity room={room} setRoom={setRoom} />
          <RoomDetails room={room} setRoom={setRoom} />
          <RoomHighlights room={room} setRoom={setRoom} />
          <RoomAmenities room={room} setRoom={setRoom} />
          <RoomGallery room={room} setRoom={setRoom} />
        </main>

        <RoomSidebar
          room={room}
          hotel={hotel}
          spot={spot}
          isSaving={isSaving}
          setRoom={setRoom}
        />
      </div>
    </form>
  );
}
