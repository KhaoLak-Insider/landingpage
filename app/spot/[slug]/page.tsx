import { supabase } from "@/src/lib/supabase";
import SpotClientPage from "./SpotClientPage";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

// 1. DYNAMISCHE SEO META-TAGS FÜR GOOGLE
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug.trim());

  const { data: spot } = await supabase
    .from("spots")
    .select("title, description")
    .ilike("slug", decodedSlug)
    .maybeSingle();

  if (!spot) return { title: "Spot nicht gefunden | Khao Lak App" };

  return {
    title: `${spot.title} Khao Lak | Highlights & Insider Tipps`,
    description: spot.description || `Entdecke ${spot.title} in Khao Lak. Infos, Öffnungszeiten, Anfahrt und echte Insider-Tipps auf KhaoLak.app.`,
    robots: "index, follow",
  };
}

// 2. SERVER-DATENABRUF
export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug.trim());

  // Haupt-Spot direkt auf dem Server laden
  const { data: spotData } = await supabase
    .from("spots")
    .select("*")
    .ilike("slug", decodedSlug)
    .maybeSingle();

  if (!spotData) {
    notFound(); // Löst Next.js Standard 404 aus
  }

  // Zufällige Spots für das Karussell laden
  const { data: randomData } = await supabase
    .from("spots")
    .select("*")
    .neq("category", "Unterkunft");
  
  const filteredRandom = randomData 
    ? randomData.filter((s: any) => s.id !== spotData.id).sort(() => 0.5 - Math.random()).slice(0, 10)
    : [];

  // Übergabe der vorgerenderten Daten an die Client-UI
  return <SpotClientPage initialSpot={spotData} initialRandomSpots={filteredRandom} />;
}