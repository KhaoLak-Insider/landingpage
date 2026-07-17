import type { Metadata } from "next";
import { headers } from "next/headers";
import { absoluteLocalizedUrl } from "@/src/lib/i18n-routing";
import AppInfoPage from "./AppInfoPage";

export async function generateMetadata(): Promise<Metadata> {
  const language = (await headers()).get("x-language") === "en" ? "en" : "de";
  const canonical = absoluteLocalizedUrl("/app", language);

  return {
    title: language === "en" ? "Khao Lak Insider App" : "Khao Lak Insider App – Infos & Warteliste",
    description: language === "en"
      ? "Learn more about the Khao Lak Insider app and join the waitlist for launch updates."
      : "Erfahre mehr über die Khao Lak Insider App und trage dich für Neuigkeiten zum App-Start in die Warteliste ein.",
    alternates: {
      canonical,
      languages: {
        de: absoluteLocalizedUrl("/app", "de"),
        en: absoluteLocalizedUrl("/app", "en"),
        "x-default": absoluteLocalizedUrl("/app", "de"),
      },
    },
    openGraph: {
      title: "Khao Lak Insider App",
      description: language === "en"
        ? "The smart travel companion for your Khao Lak holiday."
        : "Der smarte Reisebegleiter für deinen Khao-Lak-Urlaub.",
      url: canonical,
      type: "website",
    },
  };
}

export default function Page() {
  return <AppInfoPage />;
}
