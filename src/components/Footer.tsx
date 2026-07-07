// app/components/Footer.tsx
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-8 py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Image src="/images/logo-footer.svg" alt="Khao Lak Insider" width={260} height={260} className="h-auto w-[220px]" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-600">Der smarte Reiseführer für Khao Lak. Entdecke Strände, Restaurants, Märkte, Tempel und echte Geheimtipps in einer App.</p>
            <p className="mt-6 text-sm font-semibold text-teal-600">App-Start 2026</p>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-slate-900">App</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><Link href="/#features" className="hover:text-teal-500 transition">Features</Link></li>
              <li><Link href="/planen" className="hover:text-teal-500 transition">Interaktive Karte</Link></li>
              <li><Link href="/planen" className="hover:text-teal-500 transition">Reiseplaner</Link></li>
              <li><Link href="/favorites" className="hover:text-teal-500 transition">Favoriten</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-slate-900">Unternehmen</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><Link href="/#about" className="hover:text-teal-500 transition">Über uns</Link></li>
              <li><Link href="/#waitlist" className="hover:text-teal-500 transition">Warteliste</Link></li>
              <li><Link href="mailto:admin@khaolak.app" className="hover:text-teal-500 transition">Kontakt</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-slate-900">Rechtliches</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><Link href="/impressum" className="hover:text-teal-500 transition">Impressum</Link></li>
              <li><Link href="/datenschutz" className="hover:text-teal-500 transition">Datenschutz</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 text-sm text-slate-500 md:flex-row">
          <p>© 2026 Khao Lak Insider. Alle Rechte vorbehalten.</p>
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