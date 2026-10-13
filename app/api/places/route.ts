// app/api/places/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('input');
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '';

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id',
    },
    body: JSON.stringify({ textQuery: query }),
  });
  const data = await res.json();
  const candidates = (data.places || []).map((p: { id: string }) => ({ place_id: p.id }));

  return NextResponse.json({ candidates, status: candidates.length ? 'OK' : 'ZERO_RESULTS' });
}