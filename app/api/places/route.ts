// app/api/places/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('input');
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  const res = await fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query!)}&inputtype=textquery&fields=place_id&key=${apiKey}`);
  const data = await res.json();
  
  return NextResponse.json(data);
}