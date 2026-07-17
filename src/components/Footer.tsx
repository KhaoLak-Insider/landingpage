// app/components/Footer.tsx
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { localizePath } from "@/src/lib/i18n-routing";

export default async function Footer() {
  const headersList = await headers();
  const language = headersList.get("x-language") === "en" ? "en" : "de";
  const href = (path: string) => localizePath(path, language);
  const copy = language === "en"
    ? {
        description: "The smart travel guide for Khao Lak. Discover beaches, restaurants, markets, temples and genuine insider tips in one app.",
        launch: "App launch 2026",
        app: "App",
        features: "Features",
        map: "Interactive map",
        planner: "Trip planner",
        favorites: "Favorites",
        company: "Company",
        about: "About us",
        waitlist: "Waitlist",
        contact: "Contact",
        legal: "Legal",
        imprint: "Legal notice",
        privacy: "Privacy policy",
        rights: "All rights reserved.",
      }
    : {
        description: "Der smarte Reiseführer für Khao Lak. Entdecke Strände, Restaurants, Märkte, Tempel und echte Geheimtipps in einer App.",
        launch: "App-Start 2026",
        app: "App",
        features: "Features",
        map: "Interaktive Karte",
        planner: "Reiseplaner",
        favorites: "Favoriten",
        company: "Unternehmen",
        about: "Über uns",
        waitlist: "Warteliste",
        contact: "Kontakt",
        legal: "Rechtliches",
        imprint: "Impressum",
        privacy: "Datenschutz",
        rights: "Alle Rechte vorbehalten.",
      };
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-8 py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Image src="/images/logo-footer.svg" alt="Khao Lak Insider" width={260} height={260} className="h-auto w-[220px]" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-600">{copy.description}</p>
            <p className="mt-6 text-sm font-semibold text-teal-600">{copy.launch}</p>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-slate-900">{copy.app}</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><Link href={href("/#features")} className="hover:text-teal-500 transition">{copy.features}</Link></li>
              <li><Link href={href("/planen")} className="hover:text-teal-500 transition">{copy.map}</Link></li>
              <li><Link href={href("/planen")} className="hover:text-teal-500 transition">{copy.planner}</Link></li>
              <li><Link href={href("/favorites")} className="hover:text-teal-500 transition">{copy.favorites}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-slate-900">{copy.company}</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><Link href={href("/#about")} className="hover:text-teal-500 transition">{copy.about}</Link></li>
              <li><Link href={href("/#waitlist")} className="hover:text-teal-500 transition">{copy.waitlist}</Link></li>
              <li><Link href="mailto:admin@khaolak.app" className="hover:text-teal-500 transition">{copy.contact}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-slate-900">{copy.legal}</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><Link href={href("/impressum")} className="hover:text-teal-500 transition">{copy.imprint}</Link></li>
              <li><Link href={href("/datenschutz")} className="hover:text-teal-500 transition">{copy.privacy}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 text-sm text-slate-500 md:flex-row">
          <p>© 2026 Khao Lak Insider. {copy.rights}</p>
          <div className="flex gap-6">
            {/* Hier kannst du später deine echten Profillinks bei href="..." eintragen */}
            <a 
              href="https://www.instagram.com/reise.dich.frei" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-teal-500 transition"
            >
              Instagram
            </a>
            <a 
              href="https://www.youtube.com/@reisedichfrei" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-teal-500 transition"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
