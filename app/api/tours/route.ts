import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');

    // Falls keine Location übergeben wurde, direkt leeres Ergebnis liefern
    if (!location) {
      return NextResponse.json({ result: [] });
    }

    /* 
      HINWEIS: Travelpayouts / GetYourGuide ist aktuell noch nicht aktiv.
      Sobald du freigeschaltet bist, kannst du den folgenden Block einkommentieren.
    */
    /*
    const apiKey = process.env.TRAVELPAYOUTS_API_KEY;
    if (!apiKey) {
      console.error("API-Warnung: TRAVELPAYOUTS_API_KEY fehlt in .env.local");
      return NextResponse.json({ result: [] });
    }

    const apiUrl = `https://api.travelpayouts.com/v1/tours/search?location=${encodeURIComponent(location)}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'x-access-token': apiKey
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      console.error(`Travelpayouts Fehler: ${response.status}`);
      return NextResponse.json({ result: [] });
    }

    const data = await response.json();
    return NextResponse.json(data);
    */

    // VORÜBERGEHENDE LÖSUNG: Gibt ein sauberes, leeres Array zurück, 
    // damit dein Frontend ('SpotClientPage') nicht mehr abstürzt.
    return NextResponse.json({ result: [] });

  } catch (error) {
    console.error('Fehler in /api/tours Route:', error);
    // Im absoluten Fehlerfall immer valides JSON senden, damit res.json() nicht crasht
    return NextResponse.json({ result: [], error: 'Internal Server Error' }, { status: 500 });
  }
}