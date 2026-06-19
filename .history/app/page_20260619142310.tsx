const features = [
  ["📍", "Interaktive Karte", "Alle Orte auf einen Blick – später auch offline verfügbar."],
  ["🗓️", "Reise planen", "Plane perfekte Urlaubstage mit Stränden, Märkten und Restaurants."],
  ["♡", "Favoriten", "Speichere deine Lieblingsorte für später."],
  ["★", "Geheimtipps", "Entdecke Orte abseits der typischen Touristenpfade."],
  ["🎒", "Packliste", "Nie wieder etwas Wichtiges für Thailand vergessen."],
  ["🤖", "KI-Assistent", "Erhalte Antworten und Tipps rund um Khao Lak."],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="relative min-h-[820px] overflow-hidden bg-[url('/images/hero.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/55 to-slate-900/25" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-8 py-7 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white text-3xl">
              🌴
            </div>
            <div>
              <div className="text-3xl font-extrabold leading-none">Khao Lak</div>
              <div className="tracking-[0.34em] text-xs font-semibold uppercase">Insider</div>
            </div>
          </div>

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

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-8 pt-24 md:grid-cols-[1.05fr_0.95fr]">
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
              <div className="font-semibold text-yellow-300">
                ★★★★★ <span className="text-white">4,9 Bewertung</span>
              </div>
              <div>🏝️ Bald für deinen Khao-Lak-Urlaub</div>
            </div>
          </div>

          <div className="hidden justify-end md:flex">
            <div className="relative">
              <div className="absolute -inset-8 rounded-full bg-teal-400/20 blur-3xl" />

              <div className="relative h-[660px] w-[330px] rounded-[3.5rem] border-[11px] border-slate-950 bg-white p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                <div className="absolute left-1/2 top-3 h-7 w-28 -translate-x-1/2 rounded-full bg-slate-950" />

                <div className="mt-11">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900">Sawadee 👋</h2>
                      <p className="text-sm text-slate-500">Schön, dass du hier bist!</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border text-teal-600">
                      i
                    </div>
                  </div>

                  <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-xl">
                    <div className="p-4">
                      <p className="font-bold">Urlaub in Khao Lak</p>
                      <div className="mt-3 grid grid-cols-4 gap-2 text-center text-teal-600">
                        <div><b>08</b><br /><span className="text-xs text-slate-500">Tage</span></div>
                        <div><b>14</b><br /><span className="text-xs text-slate-500">Std.</span></div>
                        <div><b>37</b><br /><span className="text-xs text-slate-500">Min.</span></div>
                        <div><b>22</b><br /><span className="text-xs text-slate-500">Sek.</span></div>
                      </div>
                    </div>
                    <div className="h-20 bg-[url('/images/beach.png')] bg-cover bg-center" />
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold">Wetter heute</h3>
                      <span className="text-xs font-semibold text-teal-600">Mehr anzeigen</span>
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {["31°", "20%", "29°", "74%"].map((x) => (
                        <div
                          key={x}
                          className="rounded-xl bg-slate-50 p-3 text-center text-sm shadow"
                        >
                          {x}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 overflow-hidden rounded-3xl bg-slate-50 shadow">
                    <div className="h-28 bg-[url('/images/hero.png')] bg-cover bg-center" />
                    <div className="p-4">
                      <p className="font-bold">Bang Niang Beach</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Wunderschöner Strand mit traumhaftem Sonnenuntergang.
                      </p>
                    </div>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 flex justify-around rounded-2xl bg-white py-3 text-xs shadow-xl">
                    <span>🏝️</span>
                    <span>🗺️</span>
                    <span>🗓️</span>
                    <span>♡</span>
                    <span>☰</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-28 rounded-t-[55%] bg-white" />
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

      <section className="mx-auto max-w-7xl px-8 py-24">
        <div className="grid gap-8 text-center md:grid-cols-3">
          <div>
            <div className="text-5xl font-black text-teal-500">800+</div>
            <p className="mt-3 text-slate-600">
              Reisende haben bereits unsere Guides genutzt.
            </p>
          </div>

          <div>
            <div className="text-5xl font-black text-teal-500">100+</div>
            <p className="mt-3 text-slate-600">
              Strände, Märkte, Restaurants und Geheimtipps.
            </p>
          </div>

          <div>
            <div className="text-5xl font-black text-teal-500">4.9★</div>
            <p className="mt-3 text-slate-600">
              Durchschnittliche Bewertung unserer Inhalte.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}