"use client";

import { useState } from "react";
import {
  BedDouble,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ImageIcon,
  Loader2,
  Search,
  TriangleAlert,
} from "lucide-react";

import { supabase } from "@/src/lib/supabase";

export interface ImportedRoomCandidate {
  source_url: string;
  slug: string;
  name_de: string;
  name_en: string;
  short_description_de: string;
  short_description_en: string;
  description_de: string;
  description_en: string;
  size_sqm: number | null;
  max_adults: number | null;
  max_children: number | null;
  max_occupancy: number | null;
  bed_type_de: string;
  bed_type_en: string;
  view_de: string;
  view_en: string;
  bathroom_de: string;
  bathroom_en: string;
  cover_image_url: string;
  images: Array<{
    url: string;
    alt_de: string;
    alt_en: string;
  }>;
  highlights_de: string[];
  highlights_en: string[];
  amenities_de: string[];
  amenities_en: string[];
}

interface ImportedRoomSelection
  extends ImportedRoomCandidate {
  selected: boolean;
}

interface Props {
  websiteUrl: string;
  rooms: ImportedRoomSelection[];
  onRoomsChange: (rooms: ImportedRoomSelection[]) => void;
}

interface ImportResponse {
  rooms?: ImportedRoomCandidate[];
  inspected_pages?: number;
  warnings?: string[];
  error?: string;
}

export default function WebsiteRoomImporter({
  websiteUrl,
  rooms,
  onRoomsChange,
}: Props) {
  const [sourceUrl, setSourceUrl] = useState(websiteUrl);
  const [isImporting, setIsImporting] = useState(false);
  const [expandedRoom, setExpandedRoom] = useState<string | null>(
    null,
  );
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function importRooms() {
    const url = (sourceUrl || websiteUrl).trim();

    if (!url) {
      setMessage({
        type: "error",
        text: "Bitte die offizielle Hotelwebsite oder Unterkunftsübersicht angeben.",
      });
      return;
    }

    setIsImporting(true);
    setMessage(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error(
          "Für den Zimmerimport ist eine aktive Admin-Anmeldung erforderlich.",
        );
      }

      const response = await fetch(
        "/api/admin/import-hotel-rooms",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ url }),
        },
      );

      const data = (await response.json()) as ImportResponse;

      if (!response.ok) {
        throw new Error(
          data.error || "Die Hotelwebsite konnte nicht analysiert werden.",
        );
      }

      const importedRooms = Array.isArray(data.rooms)
        ? data.rooms.map((room) => ({
            ...room,
            selected: true,
          }))
        : [];

      onRoomsChange(importedRooms);

      if (importedRooms.length === 0) {
        setMessage({
          type: "error",
          text:
            data.warnings?.[0] ||
            "Es wurden keine Zimmertypen erkannt. Probiere die direkte Unterkunftsübersicht des Hotels.",
        });
      } else {
        setMessage({
          type: "success",
          text: `${importedRooms.length} Zimmertypen wurden vorbereitet. Bitte vor dem Anlegen prüfen.`,
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Der Zimmerimport ist fehlgeschlagen.",
      });
    } finally {
      setIsImporting(false);
    }
  }

  function updateRoom(
    index: number,
    patch: Partial<ImportedRoomSelection>,
  ) {
    onRoomsChange(
      rooms.map((room, roomIndex) =>
        roomIndex === index ? { ...room, ...patch } : room,
      ),
    );
  }

  const selectedCount = rooms.filter(
    (room) => room.selected,
  ).length;

  return (
    <section className="website-room-importer">
      <div className="website-room-importer__header">
        <div>
          <span>Automatische Zimmererkennung</span>
          <h2>Zimmertypen von der Hotelwebsite vorbereiten</h2>
          <p>
            Die Website wird nur analysiert. Gespeichert werden die
            ausgewählten Zimmer erst zusammen mit dem neuen Hotel.
          </p>
        </div>

        <div className="website-room-importer__summary">
          <BedDouble size={16} />
          {selectedCount} ausgewählt
        </div>
      </div>

      <div className="website-room-importer__search">
        <label>
          <Search size={16} />
          <input
            type="url"
            value={sourceUrl}
            onChange={(event) =>
              setSourceUrl(event.target.value)
            }
            placeholder="https://hotel.example.com/accommodation"
          />
        </label>

        <button
          type="button"
          onClick={() => void importRooms()}
          disabled={isImporting}
        >
          {isImporting ? (
            <Loader2
              size={15}
              className="website-room-importer__spinner"
            />
          ) : (
            <Search size={15} />
          )}
          {isImporting
            ? "Website wird analysiert …"
            : "Zimmer suchen"}
        </button>
      </div>

      <div className="website-room-importer__notice">
        Bilder werden nur als externe Vorschau-URLs übernommen.
        Vor einer Veröffentlichung müssen die Nutzungsrechte geprüft
        und die Bilder idealerweise in den eigenen R2-Speicher
        übertragen werden.
      </div>

      {message && (
        <div
          className={`website-room-importer__message website-room-importer__message--${message.type}`}
        >
          {message.type === "success" ? (
            <Check size={15} />
          ) : (
            <TriangleAlert size={15} />
          )}
          {message.text}
        </div>
      )}

      {rooms.length > 0 && (
        <>
          <div className="website-room-importer__bulk">
            <button
              type="button"
              onClick={() =>
                onRoomsChange(
                  rooms.map((room) => ({
                    ...room,
                    selected: true,
                  })),
                )
              }
            >
              Alle auswählen
            </button>

            <button
              type="button"
              onClick={() =>
                onRoomsChange(
                  rooms.map((room) => ({
                    ...room,
                    selected: false,
                  })),
                )
              }
            >
              Auswahl aufheben
            </button>
          </div>

          <div className="website-room-importer__rooms">
            {rooms.map((room, index) => {
              const isExpanded =
                expandedRoom === room.source_url;

              return (
                <article
                  className={`website-room-importer__room ${
                    room.selected ? "is-selected" : ""
                  }`}
                  key={`${room.source_url}-${index}`}
                >
                  <div className="website-room-importer__room-main">
                    <label className="website-room-importer__select">
                      <input
                        type="checkbox"
                        checked={room.selected}
                        onChange={(event) =>
                          updateRoom(index, {
                            selected: event.target.checked,
                          })
                        }
                      />
                    </label>

                    <div className="website-room-importer__image">
                      {room.cover_image_url ? (
                        <img
                          src={room.cover_image_url}
                          alt={room.name_de}
                        />
                      ) : (
                        <ImageIcon size={23} />
                      )}
                    </div>

                    <div className="website-room-importer__content">
                      <div className="website-room-importer__title-row">
                        <div>
                          <input
                            value={room.name_de}
                            onChange={(event) =>
                              updateRoom(index, {
                                name_de: event.target.value,
                              })
                            }
                            aria-label="Zimmername"
                          />

                          <small>
                            {[
                              room.size_sqm !== null
                                ? `${room.size_sqm} m²`
                                : "",
                              room.max_occupancy !== null
                                ? `max. ${room.max_occupancy} Gäste`
                                : "",
                              room.bed_type_de,
                              room.view_de,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </small>
                        </div>

                        <a
                          href={room.source_url}
                          target="_blank"
                          rel="noreferrer"
                          title="Quellseite öffnen"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>

                      <textarea
                        rows={2}
                        value={room.short_description_de}
                        onChange={(event) =>
                          updateRoom(index, {
                            short_description_de:
                              event.target.value,
                          })
                        }
                        aria-label="Zimmer-Kurzbeschreibung"
                      />
                    </div>

                    <button
                      type="button"
                      className="website-room-importer__expand"
                      onClick={() =>
                        setExpandedRoom(
                          isExpanded
                            ? null
                            : room.source_url,
                        )
                      }
                      title={
                        isExpanded
                          ? "Details schließen"
                          : "Details prüfen"
                      }
                    >
                      {isExpanded ? (
                        <ChevronUp size={17} />
                      ) : (
                        <ChevronDown size={17} />
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="website-room-importer__details">
                      <div className="website-room-importer__grid">
                        <label>
                          <span>Größe in m²</span>
                          <input
                            type="number"
                            min="0"
                            value={room.size_sqm ?? ""}
                            onChange={(event) =>
                              updateRoom(index, {
                                size_sqm: event.target.value
                                  ? Number(event.target.value)
                                  : null,
                              })
                            }
                          />
                        </label>

                        <label>
                          <span>Max. Erwachsene</span>
                          <input
                            type="number"
                            min="0"
                            value={room.max_adults ?? ""}
                            onChange={(event) =>
                              updateRoom(index, {
                                max_adults: event.target.value
                                  ? Number(event.target.value)
                                  : null,
                              })
                            }
                          />
                        </label>

                        <label>
                          <span>Max. Kinder</span>
                          <input
                            type="number"
                            min="0"
                            value={room.max_children ?? ""}
                            onChange={(event) =>
                              updateRoom(index, {
                                max_children: event.target.value
                                  ? Number(event.target.value)
                                  : null,
                              })
                            }
                          />
                        </label>

                        <label>
                          <span>Max. Gesamtbelegung</span>
                          <input
                            type="number"
                            min="0"
                            value={room.max_occupancy ?? ""}
                            onChange={(event) =>
                              updateRoom(index, {
                                max_occupancy: event.target.value
                                  ? Number(event.target.value)
                                  : null,
                              })
                            }
                          />
                        </label>

                        <label>
                          <span>Bettentyp</span>
                          <input
                            value={room.bed_type_de}
                            onChange={(event) =>
                              updateRoom(index, {
                                bed_type_de:
                                  event.target.value,
                              })
                            }
                          />
                        </label>

                        <label>
                          <span>Aussicht</span>
                          <input
                            value={room.view_de}
                            onChange={(event) =>
                              updateRoom(index, {
                                view_de: event.target.value,
                              })
                            }
                          />
                        </label>
                      </div>

                      <label>
                        <span>Ausführliche Beschreibung</span>
                        <textarea
                          rows={6}
                          value={room.description_de}
                          onChange={(event) =>
                            updateRoom(index, {
                              description_de:
                                event.target.value,
                            })
                          }
                        />
                      </label>

                      <div className="website-room-importer__chips">
                        {room.highlights_de.map(
                          (highlight) => (
                            <span key={highlight}>
                              {highlight}
                            </span>
                          ),
                        )}
                        {room.amenities_de
                          .slice(0, 10)
                          .map((amenity) => (
                            <span
                              className="is-amenity"
                              key={amenity}
                            >
                              {amenity}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}

      <style jsx>{`
        .website-room-importer {
          padding: 21px;
          border: 1px solid #e4eaee;
          border-radius: 17px;
          background: #fff;
          box-shadow: 0 9px 26px rgba(15, 35, 62, 0.035);
        }

        .website-room-importer__header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 17px;
          padding-bottom: 16px;
          border-bottom: 1px solid #edf1f3;
        }

        .website-room-importer__header span {
          display: block;
          margin-bottom: 6px;
          color: #079ca5;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .website-room-importer__header h2 {
          margin: 0;
          color: #10233f;
          font-size: 19px;
        }

        .website-room-importer__header p {
          max-width: 650px;
          margin: 7px 0 0;
          color: #718096;
          font-size: 9px;
          line-height: 1.6;
        }

        .website-room-importer__summary {
          display: inline-flex;
          min-height: 34px;
          align-items: center;
          gap: 7px;
          padding: 0 10px;
          border-radius: 999px;
          background: #eaf8f8;
          color: #07868e;
          font-size: 9px;
          font-weight: 800;
          white-space: nowrap;
        }

        .website-room-importer__search {
          display: flex;
          gap: 9px;
        }

        .website-room-importer__search label {
          display: flex;
          flex: 1;
          align-items: center;
          gap: 8px;
          padding: 0 11px;
          border: 1px solid #dfe6eb;
          border-radius: 10px;
          background: #fbfcfd;
          color: #8492a2;
        }

        .website-room-importer__search input {
          width: 100%;
          height: 41px;
          border: 0;
          outline: 0;
          background: transparent;
          font: inherit;
          font-size: 10px;
        }

        .website-room-importer__search button {
          display: inline-flex;
          min-height: 41px;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 13px;
          border: 0;
          border-radius: 10px;
          background: #079ca5;
          color: #fff;
          font: inherit;
          font-size: 9px;
          font-weight: 800;
          cursor: pointer;
        }

        .website-room-importer__notice {
          margin-top: 10px;
          padding: 9px 11px;
          border-radius: 9px;
          background: #fff8e7;
          color: #8a610c;
          font-size: 8px;
          line-height: 1.55;
        }

        .website-room-importer__message {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 11px;
          padding: 9px 11px;
          border-radius: 9px;
          font-size: 9px;
          font-weight: 750;
        }

        .website-room-importer__message--success {
          background: #ecfdf5;
          color: #087b58;
        }

        .website-room-importer__message--error {
          background: #fff1f2;
          color: #be123c;
        }

        .website-room-importer__bulk {
          display: flex;
          justify-content: flex-end;
          gap: 7px;
          margin-top: 13px;
        }

        .website-room-importer__bulk button {
          padding: 7px 9px;
          border: 1px solid #dfe6eb;
          border-radius: 8px;
          background: #fff;
          color: #526174;
          font: inherit;
          font-size: 8px;
          font-weight: 750;
          cursor: pointer;
        }

        .website-room-importer__rooms {
          display: flex;
          flex-direction: column;
          gap: 9px;
          margin-top: 11px;
        }

        .website-room-importer__room {
          overflow: hidden;
          border: 1px solid #e3e9ed;
          border-radius: 13px;
          background: #fafcfc;
          opacity: 0.68;
        }

        .website-room-importer__room.is-selected {
          border-color: #b9dedf;
          background: #fff;
          opacity: 1;
        }

        .website-room-importer__room-main {
          display: grid;
          grid-template-columns: 22px 78px minmax(0, 1fr) 34px;
          align-items: center;
          gap: 11px;
          padding: 10px;
        }

        .website-room-importer__select {
          display: flex;
          align-items: center;
        }

        .website-room-importer__select input {
          width: 16px;
          height: 16px;
          accent-color: #079ca5;
        }

        .website-room-importer__image {
          display: flex;
          width: 78px;
          height: 62px;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 9px;
          background: #edf3f4;
          color: #8492a2;
        }

        .website-room-importer__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .website-room-importer__content {
          min-width: 0;
        }

        .website-room-importer__title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .website-room-importer__title-row > div {
          min-width: 0;
          flex: 1;
        }

        .website-room-importer__title-row input {
          width: 100%;
          height: 30px;
          padding: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #21354d;
          font: inherit;
          font-size: 11px;
          font-weight: 800;
        }

        .website-room-importer__title-row small {
          display: block;
          overflow: hidden;
          margin-top: 2px;
          color: #7b8798;
          font-size: 8px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .website-room-importer__title-row a {
          display: flex;
          width: 28px;
          height: 28px;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: #718096;
        }

        .website-room-importer__content textarea {
          width: 100%;
          margin-top: 6px;
          padding: 7px;
          border: 1px solid #e3e9ed;
          border-radius: 8px;
          outline: 0;
          background: #fff;
          color: #526174;
          font: inherit;
          font-size: 8px;
          line-height: 1.45;
          resize: vertical;
        }

        .website-room-importer__expand {
          display: flex;
          width: 32px;
          height: 32px;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 8px;
          background: #edf7f7;
          color: #078f96;
          cursor: pointer;
        }

        .website-room-importer__details {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 14px;
          border-top: 1px solid #e5ebef;
          background: #fff;
        }

        .website-room-importer__grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .website-room-importer__details label {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .website-room-importer__details label span {
          color: #526174;
          font-size: 8px;
          font-weight: 750;
        }

        .website-room-importer__details input,
        .website-room-importer__details textarea {
          width: 100%;
          border: 1px solid #dfe6eb;
          border-radius: 9px;
          outline: 0;
          background: #fbfcfd;
          color: #1d2e45;
          font: inherit;
          font-size: 9px;
        }

        .website-room-importer__details input {
          height: 37px;
          padding: 0 9px;
        }

        .website-room-importer__details textarea {
          padding: 9px;
          line-height: 1.55;
          resize: vertical;
        }

        .website-room-importer__chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .website-room-importer__chips span {
          padding: 5px 7px;
          border-radius: 999px;
          background: #e9f8f8;
          color: #07868e;
          font-size: 7px;
          font-weight: 750;
        }

        .website-room-importer__chips span.is-amenity {
          background: #f0f3f6;
          color: #617083;
        }

        .website-room-importer__spinner {
          animation: websiteRoomImporterSpin 0.8s linear
            infinite;
        }

        @keyframes websiteRoomImporterSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 760px) {
          .website-room-importer__header,
          .website-room-importer__search {
            align-items: stretch;
            flex-direction: column;
          }

          .website-room-importer__room-main {
            grid-template-columns: 20px 60px minmax(0, 1fr);
          }

          .website-room-importer__image {
            width: 60px;
            height: 54px;
          }

          .website-room-importer__expand {
            grid-column: 3;
            justify-self: end;
          }

          .website-room-importer__grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </section>
  );
}
