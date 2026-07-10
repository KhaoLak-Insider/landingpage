import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const language =
    request.nextUrl.searchParams.get("lng") === "en" ? "en" : "de";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-language", language);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Nicht auf statische Dateien, Bilder, API-Routen und Next.js-Dateien
     * anwenden.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)",
  ],
};