import Link from "next/link";

const COMMUNITY_CHANNELS = [
  {
    title: "YouTube Community",
    description: "Tausche dich in den Kommentaren unserer Videos mit über 13.000 Khao Lak Fans aus und verpasse keinen Vlog.",
    buttonText: "Kanal besuchen",
    url: "https://www.youtube.com/@reisedichfrei",
    icon: (
      <svg className="w-7 h-7 text-[#FF0000] fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    color: "hover:border-red-500/30 group-hover:text-red-500",
  },
  {
    title: "Instagram Updates",
    description: "Folge unseren täglichen Eindrücken, Live-Updates und Storys direkt aus Thailand.",
    buttonText: "Folgen",
    url: "#", // Hier euren Insta-Link einfügen
    icon: (
      <svg className="w-7 h-7 text-[#E1306C] stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    ),
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
                <span className="bg-white/5 w-14 h-14 rounded-xl flex items-center justify-center border border-white/10 shadow-inner">
                  {/* Discord SVG Logo */}
                  <svg className="w-7 h-7 text-[#5865F2] fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.298 12.298 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
                  </svg>
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
                  {typeof channel.icon === "string" ? (
                    <span>{channel.icon}</span>
                  ) : (
                    channel.icon
                  )}
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