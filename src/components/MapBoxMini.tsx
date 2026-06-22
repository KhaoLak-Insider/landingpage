"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function MapBoxMini({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!lat || !lng) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!token) {
      console.error("Mapbox token fehlt");
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: 10,
      interactive: true,
    });

    // WARTEN, bis die Karte geladen ist, bevor wir schwenken
    map.on("load", () => {
      // Ändere den Wert 50, um die Karte weiter nach unten (Marker höher) zu schieben
      // Positive Y-Werte verschieben den Ausschnitt nach unten
      map.panBy([0, 50], { duration: 0 }); 
    });

    new mapboxgl.Marker({ color: "#14b8a6" })
      .setLngLat([lng, lat])
      .addTo(map);

    return () => map.remove();
  }, [lat, lng]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%", // Nutzt jetzt den kompletten Platz der Eltern-Box
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}