"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function MapBoxMini({
  lat,
  lng,
  route, // <--- NEU: Prop für die Route
}: {
  lat: number;
  lng: number;
  route?: any; // Typ für die Route
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!lat || !lng) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: 10,
    });

    map.on("load", () => {
      map.panBy([0, 50], { duration: 0 });

      // ROUTE ZEICHNEN, WENN VORHANDEN
      if (route) {
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: route, // Hier wird das GeoJSON-Objekt verwendet
          },
        });

        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3b82f6",
            "line-width": 6,
            "line-opacity": 0.8,
          },
        });
      }
    });

    new mapboxgl.Marker({ color: "#14b8a6" })
      .setLngLat([lng, lat])
      .addTo(map);

    return () => map.remove();
  }, [lat, lng, route]); // <--- route in den Dependency-Array!

  return (
    <div style={{ width: "100%", height: "100%", borderRadius: 16, overflow: "hidden" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}