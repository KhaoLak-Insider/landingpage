import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/src/components/Header"; 
import Footer from "@/src/components/Footer"; // 1. HIER IMPORTIERT
import Script from "next/script";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://khaolak.app"),
  title: "Khao Lak Insider",
  description:
    "Der smarte Reiseführer für Khao Lak. Entdecke Strände, Märkte, Tempel, Restaurants und echte Geheimtipps.",

  openGraph: {
    title: "Khao Lak Insider",
    description:
      "Entdecke Khao Lak wie ein Insider – mit Stränden, Märkten, Restaurants und Geheimtipps in einer App.",
    url: "https://khaolak.app",
    siteName: "Khao Lak Insider",
    images: [
      {
        url: "https://khaolak.app/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Khao Lak Insider App",
      },
    ],
    locale: "de_DE",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Khao Lak Insider",
    description:
      "Entdecke Khao Lak wie ein Insider – mit Strände, Märkte, Restaurants und Geheimtipps in einer App.",
    images: ["https://khaolak.app/images/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className={`${poppins.className} min-h-full flex flex-col`}>
        <Header /> 
        
        <main className="flex-grow">
          {children}
        </main>
        
        {/* 2. HIER EINGEFÜGT: Der Footer wird nun global geladen */}
        <Footer /> 

        <Analytics />
        
        {/* GetYourGuide Analytics Widget */}
        <Script
          id="gyg-analytics"
          src="https://widget.getyourguide.com/dist/pa.umd.production.min.js"
          strategy="afterInteractive"
          data-gyg-partner-id="JAPXTFH"
        />
      </body>
    </html>
  );
}