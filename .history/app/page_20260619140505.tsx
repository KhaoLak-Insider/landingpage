export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="relative min-h-[760px] overflow-hidden bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2400&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-900/45 to-slate-900/20" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-8 py-7 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white text-2xl">
              🌴
            </div>
            <div>
              <div className="text-2xl font-bold leading-none">Khao Lak</div>
              <div className="tracking-[0.28em] text-xs uppercase">Insider</div>
            </div>
          </div>

          <div className="hidden gap-10 text-sm font-medium md:flex">
            <a>Entdecken</a>
            <a>Planen</a>
            <a>Erleben</a>
            <a>Favoriten</a>
            <a>Community</a>
          </div>

          <button className="rounded-full bg-teal-500 px-6 py-3 text-sm font-bold shadow-lg shadow-teal-900/30">
            Zur Warteliste
          </button>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-8 pt-16 md:grid-cols-2">
          <div className="max-w-2xl text-white">
            <h1 className="text-6xl font-extrabold leading-tight md:text-7xl">
              Dein perfekter <br />
              Begleiter für <br />
              <span className="text-teal-300">Khao Lak</span>
            </h1>

            <p className="mt-7 max-w-xl text-xl leading-relaxed text-white/90">
              Entdecke die schönsten Orte, versteckte Geheimtipps und echte
              Empfehlungen – bald als smarter Reiseführer für deinen Urlaub.
            </p>

            <div className="mt-10 flex flex-wrap gap-5">
              <button className="rounded-full bg-teal-500 px-8 py-4 font-bold text-white shadow-xl shadow-teal-950/30">
                Start nicht verpassen
              </button>
              <button className="rounded-full border border-white/70 bg-white/10 px-8 py-4 font-bold text-white backdrop-blur">
                App ansehen
              </button>
            </div>

            <div className="mt-10 flex gap-10 text-sm text-white/90">
              <div>★★★★★ 4,9 Bewertung</div>
              <div>Über 800+ Guide-Käufer</div>
            </div>
          </div>

          <div className="hidden justify-center md:flex">
            <div className="relative h-[620px] w-[310px] rounded-[3rem] border-[10px] border-slate-950 bg-white p-5 shadow-2xl">
              <div className="absolute left-1/2 top-3 h-7 w-28 -translate-x-1/2 rounded-full bg-slate-950" />
              <div className="mt-10">
                <h2 className="text-2xl font-bold text-slate-900">Sawadee 👋</h2>
                <p className="text-sm text-slate-500">Schön, dass du hier bist!</p>

                <div className="mt-6 rounded-2xl bg-white p-4 shadow-xl">
                  <p className="font-bold">Urlaub in Khao Lak</p>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center text-teal-600">
                    <div><b>08</b><br /><span className="text-xs">Tage</span></div>
                    <div><b>14</b><br /><span className="text-xs">Std.</span></div>
                    <div><b>37</b><br /><span className="text-xs">Min.</span></div>
                    <div><b>22</b><br /><span className="text-xs">Sek.</span></div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-bold">Wetter heute</h3>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {["31°", "20%", "29°", "74%"].map((x) => (
                      <div key={x} className="rounded-xl bg-slate-50 p-3 text-center text-sm shadow">
                        {x}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-3 shadow">
                  <div className="h-24 rounded-xl bg-teal-200" />
                  <p className="mt-3 font-bold">Bang Niang Beach</p>
                  <p className="text-xs text-slate-500">
                    Wunderschöner Strand mit traumhaftem Sonnenuntergang.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 rounded-t-[50%] bg-white" />
      </section>

      <section className="mx-auto -mt-10 grid max-w-7xl grid-cols-2 gap-6 px-8 pb-20 md:grid-cols-6">
        {[
          ["📍", "Interaktive Karte"],
          ["🗓️", "Reise planen"],
          ["♡", "Favoriten"],
          ["★", "Geheimtipps"],
          ["🎒", "Packliste"],
          ["🤖", "KI-Assistent"],
        ].map(([icon, title]) => (
          <div key={title} className="relative z-20 rounded-3xl bg-white p-6 text-center shadow-xl">
            <div className="text-4xl">{icon}</div>
            <h3 className="mt-4 font-bold">{title}</h3>
            <p className="mt-2 text-xs text-slate-500">
              Alles für deinen Khao-Lak-Urlaub.
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}