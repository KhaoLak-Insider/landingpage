import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Heart,
  MapPinned,
  MessageCircle,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { localizePath } from "@/src/lib/i18n-routing";

const BASE_URL = "https://www.khaolak.app";

const pageCopy = {
  de: {
    metadataTitle: "Über uns: Melo & Marc | Khao Lak Insider",
    metadataDescription:
      "Lerne Melo und Marc kennen: Khao-Lak-Erfahrung seit 2012, ehrliche Empfehlungen, persönliche Recherche und echte Insider-Tipps für deinen Urlaub.",
    eyebrow: "Die Menschen hinter Khao Lak Insider",
    title: "Wir zeigen dir Khao Lak, wie wir es selbst lieben.",
    lead:
      "Wir sind Melo und Marc – Reisebegeisterte, digitale Nomaden und die Gründer von Khao Lak Insider. Aus vielen Aufenthalten, Begegnungen vor Ort und unserer Liebe zu dieser besonderen Region ist ein Reiseführer entstanden, der dir stundenlange Recherche ersparen und ein authentisches Khao-Lak-Erlebnis ermöglichen soll.",
    ctaDiscover: "Khao Lak entdecken",
    ctaPlan: "Reise planen",
    proof: [
      ["Seit 2008", "gemeinsam unterwegs"],
      ["Seit 2012", "regelmäßig in Thailand"],
      ["Rund 20-mal", "Khao Lak persönlich erlebt"],
      ["95 %", "der vorgestellten Orte selbst besucht"],
    ],
    storyEyebrow: "Unsere Geschichte",
    storyTitle: "Von zwei Rucksäcken zur Khao-Lak-Plattform",
    storyParagraphs: [
      "Aufgewachsen sind wir beide in der Eifel. Seit 2008 reisen wir gemeinsam und haben schnell gemerkt, wie sehr uns neue Orte, Menschen und Perspektiven bereichern. 2019 wagten wir mit einem One-Way-Ticket nach Bangkok und zwei Rucksäcken unsere offene Weltreise – ein Schritt, der unseren Wunsch nach Freiheit und Selbstbestimmung endgültig zum Lebensmodell machte.",
      "Thailand besuchten wir erstmals 2012. Khao Lak war damals eher ein Zufallstreffer: ein gutes Angebot, kaum Vorwissen – und Liebe auf den ersten Blick. Die kilometerlangen, oft ruhigen Strände, der üppige Dschungel im Hinterland, das großartige Essen und die offenen Menschen ließen uns immer wieder zurückkehren.",
      "Mit der Zeit merkten wir, wie viele Reisende zwar nach Khao Lak kommen, aber das authentische Leben jenseits von Hotelanlage und touristischen Standards kaum entdecken. Genau daraus entstand Khao Lak Insider: ein zentraler, übersichtlicher Begleiter für bessere Reiseentscheidungen und besondere Erlebnisse vor Ort.",
    ],
    quote:
      "Unser Ziel ist nicht, dir möglichst viele Orte zu zeigen. Wir möchten dir die Orte zeigen, die deinen Urlaub wirklich besser machen.",
    rolesEyebrow: "Melo & Marc",
    rolesTitle: "Zwei Perspektiven, eine gemeinsame Leidenschaft",
    people: [
      {
        name: "Melo",
        character: "Empathisch, humorvoll und selbstbewusst",
        text: "Melo liebt Yoga, Bücher und das Reisen. Sie behält organisatorische und bürokratische Themen im Blick und bringt ein feines Gespür dafür mit, was sich auf einer Reise wirklich gut anfühlt. Ihr Lieblingscafé in Khao Lak ist das Delicacy Café – und beim Thema Fortbewegung gewinnt für sie das Auto.",
      },
      {
        name: "Marc",
        character: "Hilfsbereit, loyal und locker",
        text: "Marc plant Routen, Reiseziele und den Weg von A nach B. Er liebt Sport, Natur und spontane Entdeckungen mit dem Roller. In Khao Lak findet man ihn gerne bei Two Shot Coffee, an einem lokalen Streetfood-Stand oder auf dem Weg zum ruhigen Bangsak Beach.",
      },
    ],
    whyEyebrow: "Unsere Arbeitsweise",
    whyTitle: "Warum du unseren Empfehlungen vertrauen kannst",
    standards: [
      ["Persönlich recherchiert", "Wir besuchen rund 95 Prozent der vorgestellten Orte selbst und gleichen Eindrücke mit Freunden, Kontakten vor Ort, unserer Community und aktuellen Bewertungen ab."],
      ["Ehrlich ausgewählt", "Was uns nicht überzeugt, wird nicht empfohlen. Provisionen verändern unsere Bewertung nicht – Authentizität, Fairness und Ehrlichkeit stehen an erster Stelle."],
      ["Regelmäßig geprüft", "Informationen und Empfehlungen werden mindestens einmal pro Quartal überprüft. Hinweise aus der Community helfen uns, Veränderungen schneller zu erkennen."],
      ["Für echte Erlebnisse", "Wir möchten, dass du auch kleine lokale Restaurants, unterschiedliche Strandabschnitte und die Natur im Hinterland entdeckst – nicht nur die bekannten Touristenorte."],
    ],
    favoritesEyebrow: "Ganz persönlich",
    favoritesTitle: "Unser Khao Lak in sechs Antworten",
    favorites: [
      ["Lieblingsstrand", "Bangsak Beach"],
      ["Lieblingstempel", "Khuk Khak Temple"],
      ["Lieblingsmarkt", "Long Lae Market"],
      ["Lieblingsausflug", "Khao Sok Lake"],
      ["Beste Reisezeit für uns", "Dezember & Januar"],
      ["Immer wieder zurück", "Nach Khao Lak"],
    ],
    communityEyebrow: "Gemeinsam besser reisen",
    communityTitle: "Die Community gehört zu unserer Geschichte",
    communityText:
      "Besonders stolz sind wir auf die Menschen, die Khao Lak Insider begleiten, uns Rückmeldungen schicken und ihre Erfahrungen teilen. Einige treffen wir regelmäßig vor Ort bei Community-Treffen. Die schönsten Nachrichten sind für uns jene, in denen Reisende erzählen, dass sie durch unsere Tipps ein kleines Restaurant entdeckt oder einen unvergesslichen Urlaub erlebt haben.",
    transparencyTitle: "Transparenz bei Empfehlungen",
    transparencyText:
      "Einige Seiten können Affiliate-Links enthalten. Wenn du darüber buchst, erhalten wir möglicherweise eine Provision, ohne dass sich dein Preis erhöht. Solche Einnahmen helfen uns, Inhalte zu recherchieren und aktuell zu halten. Ob eine Empfehlung auf Khao Lak Insider erscheint, entscheidet jedoch ausschließlich unsere ehrliche Einschätzung.",
    visionEyebrow: "Unsere Vision",
    visionTitle: "Der beste digitale Reisebegleiter für Khao Lak",
    visionText:
      "Wir entwickeln Khao Lak Insider Schritt für Schritt zu einer mehrsprachigen Plattform und App weiter: mit Reiseplaner, hilfreicher Community und verlässlichen Informationen für unterwegs. Unser Anspruch bleibt dabei einfach – alles Wichtige an einem Ort, verständlich aufbereitet und von Menschen, die Khao Lak wirklich kennen.",
    finalCta: "Plane dein persönliches Khao-Lak-Erlebnis",
    finalText: "Entdecke Strände, Restaurants, Märkte, Tempel, Hotels und Ausflüge, die zu deiner Reise passen.",
    finalButton: "Jetzt Khao Lak entdecken",
    faqTitle: "Häufige Fragen über Khao Lak Insider",
    faqs: [
      ["Wer steckt hinter Khao Lak Insider?", "Khao Lak Insider wurde von Melo und Marc gegründet. Sie reisen seit 2008 gemeinsam, besuchen Thailand seit 2012 und waren rund 20-mal in Khao Lak."],
      ["Werden die empfohlenen Orte selbst besucht?", "Nach eigener Angabe haben Melo und Marc rund 95 Prozent der vorgestellten Orte selbst besucht. Ergänzend nutzen sie Kontakte vor Ort, Community-Feedback und aktuelle Bewertungen."],
      ["Wie aktuell sind die Informationen?", "Die Inhalte werden mindestens einmal pro Quartal überprüft und bei bekannten Veränderungen aktualisiert."],
      ["Beeinflussen Affiliate-Provisionen die Empfehlungen?", "Nein. Affiliate-Links können die Arbeit finanzieren, bestimmen aber nicht, welche Orte empfohlen werden."],
    ],
  },
  en: {
    metadataTitle: "About Melo & Marc | Khao Lak Insider",
    metadataDescription:
      "Meet Melo and Marc: exploring Khao Lak since 2012, sharing honest recommendations, first-hand research and local travel tips.",
    eyebrow: "The people behind Khao Lak Insider",
    title: "We show you Khao Lak the way we love it.",
    lead:
      "We are Melo and Marc – passionate travellers, digital nomads and the founders of Khao Lak Insider. Many visits, local encounters and our love for this special region inspired a travel guide designed to save you hours of research and help you experience authentic Khao Lak.",
    ctaDiscover: "Discover Khao Lak",
    ctaPlan: "Plan your trip",
    proof: [["Since 2008", "travelling together"], ["Since 2012", "regularly visiting Thailand"], ["About 20 visits", "experiencing Khao Lak first-hand"], ["95%", "of featured places visited personally"]],
    storyEyebrow: "Our story",
    storyTitle: "From two backpacks to a Khao Lak platform",
    storyParagraphs: [
      "We both grew up in Germany's Eifel region and have travelled together since 2008. In 2019, a one-way ticket to Bangkok and two backpacks marked the beginning of our open-ended world trip – and turned freedom and self-determination into our way of life.",
      "We first visited Thailand in 2012. Khao Lak was almost a lucky coincidence: a good offer, very little prior knowledge, and love at first sight. Its long, uncrowded beaches, lush jungle, excellent food and welcoming people kept drawing us back.",
      "Over time, we realised that many visitors never discover the authentic life beyond their resort. That insight became Khao Lak Insider: one clear, practical place for better travel decisions and memorable local experiences.",
    ],
    quote: "Our aim is not to show you the most places. It is to show you the places that genuinely make your holiday better.",
    rolesEyebrow: "Melo & Marc",
    rolesTitle: "Two perspectives, one shared passion",
    people: [
      { name: "Melo", character: "Empathetic, humorous and confident", text: "Melo loves yoga, reading and travel. She keeps organisational matters on track and has a keen sense for what makes a journey feel genuinely good. Her Khao Lak favourite is Delicacy Café – and she prefers exploring by car." },
      { name: "Marc", character: "Helpful, loyal and easy-going", text: "Marc plans destinations, routes and every journey from A to B. He loves sport, nature and spontaneous discoveries by scooter. In Khao Lak, you may find him at Two Shot Coffee, a local street-food stall or heading towards peaceful Bangsak Beach." },
    ],
    whyEyebrow: "How we work",
    whyTitle: "Why you can trust our recommendations",
    standards: [
      ["First-hand research", "We personally visit around 95 percent of featured places and compare our experience with local contacts, friends, community feedback and recent reviews."],
      ["Honest selection", "Places that do not convince us are not recommended. Commissions never change our verdict; authenticity, fairness and honesty come first."],
      ["Regularly reviewed", "Information and recommendations are checked at least once every quarter, with community feedback helping us spot changes sooner."],
      ["Authentic experiences", "We want you to discover local restaurants, different beaches and the jungle hinterland – not only the best-known tourist stops."],
    ],
    favoritesEyebrow: "Our personal picks",
    favoritesTitle: "Our Khao Lak in six answers",
    favorites: [["Favourite beach", "Bangsak Beach"], ["Favourite temple", "Khuk Khak Temple"], ["Favourite market", "Long Lae Market"], ["Favourite excursion", "Khao Sok Lake"], ["Our favourite season", "December & January"], ["The place we return to", "Khao Lak"]],
    communityEyebrow: "Better travel, together",
    communityTitle: "Our community is part of the story",
    communityText: "We are especially proud of the people who follow Khao Lak Insider, share feedback and contribute their own experiences. We regularly meet followers in Khao Lak. The messages that mean the most tell us that our tips led someone to a small local restaurant or helped create an unforgettable holiday.",
    transparencyTitle: "Transparency about recommendations",
    transparencyText: "Some pages may contain affiliate links. If you book through one, we may receive a commission at no extra cost to you. This helps fund research and updates, but it never determines which places appear on Khao Lak Insider.",
    visionEyebrow: "Our vision",
    visionTitle: "The best digital travel companion for Khao Lak",
    visionText: "We are developing Khao Lak Insider into a multilingual platform and app with a trip planner, a helpful community and reliable information on the go. Our promise stays simple: everything important in one place, clearly presented by people who genuinely know Khao Lak.",
    finalCta: "Plan your own Khao Lak experience",
    finalText: "Discover beaches, restaurants, markets, temples, hotels and excursions that fit your trip.",
    finalButton: "Discover Khao Lak now",
    faqTitle: "Frequently asked questions about Khao Lak Insider",
    faqs: [
      ["Who is behind Khao Lak Insider?", "Khao Lak Insider was founded by Melo and Marc. They have travelled together since 2008, visited Thailand since 2012 and experienced Khao Lak about 20 times."],
      ["Do Melo and Marc visit the featured places?", "According to their editorial process, they have personally visited around 95 percent of the featured places. They also use local contacts, community feedback and current reviews."],
      ["How current is the information?", "Content is reviewed at least once every quarter and updated whenever relevant changes become known."],
      ["Do affiliate commissions influence recommendations?", "No. Affiliate links can help fund the work, but they do not decide which places are recommended."],
    ],
  },
} as const;

async function getLanguage() {
  return (await headers()).get("x-language") === "en" ? "en" : "de";
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await getLanguage();
  const copy = pageCopy[language];
  const canonical = `${BASE_URL}/${language}/ueber-uns`;
  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
    alternates: {
      canonical,
      languages: { de: `${BASE_URL}/de/ueber-uns`, en: `${BASE_URL}/en/ueber-uns`, "x-default": `${BASE_URL}/de/ueber-uns` },
    },
    openGraph: {
      title: copy.metadataTitle,
      description: copy.metadataDescription,
      url: canonical,
      siteName: "Khao Lak Insider",
      type: "website",
      locale: language === "en" ? "en_GB" : "de_DE",
      images: [{ url: "/images/og-image.jpg", width: 1200, height: 630, alt: "Khao Lak Insider – Melo und Marc" }],
    },
    twitter: { card: "summary_large_image", title: copy.metadataTitle, description: copy.metadataDescription, images: ["/images/og-image.jpg"] },
  };
}

export default async function AboutPage() {
  const language = await getLanguage();
  const copy = pageCopy[language];
  const href = (path: string) => localizePath(path, language);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "AboutPage", "@id": `${BASE_URL}/${language}/ueber-uns#page`, url: `${BASE_URL}/${language}/ueber-uns`, name: copy.metadataTitle, description: copy.metadataDescription, inLanguage: language, about: { "@id": `${BASE_URL}/#organization` } },
      { "@type": "Organization", "@id": `${BASE_URL}/#organization`, name: "Khao Lak Insider", url: BASE_URL, founders: [{ "@type": "Person", name: "Melo" }, { "@type": "Person", name: "Marc" }], knowsAbout: ["Khao Lak", "Thailand travel", "Khao Lak beaches", "Khao Lak restaurants", "Khao Lak excursions"] },
      { "@type": "FAQPage", mainEntity: copy.faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
    ],
  };

  return (
    <div className="overflow-hidden bg-[#f6f9f9] text-[#10233f]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />

      <section className="relative isolate border-b border-[#dce9e9] bg-[#071a2f] px-5 py-20 text-white sm:px-8 lg:py-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_24%,rgba(14,180,187,.28),transparent_31%),radial-gradient(circle_at_18%_88%,rgba(255,187,92,.15),transparent_28%)]" />
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-[#65e1df]"><Sparkles size={14} />{copy.eyebrow}</span>
            <h1 className="mt-7 max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-[-.045em] sm:text-6xl lg:text-7xl">{copy.title}</h1>
            <p className="mt-7 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">{copy.lead}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={href("/entdecken")} className="inline-flex items-center gap-2 rounded-full bg-[#0eb4bb] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#0a9ca3]">{copy.ctaDiscover}<ArrowRight size={17} /></Link>
              <Link href={href("/planen")} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">{copy.ctaPlan}<Compass size={17} /></Link>
            </div>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {copy.proof.map(([value, label]) => <div key={value} className="bg-[#0b2138]/90 p-6"><strong className="block text-2xl text-white">{value}</strong><span className="mt-1 block text-sm text-slate-300">{label}</span></div>)}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
          <div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#079ca5]">{copy.storyEyebrow}</p><h2 className="mt-4 text-3xl font-extrabold tracking-[-.035em] sm:text-4xl">{copy.storyTitle}</h2><div className="mt-8 rounded-2xl bg-[#dff6f5] p-6 text-[#075f65]"><Heart size={25} /><p className="mt-4 text-lg font-bold leading-7">{copy.quote}</p></div></div>
          <div className="space-y-6 text-[15px] leading-8 text-slate-600 sm:text-base">{copy.storyParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </div>
      </section>

      <section className="border-y border-[#dfeaea] bg-white px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1180px]"><p className="text-center text-xs font-extrabold uppercase tracking-[.18em] text-[#079ca5]">{copy.rolesEyebrow}</p><h2 className="mx-auto mt-4 max-w-3xl text-center text-3xl font-extrabold tracking-[-.035em] sm:text-4xl">{copy.rolesTitle}</h2><div className="mt-12 grid gap-6 md:grid-cols-2">{copy.people.map((person, index) => <article key={person.name} className="relative overflow-hidden rounded-3xl border border-[#dfe9e9] bg-[#f9fbfb] p-8 shadow-[0_20px_50px_rgba(15,35,62,.06)]"><div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-[#dff6f5]" /><span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10233f] text-xl font-extrabold text-white">{person.name[0]}</span><h3 className="relative mt-6 text-3xl font-extrabold">{person.name}</h3><p className="mt-2 text-sm font-bold text-[#079ca5]">{person.character}</p><p className="mt-5 leading-7 text-slate-600">{person.text}</p><span className="mt-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-slate-400">{index === 0 ? <Heart size={15} /> : <MapPinned size={15} />} Khao Lak Insider</span></article>)}</div></div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-28"><div className="mx-auto max-w-[1180px]"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#079ca5]">{copy.whyEyebrow}</p><h2 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-[-.035em] sm:text-4xl">{copy.whyTitle}</h2><div className="mt-12 grid gap-5 sm:grid-cols-2">{copy.standards.map(([title, text], index) => { const Icon = [SearchCheck, ShieldCheck, CheckCircle2, Compass][index]; return <article key={title} className="rounded-2xl border border-[#dfe9e9] bg-white p-7 shadow-[0_14px_40px_rgba(15,35,62,.045)]"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e4f8f7] text-[#079ca5]"><Icon size={22} /></span><h3 className="mt-5 text-xl font-extrabold">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{text}</p></article>; })}</div></div></section>

      <section className="bg-[#0b2037] px-5 py-20 text-white sm:px-8"><div className="mx-auto max-w-[1180px]"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#65e1df]">{copy.favoritesEyebrow}</p><h2 className="mt-4 text-3xl font-extrabold tracking-[-.035em] sm:text-4xl">{copy.favoritesTitle}</h2><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{copy.favorites.map(([label, value]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[.06] p-5"><span className="block text-xs font-bold uppercase tracking-[.12em] text-slate-400">{label}</span><strong className="mt-2 block text-lg text-white">{value}</strong></div>)}</div></div></section>

      <section className="px-5 py-20 sm:px-8 lg:py-28"><div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-2"><article className="rounded-3xl bg-[#dff6f5] p-8 sm:p-10"><Users className="text-[#079ca5]" size={30} /><p className="mt-6 text-xs font-extrabold uppercase tracking-[.18em] text-[#079ca5]">{copy.communityEyebrow}</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-.035em]">{copy.communityTitle}</h2><p className="mt-5 leading-8 text-slate-600">{copy.communityText}</p><Link href={href("/community")} className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-[#087f85]">Community <ArrowRight size={16} /></Link></article><article className="rounded-3xl border border-[#dfe9e9] bg-white p-8 sm:p-10"><ShieldCheck className="text-[#079ca5]" size={30} /><h2 className="mt-6 text-3xl font-extrabold tracking-[-.035em]">{copy.transparencyTitle}</h2><p className="mt-5 leading-8 text-slate-600">{copy.transparencyText}</p></article></div></section>

      <section className="border-y border-[#dfeaea] bg-white px-5 py-20 sm:px-8"><div className="mx-auto max-w-[900px] text-center"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#079ca5]">{copy.visionEyebrow}</p><h2 className="mt-4 text-3xl font-extrabold tracking-[-.035em] sm:text-5xl">{copy.visionTitle}</h2><p className="mx-auto mt-6 max-w-3xl leading-8 text-slate-600">{copy.visionText}</p></div></section>

      <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-[900px]"><h2 className="text-center text-3xl font-extrabold tracking-[-.035em]">{copy.faqTitle}</h2><div className="mt-10 space-y-3">{copy.faqs.map(([question, answer]) => <details key={question} className="group rounded-2xl border border-[#dfe9e9] bg-white p-6"><summary className="cursor-pointer list-none pr-6 font-extrabold marker:hidden">{question}</summary><p className="mt-4 border-t border-[#edf2f2] pt-4 text-sm leading-7 text-slate-600">{answer}</p></details>)}</div></div></section>

      <section className="px-5 pb-20 sm:px-8 lg:pb-28"><div className="mx-auto flex max-w-[1180px] flex-col items-start justify-between gap-7 rounded-3xl bg-gradient-to-br from-[#079ca5] to-[#056b75] p-8 text-white shadow-[0_24px_60px_rgba(7,156,165,.22)] sm:p-12 lg:flex-row lg:items-center"><div><MessageCircle size={28} /><h2 className="mt-5 text-3xl font-extrabold tracking-[-.035em]">{copy.finalCta}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">{copy.finalText}</p></div><Link href={href("/entdecken")} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-extrabold text-[#087f85] transition hover:bg-[#effafa]">{copy.finalButton}<ArrowRight size={17} /></Link></div></section>
    </div>
  );
}
