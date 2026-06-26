import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');

  // Hier fragst du die Travelpayouts API an
  const response = await fetch(`https://api.travelpayouts.com/v1/tours/search?location=${location}`, {
    headers: {
      'x-access-token': process.env.TRAVELPAYOUTS_API_KEY!
    }
  });

  const data = await response.json();
  return NextResponse.json(data);
}