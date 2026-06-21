"use client";

import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

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

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: 11,
      interactive: false, // wichtig für Detailseiten UX
    });

    new mapboxgl.Marker({ color: "#14b8a6" })
      .setLngLat([lng, lat])
      .addTo(map);

    return () => map.remove();
  }, [lat, lng]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: 220,
        borderRadius: 16,
        overflow: "hidden",
      }}
    />
  );
}