import { NextResponse } from "next/server";

const DEFAULT_LAT = 8.6502;
const DEFAULT_LON = 98.2495;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const latitude = url.searchParams.get("latitude") || String(DEFAULT_LAT);
  const longitude = url.searchParams.get("longitude") || String(DEFAULT_LON);

  const upstream = new URL("https://api.open-meteo.com/v1/forecast");
  upstream.searchParams.set("latitude", latitude);
  upstream.searchParams.set("longitude", longitude);
  upstream.searchParams.set("daily", "temperature_2m_min,temperature_2m_max,precipitation_sum,weather_code");
  upstream.searchParams.set("forecast_days", "14");
  upstream.searchParams.set("current_weather", "true");
  upstream.searchParams.set("timezone", "auto");
  upstream.searchParams.set("temperature_unit", "celsius");

  try {
    const response = await fetch(upstream.toString(), {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: true, status: response.status }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: true }, { status: 502 });
  }
}
