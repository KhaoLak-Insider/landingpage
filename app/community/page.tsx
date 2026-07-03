import Link from "next/link";

const COMMUNITY_CHANNELS = [
  {
    title: "YouTube Community",
    description: "Tausche dich in den Kommentaren unserer Videos mit über 13.000 Khao Lak Fans aus und verpasse keinen Vlog.",
    buttonText: "Kanal besuchen",
    url: "https://www.youtube.com/@reisedichfrei",
    icon: "🎥",
    color: "hover:border-red-500/30 group-hover:text-red-500",
  },
  {
    title: "Instagram Updates",
    description: "Folge unseren täglichen Eindrücken, Live-Updates und Storys direkt aus Thailand.",
    buttonText: "Folgen",
    url: "#", // Hier euren Insta-Link einfügen
    icon: "📸",
    color: "hover:border-pink-500/30 group-hover:text-pink-500",
  },
  {
    title: "Insider Forum (Coming Soon)",
    description: "Hier entsteht ein exklusiver Ort für deine Fragen: Hotels, Routenplanung und die besten lokalen Guides im direkten Austausch.",
    buttonText: "Bald verfügbar",
    url: "#",
    icon: "🏛️",
    color: "hover:border-teal-500/30 group-hover:text-teal-500",
    disabled: true,
  },
];

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-slate-50/40 pb-24">
      {/* HERO SECTION */}
      <section className="bg-white pt-16 pb-20 border-b border-slate-100">
        <div className="container mx-auto px-6 max-w-6xl text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-600 text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full">
            👥 Zusammen statt allein
          </span>
          
          {/* ÜBERSCHRIFT MIT FARBVERLAUF */}
          <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight max-w-3xl mx-auto leading-tight">
            Werde Teil der <br />
            <span className="text-slate-950">Khao Lak </span>
            <span className="bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">
              Insider{" "}
            </span>
            <span className="text-slate-950">Community</span>
          </h1>

          <p className="text-slate-500 text-base md:text-lg max-w-xl mx-auto font-medium leading-relaxed">
            Teile deine Erfahrungen, stelle Fragen an Gleichgesinnte und plane deine Reise gemeinsam mit tausenden Insidern.
          </p>
        </div>
      </section>

      {/* CONTENT AREA */}
      <section className="container mx-auto px-6 max-w-5xl mt-12 space-y-8">
        
        {/* HIGHLIGHT: PREMIUM DISCORD SERVER */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-8 md:p-10 rounded-3xl shadow-[0_10px_30px_-10px_rgba(20,158,148,0.2)] border border-teal-500/20 relative overflow-hidden group">
          {/* Dekorativer Hintergrund-Effekt */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-4xl bg-white/5 w-14 h-14 rounded-xl flex items-center justify-center border border-white/10 shadow-inner">
                  💬
                </span>
                <div className="ml-2">
                  <span className="inline-block bg-teal-400/10 text-teal-400 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md border border-teal-400/20 mb-1">
                    Premium Lounge
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-none">
                    Exklusiver Discord Server
                  </h2>
                </div>
              </div>
              
              <p className="text-slate-300 text-sm md:text-base font-medium max-w-2xl leading-relaxed">
                Dein direkter Draht zu den absoluten Experten. Überspringe die lange Suche im Netz und erhalte punktgenaue Antworten mit echtem Insider-Wissen.
              </p>

              {/* Feature-Liste */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-slate-200 font-semibold">
                <li className="flex items-center gap-2">
                  <span className="text-teal-400 text-lg">⚡</span> Blitzschnelle Antworten auf deine Fragen
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-400 text-lg">🌴</span> Direkter Austausch mit anderen Urlaubern
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-400 text-lg">📍</span> Aktuelle Live-Updates & Geheimtipps vor Ort
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-400 text-lg">💎</span> Exklusive Community von und mit Melo & Marc
                </li>
              </ul>
            </div>

            {/* Preis- & Call-to-Action-Box */}
            <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-4 shadow-2xl backdrop-blur-sm">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Zugang für nur</span>
                <div className="text-3xl font-black text-white">
                  2,00 € <span className="text-sm font-medium text-slate-400">/ Mon.</span>
                </div>
                <span className="text-[11px] text-teal-400 font-bold block">Jederzeit kündbar</span>
              </div>
              <a
                href="#" // Hier euren Discord-Einladungslink/Steady/Patreon-Link einfügen
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full justify-center items-center px-6 py-3.5 rounded-full text-sm font-black bg-teal-500 text-white hover:bg-teal-400 transition-all shadow-[0_4px_20px_rgba(20,158,148,0.3)] text-center scale-100 hover:scale-[1.02] active:scale-[0.98]"
              >
                Jetzt Server beitreten
              </a>
            </div>
          </div>
        </div>

        {/* RESTLICHEN KANÄLE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COMMUNITY_CHANNELS.map((channel, index) => (
            <div
              key={index}
              className={`bg-white p-6 rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col justify-between group ${channel.color}`}
            >
              <div className="space-y-3">
                <div className="text-3xl bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100">
                  {channel.icon}
                </div>
                <h2 className="text-lg font-black text-slate-900 leading-tight">
                  {channel.title}
                </h2>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  {channel.description}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-50">
                {channel.disabled ? (
                  <span className="inline-flex w-full justify-center items-center px-4 py-2.5 rounded-full text-xs font-bold bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed">
                    {channel.buttonText}
                  </span>
                ) : (
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full justify-center items-center px-4 py-2.5 rounded-full text-xs font-bold bg-slate-950 text-white hover:bg-teal-500 transition-colors shadow-sm text-center"
                  >
                    {channel.buttonText}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* GUIDELINES NOTE */}
        <div className="bg-teal-50/40 border border-teal-100/50 rounded-2xl p-6 text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold text-teal-700/80 tracking-wide uppercase">🤝 Unser Versprechen</p>
          <p className="text-slate-500 text-xs font-medium mt-1 leading-relaxed">
            Egal wo wir uns austauschen: Wir legen Wert auf einen respektvollen, freundlichen und hilfsbereiten Umgang. Spammer und unhöfliche Beiträge fliegen sofort raus.
          </p>
        </div>
      </section>
    </main>
  );
}