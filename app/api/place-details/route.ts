// app/api/place-details/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('place_id');
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || '';

  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'photos',
    },
  });
  const data = await res.json();
  const photos = (data.photos || []).map((p: { name: string }) => ({ photo_reference: p.name }));

  return NextResponse.json({ result: { photos }, status: 'OK' });
}