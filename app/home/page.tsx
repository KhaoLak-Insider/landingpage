import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Compass,
  Heart,
  Map,
  MapPin,
  Palmtree,
  Search,
  Sparkles,
  Star,
  Sun,
  Utensils,
  Waves,
} from "lucide-react";

const BASE_URL = "https://www.khaolak.app";
const PAGE_URL = `${BASE_URL}/de`;

const germanMetadata: Metadata = {
  title: "Khao Lak Reiseführer: Strände, Ausflüge & Insider-Tipps",
  description:
    "Dein Khao-Lak-Reiseführer mit den schönsten Stränden, Ausflügen, Restaurants, Märkten und echten Insider-Tipps für einen perfekt geplanten Thailand-Urlaub.",
  keywords: [
    "Khao Lak",
    "Khao Lak Reiseführer",
    "Khao Lak Urlaub",
    "Khao Lak Tipps",
    "Khao Lak Sehenswürdigkeiten",
    "Khao Lak Strände",
    "Khao Lak Ausflüge",
    "Khao Lak Restaurants",
  ],
  alternates: {
    canonical: PAGE_URL,
    languages: {
      de: `${BASE_URL}/de`,
      en: `${BASE_URL}/en`,
      "x-default": `${BASE_URL}/de`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    siteName: "Khao Lak Insider",
    locale: "de_DE",
    title: "Khao Lak Reiseführer – entdecke Khao Lak wie ein Insider",
    description:
      "Strände, Ausflüge, Restaurants, Märkte und praktische Tipps für deinen Khao-Lak-Urlaub – persönlich ausgewählt und übersichtlich geplant.",
    images: [
      {
        url: `${BASE_URL}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Khao Lak Insider Reiseführer für Thailand",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Khao Lak Reiseführer – Tipps für deinen Urlaub",
    description:
      "Entdecke Khao Laks schönste Strände, Ausflüge, Restaurants und echte Insider-Tipps.",
    images: [`${BASE_URL}/images/og-image.jpg`],
  },
};

const englishMetadata: Metadata = {
  title: "Khao Lak Travel Guide: Beaches, Trips & Insider Tips",
  description:
    "Your Khao Lak travel guide to beautiful beaches, excursions, restaurants, markets and genuine insider tips for a perfectly planned Thailand holiday.",
  alternates: {
    canonical: `${BASE_URL}/en`,
    languages: {
      de: `${BASE_URL}/de`,
      en: `${BASE_URL}/en`,
      "x-default": `${BASE_URL}/de`,
    },
  },
  robots: germanMetadata.robots,
  openGraph: {
    type: "website",
    url: `${BASE_URL}/en`,
    siteName: "Khao Lak Insider",
    locale: "en_GB",
    title: "Discover Khao Lak like an insider",
    description:
      "Beaches, excursions, restaurants, markets and practical tips for your Khao Lak holiday.",
    images: germanMetadata.openGraph?.images,
  },
  twitter: {
    card: "summary_large_image",
    title: "Khao Lak Travel Guide & Insider Tips",
    description:
      "Discover Khao Lak's beaches, excursions, restaurants and hidden gems.",
    images: [`${BASE_URL}/images/og-image.jpg`],
  },
};

interface HomePageProps {
  searchParams: Promise<{ lng?: string | string[] }>;
}

export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  const lng = (await searchParams).lng;
  return (Array.isArray(lng) ? lng[0] : lng) === "en"
    ? englishMetadata
    : germanMetadata;
}

const discoveryCards = [
  {
    title: "Die schönsten Strände",
    text: "Von weitläufigen Sandstränden bis zu ruhigen Buchten: Finde den Strand, der zu deinem Urlaubstag passt.",
    image: "/images/beach.png",
    icon: Waves,
    href: "/de/entdecken",
    label: "Strände entdecken",
  },
  {
    title: "Essen wie ein Local",
    text: "Authentische Thai-Küche, entspannte Beach Bars und Restaurants, die wir wirklich empfehlen würden.",
    image: "/images/food.png",
    icon: Utensils,
    href: "/de/entdecken",
    label: "Restaurants finden",
  },
  {
    title: "Märkte & echtes Leben",
    text: "Street Food, Handwerk und lokale Atmosphäre: Diese Märkte gehören zu einem Khao-Lak-Urlaub dazu.",
    image: "/images/market.png",
    icon: Sparkles,
    href: "/de/entdecken",
    label: "Märkte ansehen",
  },
  {
    title: "Natur & Abenteuer",
    text: "Wasserfälle, Dschungel und Nationalparks rund um Khao Lak – inklusive Tipps für die beste Besuchszeit.",
    image: "/images/nature.png",
    icon: Palmtree,
    href: "/de/entdecken",
    label: "Natur erleben",
  },
];

const planningSteps = [
  {
    number: "01",
    title: "Khao Lak entdecken",
    text: "Durchsuche Strände, Restaurants, Märkte, Tempel und Ausflugsziele nach deinen Interessen.",
    icon: Search,
  },
  {
    number: "02",
    title: "Favoriten sammeln",
    text: "Speichere die Orte, die du während deiner Reise auf keinen Fall verpassen möchtest.",
    icon: Heart,
  },
  {
    number: "03",
    title: "Urlaubstage planen",
    text: "Stelle aus deinen Lieblingsorten entspannte Tage zusammen, ohne unnötige Wege und Stress.",
    icon: CalendarDays,
  },
];

const faqItems = [
  {
    question: "Wann ist die beste Reisezeit für Khao Lak?",
    answer:
      "Die beliebteste Reisezeit für Khao Lak liegt meist zwischen November und April. Dann ist es häufig trockener und das Meer ruhiger. In der grünen Jahreszeit von Mai bis Oktober ist die Region üppig und oft ruhiger, allerdings sind kräftige Schauer und höherer Wellengang möglich.",
  },
  {
    question: "Welche Strände in Khao Lak sind besonders schön?",
    answer:
      "Zu den bekannten Küstenabschnitten gehören Nang Thong Beach, Bang Niang Beach, Khuk Khak Beach und White Sand Beach. Welcher Strand ideal ist, hängt davon ab, ob du kurze Wege, Restaurants in der Nähe oder besonders viel Ruhe suchst.",
  },
  {
    question: "Was kann man in Khao Lak unternehmen?",
    answer:
      "Neben entspannten Strandtagen bieten sich Märkte, Tempel, Wasserfälle und Ausflüge in die umliegende Natur an. Beliebt sind außerdem Bootsausflüge, Schnorcheln sowie Touren in Nationalparks. Bedingungen und Verfügbarkeit können saisonal variieren.",
  },
  {
    question: "Für wen eignet sich Khao Lak?",
    answer:
      "Khao Lak eignet sich besonders für Reisende, die Thailand entspannt erleben möchten. Familien, Paare, Genießer und Naturfans finden eine gute Mischung aus ruhigen Stränden, Ausflügen, lokaler Küche und überschaubaren Urlaubsorten.",
  },
  {
    question: "Was macht Khao Lak Insider anders?",
    answer:
      "Khao Lak Insider verbindet persönlich ausgewählte Orte mit praktischer Reiseplanung. Statt einer unübersichtlichen Liste findest du konkrete Spot-Informationen, Entfernungen, passende Besuchszeiten und Inspiration für deine Urlaubstage an einem Ort.",
  },
];

function jsonLd(value: Record<string, unknown>) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const lng = (await searchParams).lng;
  const language = (Array.isArray(lng) ? lng[0] : lng) === "en" ? "en" : "de";

  if (language === "en") {
    return <EnglishHomePage />;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: "Khao Lak Reiseführer: Strände, Ausflüge & Insider-Tipps",
        description:
          "Reiseführer für Khao Lak mit Stränden, Sehenswürdigkeiten, Restaurants, Märkten, Ausflügen und Insider-Tipps.",
        inLanguage: "de-DE",
        isPartOf: {
          "@type": "WebSite",
          "@id": `${BASE_URL}/#website`,
          url: BASE_URL,
          name: "Khao Lak Insider",
        },
        about: {
          "@type": "Place",
          name: "Khao Lak",
          address: {
            "@type": "PostalAddress",
            addressRegion: "Phang Nga",
            addressCountry: "TH",
          },
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${BASE_URL}/images/hero.png`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Khao Lak Insider",
            item: BASE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Khao Lak Reiseführer",
            item: PAGE_URL,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${PAGE_URL}#faq`,
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <article className="overflow-hidden bg-[#f7faf9] text-[#10233f]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />

      <section className="relative min-h-[720px] overflow-hidden bg-[#10233f] lg:min-h-[780px]">
        <Image
          src="/images/hero.png"
          alt="Tropischer Strand in Khao Lak, Thailand"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,18,31,.9)_0%,rgba(5,18,31,.68)_46%,rgba(5,18,31,.15)_78%),linear-gradient(0deg,rgba(4,13,22,.52)_0%,transparent_55%)]" />

        <div className="relative z-10 mx-auto flex min-h-[720px] max-w-7xl items-center px-6 py-20 lg:min-h-[780px] lg:px-8">
          <div className="max-w-3xl text-white">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#079ca5] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] shadow-lg shadow-cyan-950/20">
              <MapPin size={14} /> Dein digitaler Khao-Lak-Reiseführer
            </div>
            <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Khao Lak entdecken.
              <br />
              <span className="text-[#55d7d1]">Wie ein Insider.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/90 sm:text-xl">
              Die schönsten Strände, echte Lieblingsrestaurants, besondere
              Ausflüge und hilfreiche Tipps für deinen Khao-Lak-Urlaub –
              persönlich ausgewählt und einfach an einem Ort geplant.
            </p>
            <div className="mt-9 flex flex-wrap gap-3 text-sm font-semibold text-white/90">
              {["Persönlich ausgewählt", "Praktisch für unterwegs", "Für deinen Urlaub geplant"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
                    <Check size={15} className="text-[#55d7d1]" /> {item}
                  </span>
                )
              )}
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/de/entdecken" className="inline-flex items-center gap-2 rounded-xl bg-[#079ca5] px-7 py-4 text-sm font-extrabold text-white shadow-xl shadow-cyan-950/25 transition hover:-translate-y-0.5 hover:bg-[#078f96]">
                Khao Lak entdecken <ArrowRight size={18} />
              </Link>
              <Link href="/de/planen" className="inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/10 px-7 py-4 text-sm font-extrabold text-white backdrop-blur-md transition hover:bg-white/20">
                <Map size={18} /> Reise planen
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Vorteile" className="relative z-20 mx-auto -mt-12 max-w-6xl px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_24px_70px_rgba(16,35,63,.12)] sm:grid-cols-3">
          {[
            [Compass, "Echte Orientierung", "Finde schnell die Orte, die wirklich zu dir passen."],
            [Star, "Ausgewählte Tipps", "Weniger suchen, mehr von Khao Lak erleben."],
            [MapPin, "Alles an einem Ort", "Spots, Entfernungen und Reiseideen übersichtlich vereint."],
          ].map(([Icon, title, text], index) => {
            const FeatureIcon = Icon as typeof Compass;
            return (
              <div key={title as string} className={`p-7 sm:p-8 ${index > 0 ? "border-t border-slate-100 sm:border-l sm:border-t-0" : ""}`}>
                <FeatureIcon size={24} className="text-[#079ca5]" />
                <h2 className="mt-4 text-base font-extrabold">{title as string}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{text as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-28 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#079ca5]">Khao Lak auf deine Art</span>
          <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">
            Was möchtest du in Khao Lak erleben?
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Khao Lak ist mehr als ein Badeort. Entdecke tropische Natur,
            regionale Küche und besondere Plätze, die deinen Urlaub persönlich machen.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {discoveryCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="group relative min-h-[420px] overflow-hidden rounded-3xl bg-[#10233f] shadow-[0_18px_50px_rgba(16,35,63,.14)]">
                <Image src={card.image} alt={card.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071727] via-[#071727]/45 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-9">
                  <span className="inline-flex rounded-xl bg-[#079ca5] p-2.5"><Icon size={20} /></span>
                  <h3 className="mt-4 text-2xl font-extrabold tracking-[-0.03em]">{card.title}</h3>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-white/80">{card.text}</p>
                  <Link href={card.href} className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#74e1dc]">
                    {card.label} <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-[1fr_.9fr] lg:px-8">
          <div className="relative min-h-[560px] overflow-hidden rounded-[2rem] bg-[#10233f] shadow-2xl">
            <Image src="/images/nature.png" alt="Tropische Natur und Ausflugsziele rund um Khao Lak" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071727]/80 via-transparent to-transparent" />
            <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#74e1dc]"><Sun size={16} /> Insider-Wissen</div>
              <p className="mt-3 text-lg font-bold leading-7">Zur richtigen Zeit am richtigen Ort – für entspannte Urlaubsmomente statt unnötiger Umwege.</p>
            </div>
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#079ca5]">Urlaub einfach planen</span>
            <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">Von der Inspiration zu deinem perfekten Urlaubstag.</h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Khao Lak Insider hilft dir nicht nur bei der Suche. Du kannst Orte vergleichen,
              Favoriten speichern und deine Tage sinnvoll zusammenstellen.
            </p>
            <ol className="mt-9 space-y-6">
              {planningSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <li key={step.number} className="flex gap-5 rounded-2xl border border-slate-100 bg-[#f7faf9] p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f8f7] text-[#079ca5]"><Icon size={21} /></div>
                    <div>
                      <span className="text-[10px] font-extrabold tracking-[.16em] text-[#079ca5]">SCHRITT {step.number}</span>
                      <h3 className="mt-1 font-extrabold">{step.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{step.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <Link href="/de/planen" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#10233f] px-6 py-4 text-sm font-extrabold text-white transition hover:bg-[#173b60]">
              Urlaub planen <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-28 lg:px-8">
        <div className="grid items-center gap-14 rounded-[2rem] bg-[#10233f] px-7 py-10 text-white sm:px-12 lg:grid-cols-[.85fr_1.15fr] lg:px-16 lg:py-16">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#74e1dc]">Für unterwegs gemacht</span>
            <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.045em]">Dein Khao-Lak-Guide passt in die Hosentasche.</h2>
            <p className="mt-5 leading-7 text-white/70">Behalte gespeicherte Orte, die Karte und deine Reiseplanung auch unterwegs im Blick.</p>
            <ul className="mt-7 space-y-3 text-sm font-semibold text-white/90">
              {["Spots nach Kategorien entdecken", "Entfernungen von deiner Unterkunft sehen", "Lieblingsorte als Favoriten speichern"].map((item) => (
                <li key={item} className="flex items-center gap-3"><Check size={17} className="text-[#55d7d1]" />{item}</li>
              ))}
            </ul>
            <Link href="/de/registrieren" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#079ca5] px-6 py-4 text-sm font-extrabold text-white transition hover:bg-[#078f96]">Kostenlos registrieren <ArrowRight size={17} /></Link>
          </div>
          <div className="relative min-h-[480px]">
            <Image src="/images/home-screen.png" alt="Khao Lak Insider App mit ausgewählten Reisezielen" width={270} height={540} className="absolute left-[5%] top-10 z-10 h-auto w-[230px] -rotate-6 drop-shadow-2xl sm:w-[270px]" />
            <Image src="/images/map-screen.png" alt="Interaktive Karte mit Khao-Lak-Spots" width={310} height={600} className="absolute right-[2%] top-0 z-20 h-auto w-[260px] rotate-3 drop-shadow-2xl sm:w-[310px]" />
          </div>
        </div>
      </section>

      <section className="bg-white py-28">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#079ca5]">Gut zu wissen</span>
            <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">Häufige Fragen zu Khao Lak</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">Kurze Antworten auf wichtige Fragen für die Planung deines Khao-Lak-Urlaubs.</p>
          </div>
          <div className="mt-12 space-y-4">
            {faqItems.map((item) => (
              <details key={item.question} className="group rounded-2xl border border-slate-200 bg-[#f7faf9] p-6 open:border-[#bfe5e3] open:bg-[#eefafa]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-extrabold text-[#10233f]">
                  {item.question}
                  <span className="text-xl text-[#079ca5] transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#079ca5] px-6 py-24 text-center text-white">
        <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -right-12 h-96 w-96 rounded-full bg-[#10233f]/10" />
        <div className="relative mx-auto max-w-3xl">
          <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em]">Bereit für Khao Lak?</span>
          <h2 className="mt-6 text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">Mach aus deiner Reise deinen Urlaub.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/85">Entdecke besondere Orte, speichere deine Favoriten und plane Khao Lak so, wie es zu dir passt.</p>
          <Link href="/de/entdecken" className="mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 text-sm font-extrabold text-[#087f86] shadow-xl transition hover:-translate-y-0.5">Jetzt Khao Lak entdecken <ArrowRight size={18} /></Link>
        </div>
      </section>
    </article>
  );
}

function EnglishHomePage() {
  const englishFaq = [
    ["When is the best time to visit Khao Lak?", "The most popular travel period is usually from November to April, when conditions are often drier and the sea is calmer. The green season is quieter and lush, but showers and stronger waves are more likely."],
    ["Which beaches should I visit in Khao Lak?", "Nang Thong, Bang Niang, Khuk Khak and White Sand Beach are popular choices. The right beach depends on whether you prefer restaurants nearby, short journeys or as much peace and space as possible."],
    ["What can I do in Khao Lak?", "Besides beach days, you can explore markets, temples, waterfalls and nearby national parks. Boat trips and snorkelling are also popular, depending on seasonal conditions."],
    ["What makes Khao Lak Insider different?", "We combine carefully selected places with practical details, distances and trip-planning tools, helping you spend less time searching and more time enjoying your holiday."],
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${BASE_URL}/en#webpage`,
    url: `${BASE_URL}/en`,
    name: "Khao Lak Travel Guide: Beaches, Trips & Insider Tips",
    description: "An English travel guide to Khao Lak with beaches, restaurants, excursions and insider tips.",
    inLanguage: "en-GB",
    about: { "@type": "Place", name: "Khao Lak" },
  };

  return (
    <article className="overflow-hidden bg-[#f7faf9] text-[#10233f]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <section className="relative min-h-[720px] overflow-hidden bg-[#10233f]">
        <Image src="/images/hero.png" alt="Tropical beach in Khao Lak, Thailand" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,18,31,.9)_0%,rgba(5,18,31,.68)_48%,rgba(5,18,31,.12)_82%)]" />
        <div className="relative z-10 mx-auto flex min-h-[720px] max-w-7xl items-center px-6 py-20 lg:px-8">
          <div className="max-w-3xl text-white">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#079ca5] px-4 py-2 text-xs font-extrabold uppercase tracking-[.16em]"><MapPin size={14} /> Your digital Khao Lak travel guide</div>
            <h1 className="text-5xl font-extrabold leading-[1.02] tracking-[-.055em] sm:text-6xl lg:text-7xl">Discover Khao Lak.<br /><span className="text-[#55d7d1]">Like an insider.</span></h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/90 sm:text-xl">Beautiful beaches, favourite local restaurants, memorable excursions and practical advice for your Khao Lak holiday — carefully selected and easy to plan in one place.</p>
            <div className="mt-9 flex flex-wrap gap-3 text-sm font-semibold text-white/90">
              {["Carefully selected", "Practical on the go", "Made for your holiday"].map((item) => (
                <span key={item} className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
                  <Check size={15} className="text-[#55d7d1]" /> {item}
                </span>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/en/discover" className="inline-flex items-center gap-2 rounded-xl bg-[#079ca5] px-7 py-4 text-sm font-extrabold text-white">Discover Khao Lak <ArrowRight size={18} /></Link>
              <Link href="/en/plan" className="inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/10 px-7 py-4 text-sm font-extrabold text-white backdrop-blur"><Map size={18} /> Plan your trip</Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Benefits" className="relative z-20 mx-auto -mt-12 max-w-6xl px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_24px_70px_rgba(16,35,63,.12)] sm:grid-cols-3">
          {[
            [Compass, "Genuine guidance", "Quickly find the places that genuinely suit your holiday."],
            [Star, "Selected tips", "Spend less time searching and more time enjoying Khao Lak."],
            [MapPin, "Everything in one place", "Places, distances and trip ideas brought together clearly."],
          ].map(([Icon, title, text], index) => {
            const FeatureIcon = Icon as typeof Compass;
            return (
              <div key={title as string} className={`p-7 sm:p-8 ${index > 0 ? "border-t border-slate-100 sm:border-l sm:border-t-0" : ""}`}>
                <FeatureIcon size={24} className="text-[#079ca5]" />
                <h2 className="mt-4 text-base font-extrabold">{title as string}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{text as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-28 lg:px-8">
        <span className="text-xs font-extrabold uppercase tracking-[.18em] text-[#079ca5]">Khao Lak your way</span>
        <h2 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-[-.045em] sm:text-5xl">Everything you need for an unforgettable Khao Lak holiday</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {[
            ["Beautiful beaches", "Find lively beaches, peaceful bays and the right place for every holiday mood.", "/images/beach.png", Waves],
            ["Local food", "Discover authentic Thai food, relaxed beach bars and restaurants worth visiting.", "/images/food.png", Utensils],
            ["Markets and local life", "Experience street food, crafts and the atmosphere of Khao Lak's local markets.", "/images/market.png", Sparkles],
            ["Nature and adventure", "Explore waterfalls, rainforest and national parks around Khao Lak.", "/images/nature.png", Palmtree],
          ].map(([title, text, image, Icon]) => {
            const CardIcon = Icon as typeof Waves;
            return <article key={title as string} className="group relative min-h-[390px] overflow-hidden rounded-3xl bg-[#10233f]"><Image src={image as string} alt={title as string} fill sizes="(max-width:768px) 100vw,50vw" className="object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#071727] via-[#071727]/35 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-8 text-white"><CardIcon size={22} className="text-[#55d7d1]" /><h3 className="mt-4 text-2xl font-extrabold">{title as string}</h3><p className="mt-3 text-sm leading-6 text-white/80">{text as string}</p><Link href="/en/discover" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#74e1dc]">Explore places <ArrowRight size={16} /></Link></div></article>;
          })}
        </div>
      </section>

      <section className="bg-white py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-[1fr_.9fr] lg:px-8">
          <div className="relative min-h-[560px] overflow-hidden rounded-[2rem] bg-[#10233f] shadow-2xl">
            <Image src="/images/nature.png" alt="Tropical nature and excursions around Khao Lak" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071727]/80 via-transparent to-transparent" />
            <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#74e1dc]"><Sun size={16} /> Insider knowledge</div>
              <p className="mt-3 text-lg font-bold leading-7">Be in the right place at the right time for relaxed holiday moments without unnecessary detours.</p>
            </div>
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#079ca5]">Plan your holiday with ease</span>
            <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">From inspiration to your perfect day in Khao Lak.</h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">Khao Lak Insider does more than help you search. Compare places, save favourites and put together days that work for you.</p>
            <ol className="mt-9 space-y-6">
              {[
                [Search, "01", "Discover Khao Lak", "Browse beaches, restaurants, markets, temples and excursions by interest."],
                [Heart, "02", "Save your favourites", "Keep the places you definitely want to visit during your holiday."],
                [CalendarDays, "03", "Plan your days", "Combine your favourite places into relaxed days without needless travel or stress."],
              ].map(([Icon, number, title, text]) => {
                const StepIcon = Icon as typeof Search;
                return (
                  <li key={number as string} className="flex gap-5 rounded-2xl border border-slate-100 bg-[#f7faf9] p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f8f7] text-[#079ca5]"><StepIcon size={21} /></div>
                    <div>
                      <span className="text-[10px] font-extrabold tracking-[.16em] text-[#079ca5]">STEP {number as string}</span>
                      <h3 className="mt-1 font-extrabold">{title as string}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{text as string}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <Link href="/en/plan" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#10233f] px-6 py-4 text-sm font-extrabold text-white transition hover:bg-[#173b60]">Plan your holiday <ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-28 lg:px-8">
        <div className="grid items-center gap-14 rounded-[2rem] bg-[#10233f] px-7 py-10 text-white sm:px-12 lg:grid-cols-[.85fr_1.15fr] lg:px-16 lg:py-16">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#74e1dc]">Made for exploring</span>
            <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.045em]">Your Khao Lak guide fits in your pocket.</h2>
            <p className="mt-5 leading-7 text-white/70">Keep your saved places, map and travel plans close at hand while you are out and about.</p>
            <ul className="mt-7 space-y-3 text-sm font-semibold text-white/90">
              {["Discover places by category", "See distances from your accommodation", "Save favourite places for later"].map((item) => (
                <li key={item} className="flex items-center gap-3"><Check size={17} className="text-[#55d7d1]" />{item}</li>
              ))}
            </ul>
            <Link href="/en/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#079ca5] px-6 py-4 text-sm font-extrabold text-white transition hover:bg-[#078f96]">Register for free <ArrowRight size={17} /></Link>
          </div>
          <div className="relative min-h-[480px]">
            <Image src="/images/home-screen.png" alt="Khao Lak Insider app with selected destinations" width={270} height={540} className="absolute left-[5%] top-10 z-10 h-auto w-[230px] -rotate-6 drop-shadow-2xl sm:w-[270px]" />
            <Image src="/images/map-screen.png" alt="Interactive map with places around Khao Lak" width={310} height={600} className="absolute right-[2%] top-0 z-20 h-auto w-[260px] rotate-3 drop-shadow-2xl sm:w-[310px]" />
          </div>
        </div>
      </section>

      <section className="bg-white py-28">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center"><span className="text-xs font-extrabold uppercase tracking-[.18em] text-[#079ca5]">Good to know</span><h2 className="mt-4 text-4xl font-extrabold tracking-[-.045em] sm:text-5xl">Frequently asked questions about Khao Lak</h2><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">Short answers to important questions when planning your Khao Lak holiday.</p></div>
          <div className="mt-12 space-y-4">{englishFaq.map(([question, answer]) => <details key={question} className="group rounded-2xl border border-slate-200 bg-[#f7faf9] p-6 open:border-[#bfe5e3] open:bg-[#eefafa]"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-extrabold">{question}<span className="text-xl text-[#079ca5] group-open:rotate-45">+</span></summary><p className="mt-4 text-sm leading-7 text-slate-600">{answer}</p></details>)}</div>
        </div>
      </section>
      <section className="bg-[#079ca5] px-6 py-24 text-center text-white"><h2 className="text-4xl font-extrabold tracking-[-.045em] sm:text-5xl">Ready to discover Khao Lak?</h2><p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">Find special places, save your favourites and plan a holiday that suits you.</p><Link href="/en/discover" className="mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 text-sm font-extrabold text-[#087f86]">Start exploring <ArrowRight size={18} /></Link></section>
    </article>
  );
}
