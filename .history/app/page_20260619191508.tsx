"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { supabase } from "@/src/lib/supabase";

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
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const joinWaitlist = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setMessageType("error");
      setMessage("Bitte gib eine E-Mail-Adresse ein.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("waitlist")
      .insert([{ email: normalizedEmail }]);

    if (error) {
      setMessageType("error");

      if (error.code === "23505") {
        setMessage("✅ Diese E-Mail-Adresse steht bereits auf unserer Warteliste.");
      } else {
        setMessage("Leider gab es ein Problem. Bitte versuche es später erneut.");
      }
    } else {
      setMessageType("success");
      setMessage("🎉 Perfekt! Dein Platz auf der Warteliste ist reserviert. Wir informieren dich zum App-Start.");
      setEmail("");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="relative min-h-[820px] overflow-hidden bg-[url('/images/hero.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/55 to-slate-900/25" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-start justify-between px-8 py-1 text-white">
          <Image
            src="/images/logo.svg"
            alt="Khao Lak Insider"
            width={220}
            height={80}
            priority
            className="h-auto w-[180px]"
          />

          <div className="hidden gap-10 text-sm font-semibold md:flex">
            <a href="#">Entdecken</a>
            <a href="#">Planen</a>
            <a href="#">Erleben</a>
            <a href="#">Favoriten</a>
            <a href="#">Community</a>
          </div>

          <a
            href="#waitlist"
            className="rounded-full bg-teal-500 px-7 py-3.5 text-sm font-bold shadow-xl shadow-teal-950/30 transition hover:bg-teal-400"
          >
            Zur Warteliste
          </a>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-8 pt-0 md:grid-cols-[1.05fr_0.95fr]">
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
              <a
                href="#waitlist"
                className="rounded-full bg-teal-500 px-9 py-4 font-bold text-white shadow-xl shadow-teal-950/30 transition hover:bg-teal-400"
              >
                Start nicht verpassen
              </a>
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
            <Image
              src="/images/home-screen.png"
              alt="Khao Lak Insider App"
              width={540}
              height={1060}
              priority
              className="relative z-10"
            />
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

      <section className="relative z-20 mx-auto -mt-6 grid max-w-7xl grid-cols-2 gap-6 px-8 pb-24 md:grid-cols-6">
        {features.map(([icon, title, text]) => (
          <div
            key={title}
            className="rounded-3xl bg-white p-6 text-center shadow-xl shadow-slate-200/80 transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-4xl text-teal-600">
              {icon}
            </div>
            <h3 className="mt-5 text-base font-extrabold">{title}</h3>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">{text}</p>
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

      <section className="relative mt-24 overflow-hidden bg-gradient-to-b from-white via-teal-50/70 to-white px-8 py-28">
        <div className="absolute left-1/2 top-20 h-80 w-80 -translate-x-1/2 rounded-full bg-teal-200/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-20 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="mb-5 inline-flex rounded-full bg-teal-100 px-4 py-2 text-sm font-bold text-teal-700">
              Alles für deinen Urlaub
            </div>

            <h2 className="text-5xl font-black leading-[1.05] tracking-tight md:text-6xl">
              Dein Urlaub.
              <br />
              Perfekt <span className="text-teal-500">organisiert.</span>
            </h2>

            <p className="mt-7 max-w-md text-lg leading-relaxed text-slate-600">
              Plane deine Tage, speichere Lieblingsorte und finde jederzeit genau
              das, was zu deinem Urlaub passt – übersichtlich in einer App.
            </p>

            <div className="mt-8 space-y-4 text-base font-semibold text-slate-700">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500 text-sm text-white">
                  ✓
                </span>
                Persönliche Favoriten speichern
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500 text-sm text-white">
                  ✓
                </span>
                Tagesausflüge einfach planen
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500 text-sm text-white">
                  ✓
                </span>
                Strände, Märkte und Restaurants schnell finden
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#waitlist"
                className="rounded-full bg-teal-500 px-8 py-4 font-bold text-white shadow-xl shadow-teal-200 transition hover:bg-teal-400"
              >
                Zur Warteliste
              </a>

              <div className="rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-600 shadow-sm">
                App startet 2026
              </div>
            </div>
          </div>

          <div className="relative flex min-h-[560px] items-center justify-center">
            <div className="absolute h-[430px] w-[430px] rounded-full bg-white shadow-2xl shadow-teal-100" />

            <Image
              src="/images/home-screen.png"
              alt="Home Screen"
              width={280}
              height={560}
              className="absolute left-[4%] top-24 z-10 hidden rotate-[-8deg] md:block"
            />

            <Image
              src="/images/map-screen.png"
              alt="Kartenansicht"
              width={330}
              height={620}
              className="relative z-20"
            />

            <Image
              src="/images/planer-screen.png"
              alt="Reiseplaner"
              width={280}
              height={560}
              className="absolute right-[4%] top-24 z-10 hidden rotate-[8deg] md:block"
            />
          </div>
        </div>
      </section>

<section className="mx-auto grid max-w-7xl items-center gap-16 px-8 py-24 md:grid-cols-[1fr_1fr]">
  <div className="relative flex justify-center">
    <div className="absolute top-16 h-72 w-72 rounded-full bg-teal-100 blur-3xl" />

    <Image
      src="/images/map-screen.png"
      alt="Interaktive Karte"
      width={430}
      height={860}
      className="relative z-10"
    />
  </div>

  <div>
    <div className="mb-5 inline-flex rounded-full bg-teal-100 px-4 py-2 text-sm font-bold text-teal-700">
      Interaktive Karte
    </div>

    <h2 className="text-4xl font-black leading-tight tracking-tight md:text-5xl">
      Finde die schönsten Orte
      <br />
      auf einen <span className="text-teal-500">Blick.</span>
    </h2>

    <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-600">
      Strände, Märkte, Restaurants, Tempel und Geheimtipps – alles übersichtlich
      auf der Karte und perfekt für deinen Urlaub sortiert.
    </p>

    <div className="mt-8 space-y-4 text-base font-semibold text-slate-700">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500 text-sm text-white">
          ✓
        </span>
        Alle Orte auf einen Blick
      </div>

      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500 text-sm text-white">
          ✓
        </span>
        Nach Stränden, Märkten & Restaurants filtern
      </div>

      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500 text-sm text-white">
          ✓
        </span>
        Entfernungen und Details direkt sehen
      </div>

      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500 text-sm text-white">
          ✓
        </span>
        Offline-Nutzung später geplant
      </div>
    </div>
  </div>
</section>

      <section className="mx-auto max-w-7xl px-8 py-16">
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

<section id="waitlist" className="px-8 py-20">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] bg-gradient-to-br from-teal-500 to-teal-600 px-8 py-16 text-center text-white shadow-2xl shadow-teal-100">
          <div className="mb-4 inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur">
            Khao Lak Insider App
          </div>

          <h2 className="text-4xl font-black leading-tight md:text-5xl">
            Verpasse den Start nicht.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/90">
            Trage dich unverbindlich in die Warteliste ein und erfahre als Erster,
            wenn die Khao Lak Insider App startet.
          </p>

          <form
            onSubmit={joinWaitlist}
            className="mx-auto mt-9 flex max-w-xl flex-col gap-4 rounded-3xl bg-white p-2 shadow-xl sm:flex-row sm:rounded-full"
          >
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Deine E-Mail-Adresse"
              className="h-12 flex-1 rounded-full px-5 text-slate-900 outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="h-12 rounded-full bg-slate-950 px-7 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Speichern..." : "Zur Warteliste"}
            </button>
          </form>

          {message && (
  <div
    className={`mt-4 inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
      messageType === "success"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-red-100 text-red-700"
    }`}
  >
    {message}
  </div>
)}

          <p className="mt-4 text-sm text-white/75">
            Kein Spam. Nur Informationen zum App-Start.
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
  <div className="mx-auto max-w-7xl px-8 py-16">
    <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">

     <div>
  <Image
  src="/images/logo-footer.svg"
  alt="Khao Lak Insider"
  width={260}
  height={260}
  className="h-auto w-[220px]"
/>

        <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-600">
          Der smarte Reiseführer für Khao Lak. Entdecke Strände,
          Restaurants, Märkte, Tempel und echte Geheimtipps in einer App.
        </p>

        <p className="mt-6 text-sm font-semibold text-teal-600">
          App-Start 2026
        </p>
      </div>

      <div>
        <h4 className="mb-4 font-bold text-slate-900">
          App
        </h4>

        <ul className="space-y-3 text-sm text-slate-600">
          <li><a href="#">Features</a></li>
          <li><a href="#">Interaktive Karte</a></li>
          <li><a href="#">Reiseplaner</a></li>
          <li><a href="#">Favoriten</a></li>
        </ul>
      </div>

      <div>
        <h4 className="mb-4 font-bold text-slate-900">
          Unternehmen
        </h4>

        <ul className="space-y-3 text-sm text-slate-600">
          <li><a href="#">Über uns</a></li>
          <li><a href="#">Warteliste</a></li>
          <li><a href="#">Kontakt</a></li>
        </ul>
      </div>

      <div>
        <h4 className="mb-4 font-bold text-slate-900">
          Rechtliches
        </h4>

        <ul className="space-y-3 text-sm text-slate-600">
          <li><a href="/impressum">Impressum</a></li>
          <li><a href="/datenschutz">Datenschutz</a></li>
        </ul>
      </div>

    </div>

    <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 text-sm text-slate-500 md:flex-row">
      <p>
        © 2026 Khao Lak Insider. Alle Rechte vorbehalten.
      </p>

      <div className="flex gap-6">
        <a href="#" className="hover:text-teal-500 transition">
          Instagram
        </a>

        <a href="#" className="hover:text-teal-500 transition">
          YouTube
        </a>

        <a href="#" className="hover:text-teal-500 transition">
          Facebook
        </a>
      </div>
    </div>
  </div>
</footer>
    </main>
  );
}