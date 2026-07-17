import {
  defaultLanguage,
  languages,
  type Language,
} from "@/src/lib/i18n";

const translatedSegments: Record<
  Language,
  Record<string, string>
> = {
  de: {
    home: "home",
    app: "app",
    entdecken: "entdecken",
    planen: "planen",
    profil: "profil",
    registrieren: "registrieren",
    datenschutz: "datenschutz",
    impressum: "impressum",
    favorites: "favoriten",
    spot: "spot",
    zimmer: "zimmer",
  },
  en: {
    home: "home",
    app: "app",
    entdecken: "discover",
    planen: "plan",
    profil: "profile",
    registrieren: "register",
    datenschutz: "privacy",
    impressum: "legal-notice",
    favorites: "favorites",
    spot: "spot",
    zimmer: "rooms",
  },
};

const internalSegments = new Set(
  Object.keys(translatedSegments.de)
);

const nonLocalizedPrefixes = ["/admin", "/editor", "/api"];

export function isNonLocalizedPath(pathname: string): boolean {
  return nonLocalizedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isLanguage(value: string): value is Language {
  return languages.includes(value as Language);
}

export function getLanguageFromPathname(
  pathname: string
): Language {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return firstSegment && isLanguage(firstSegment)
    ? firstSegment
    : defaultLanguage;
}

export function stripLanguagePrefix(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] && isLanguage(segments[0])) {
    segments.shift();
  }

  return segments.length > 0 ? `/${segments.join("/")}` : "/";
}

function splitPath(value: string) {
  const hashIndex = value.indexOf("#");
  const hash = hashIndex >= 0 ? value.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? value.slice(0, hashIndex) : value;
  const queryIndex = withoutHash.indexOf("?");
  const pathname =
    queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const search =
    queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : "";

  return { pathname: pathname || "/", search, hash };
}

export function localizePath(
  value: string,
  language: Language
): string {
  if (
    value.startsWith("#") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    /^https?:\/\//.test(value)
  ) {
    return value;
  }

  const { pathname, search, hash } = splitPath(value);
  const internalPath = stripLanguagePrefix(pathname);

  if (isNonLocalizedPath(internalPath)) {
    return `${internalPath}${search ? `?${search}` : ""}${hash}`;
  }

  const segments = internalPath.split("/").filter(Boolean);

  const localizedSegments = segments.map((segment) =>
    internalSegments.has(segment)
      ? translatedSegments[language][segment]
      : segment
  );

  const localizedPath =
    localizedSegments.length > 0
      ? `/${language}/${localizedSegments.join("/")}`
      : `/${language}`;
  const params = new URLSearchParams(search);
  params.delete("lng");
  const query = params.toString();

  return `${localizedPath}${query ? `?${query}` : ""}${hash}`;
}

export function internalizePath(
  pathname: string,
  language: Language
): string {
  const segments = stripLanguagePrefix(pathname)
    .split("/")
    .filter(Boolean);
  const reverseSegments = Object.fromEntries(
    Object.entries(translatedSegments[language]).map(
      ([internal, translated]) => [translated, internal]
    )
  );

  const internalSegmentsForPath = segments.map(
    (segment) => reverseSegments[segment] || segment
  );

  return internalSegmentsForPath.length > 0
    ? `/${internalSegmentsForPath.join("/")}`
    : "/";
}

export function switchLanguagePath(
  value: string,
  language: Language
): string {
  const { pathname, search, hash } = splitPath(value);
  const currentLanguage = getLanguageFromPathname(pathname);
  const internalPath = internalizePath(pathname, currentLanguage);
  return localizePath(
    `${internalPath}${search ? `?${search}` : ""}${hash}`,
    language
  );
}

export function absoluteLocalizedUrl(
  path: string,
  language: Language,
  baseUrl = "https://www.khaolak.app"
): string {
  return new URL(localizePath(path, language), baseUrl).toString();
}
