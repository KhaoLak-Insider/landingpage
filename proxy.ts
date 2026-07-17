import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  getLanguageFromPathname,
  internalizePath,
  isLanguage,
  isNonLocalizedPath,
  localizePath,
} from "@/src/lib/i18n-routing";
import type { Language } from "@/src/lib/i18n";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (!firstSegment || !isLanguage(firstSegment)) {
    const requestedLanguage: Language =
      request.nextUrl.searchParams.get("lng") === "en" ? "en" : "de";
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = localizePath(pathname, requestedLanguage);
    redirectUrl.searchParams.delete("lng");

    return NextResponse.redirect(redirectUrl, 308);
  }

  const language = getLanguageFromPathname(pathname);
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = internalizePath(pathname, language);

  if (isNonLocalizedPath(rewriteUrl.pathname)) {
    rewriteUrl.searchParams.delete("lng");
    return NextResponse.redirect(rewriteUrl, 308);
  }

  rewriteUrl.searchParams.set("lng", language);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-language", language);

  return NextResponse.rewrite(rewriteUrl, {
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
    "/((?!api|admin|editor|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|icons).*)",
  ],
};
