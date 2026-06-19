import Image from "next/image";

const features = [
  ["📍", "Interaktive Karte", "Alle Orte auf einen Blick – später auch offline verfügbar."],
  ["🗓️", "Reise planen", "Plane perfekte Urlaubstage mit Stränden, Märkten und Restaurants."],
  ["♡", "Favoriten", "Speichere deine Lieblingsorte für später."],
  ["★", "Geheimtipps", "Entdecke Orte abseits der typischen Touristenpfade."],
  ["🎒", "Packliste", "Nie wieder etwas Wichtiges für Thailand vergessen."],
  ["🤖", "KI-Assistent", "Erhalte Antworten und Tipps rund um Khao Lak."],
];

const categories = [
  ["Strände", "Traumhafte Strände und kristallklares Wasser", "/images/beach.png"],
  ["Märkte", "Lokale Märkte mit Street Food und frischen Produkten", "/images/market.png"],
  ["Natur", "Dschungel, Wasserfälle und Nationalparks", "/images/nature.png"],
  ["Essen & Trinken", "Restaurants, Cafés und besondere Genussorte", "/images/food.png"],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="relative min-h-[820px] overflow-hidden bg-[url('/images/hero.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/55 to-slate-900/25" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-8 py-1 text-white">
          <Image
            src="/images/logo.png"
            alt="Khao Lak Insider"
            width={220}
            height={80}
            priority
            className="w-[220px] h-auto"
          />

          <div className="hidden gap-10 text-sm font-semibold md:flex">
            <a href="#">Entdecken</a>
            <a href="#">Planen</a>
            <a href="#">Erleben</a>
            <a href="#">Favoriten</a>
            <a href="#">Community</a>
          </div>

          <button className="rounded-full bg-teal-500 px-7 py-3.5 text-sm font-bold shadow-xl shadow-teal-950/30 transition hover:bg-teal-400">
            Zur Warteliste
          </button>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-8 pt-0 md:-mt-28 md:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-3xl text-white">
            <div className="mb-6 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              Neuer smarter Reiseführer für Khao Lak
            </div>

            <h1 className="text-6xl font-black leading-[1.05] tracking-tight md:text-7xl">
              Entdecke Khao Lak
              <br />
              wie ein <span className="text-teal-300">Insider</span>
            </h1>

            <p className="mt-7 max-w-2xl text-xl leading-relaxed text-white/90">
              Die schönsten Strände, Märkte, Tempel, Restaurants und Geheimtipps
              in einer App – persönlich kuratiert und perfekt für deinen Urlaub.
            </p>

            <div className="mt-8 grid max-w-xl gap-3 text-base font-medium text-white/95 sm:grid-cols-2">
              <div>✓ Über 800 Guide-Käufer</div>
              <div>✓ Offline nutzbar geplant</div>
              <div>✓ Persönliche Empfehlungen</div>
              <div>✓ Für Android & iPhone</div>
            </div>

            <div className="mt-10 flex flex-wrap gap-5">
              <button className="rounded-full bg-teal-500 px-9 py-4 font-bold text-white shadow-xl shadow-teal-950/30 transition hover:bg-teal-400">
                Start nicht verpassen
              </button>
              <button className="rounded-full border border-white/70 bg-white/10 px-9 py-4 font-bold text-white backdrop-blur transition hover:bg-white/20">
                App ansehen
              </button>
            </div>

            <div className="mt-10 flex flex-wrap gap-8 text-sm text-white/90">
              <div>🏝️ Bald für deinen Khao-Lak-Urlaub</div>
              <div>🌴 Persönlich kuratierte Insider-Tipps</div>
            </div>
          </div>

          <div className="hidden justify-end md:flex">
            <div className="relative">
              <div className="absolute -inset-10 rounded-full bg-teal-400/20 blur-3xl" />
              <Image
                src="/images/home-screen.png"
                alt="Khao Lak Insider App"
                width={540}
                height={1060}
                priority
                className="relative z-10 drop-shadow-[0_35px_80px_rgba(0,0,0,0.45)]"
              />
            </div>
          </div>
        </div>

        <svg
          className="absolute -bottom-1 left-0 w-full"
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
        >
          <path
            fill="white"
            d="M0,58 C260,50 430,48 650,56 C850,64 1030,72 1230,62 C1320,58 1390,54 1440,58 L1440,90 L0,90 Z"
          />
        </svg>
      </section>

      <section className="relative z-20 mx-auto mt-10 grid max-w-7xl grid-cols-2 gap-6 px-8 pb-24 md:grid-cols-3">
        {features.map(([icon, title, text]) => (
          <div
            key={title}
            className="rounded-3xl bg-white p-8 text-center shadow-xl shadow-slate-200/80 transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="text-5xl">{icon}</div>
            <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">{text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-8 py-0 md:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col justify-center">
          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            Entdecke <span className="text-teal-500">Khao Lak</span>
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-600">
            Von traumhaften Stränden über lokale Märkte bis hin zu versteckten
            Wasserfällen – Khao Lak hat so viel zu bieten.
          </p>
          <button className="mt-8 w-fit rounded-full border border-teal-500 px-7 py-3 font-bold text-teal-600 transition hover:bg-teal-50">
            Alle Orte entdecken
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {categories.map(([title, text, image]) => (
            <div
              key={title}
              className="group relative h-80 overflow-hidden rounded-3xl shadow-xl"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url('${image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />
              <div className="absolute bottom-0 p-6 text-white">
                <h3 className="text-2xl font-black">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/85">{text}</p>
                <div className="mt-4 text-sm font-bold">Mehr anzeigen →</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-8 py-20 md:grid-cols-[0.7fr_1.3fr]">
        <div>
          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            Dein Urlaub.
            <br />
            Perfekt <span className="text-teal-500">organisiert.</span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-600">
            Alle Informationen, die du brauchst – übersichtlich, griffbereit und
            perfekt für deinen Khao-Lak-Urlaub vorbereitet.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white">
              App Store
            </button>
            <button className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white">
              Google Play
            </button>
          </div>
        </div>

        <div className="grid items-end gap-6 sm:grid-cols-3">
          <Image src="/images/home-screen.png" alt="Home Screen" width={280} height={560} className="mx-auto" />
          <Image src="/images/map-screen.png" alt="Kartenansicht" width={280} height={560} className="mx-auto" />
          <Image src="/images/planer-screen.png" alt="Reiseplaner" width={280} height={560} className="mx-auto" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 py-12">
        <div className="grid gap-8 text-center md:grid-cols-3">
          <div>
            <div className="text-5xl font-black text-teal-500">800+</div>
            <p className="mt-3 text-slate-600">Verkaufte Khao-Lak-Guides.</p>
          </div>
          <div>
            <div className="text-5xl font-black text-teal-500">100+</div>
            <p className="mt-3 text-slate-600">Orte, Strände, Restaurants und Geheimtipps.</p>
          </div>
          <div>
            <div className="text-5xl font-black text-teal-500">2026</div>
            <p className="mt-3 text-slate-600">Start der Khao Lak Insider App.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
