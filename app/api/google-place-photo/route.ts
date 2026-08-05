import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("photo_reference")?.trim();
  const maxWidth = searchParams.get("maxwidth")?.trim() || "1200";
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!reference) {
    return NextResponse.json({ error: "Missing photo_reference" }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: "Missing Google Places API key" }, { status: 500 });
  }

  const upstream = await fetch(
    `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${encodeURIComponent(maxWidth)}&photo_reference=${encodeURIComponent(reference)}&key=${encodeURIComponent(apiKey)}`,
    { redirect: "follow" },
  );

  if (!upstream.ok) {
    return NextResponse.json({ error: "Google photo fetch failed" }, { status: upstream.status });
  }

  const contentType = upstream.headers.get("content-type") || "image/jpeg";
  const buffer = await upstream.arrayBuffer();

  return new NextResponse(Buffer.from(buffer), {
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
