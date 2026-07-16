import Link from "next/link";
import { ChevronLeft, MapPin } from "lucide-react";
import type { Language } from "@/src/lib/i18n";
import type { SpotRecord } from "@/src/types/spot";
import { t } from "@/src/lib/translations";

interface SpotHeroProps {
  spot: SpotRecord;
  language: Language;
  title: string;
  description?: string | null;
  category?: string | null;
  backHref: string;
}

export default function SpotHero({ spot, language, title, description, category, backHref }: SpotHeroProps) {
  const imageUrl = typeof spot.image_url === "string" ? spot.image_url : "";

  return (
    <section className="spot-hero">
      {imageUrl ? <img src={imageUrl} alt={title} /> : <div className="spot-hero__fallback" />}
      <div className="spot-hero__overlay" />
      <div className="spot-hero__inner">
        <Link
          href={backHref}
          className="spot-hero__back"
          style={{
            display: "inline-flex",
            width: "max-content",
            alignItems: "center",
            gap: 6,
            padding: "9px 13px",
            border: "1px solid rgba(255,255,255,.82)",
            borderRadius: 10,
            background: "rgba(255,255,255,.94)",
            color: "#10233f",
            fontSize: 10,
            fontWeight: 750,
            textDecoration: "none",
            boxShadow: "0 8px 22px rgba(7,23,43,.18)",
            backdropFilter: "blur(10px)",
          }}
        >
          <ChevronLeft size={15} />{t(language, "backToAllSpots")}
        </Link>
        <div className="spot-hero__copy">
          {category && <span className="spot-hero__category"><MapPin size={13} />{category}</span>}
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
      </div>
      {imageUrl.includes("google") && <small>Powered by Google</small>}
      <style jsx>{`
        .spot-hero{position:relative;overflow:hidden;min-height:520px;background:#10233f}.spot-hero>img,.spot-hero__fallback{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.spot-hero__fallback{background:linear-gradient(135deg,#173b60,#079ca5)}.spot-hero__overlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,18,31,.76) 0%,rgba(5,18,31,.44) 22%,rgba(5,18,31,.12) 42%,rgba(5,18,31,0) 60%),linear-gradient(0deg,rgba(4,13,22,.54) 0%,rgba(4,13,22,.16) 40%,transparent 68%)}.spot-hero__inner{position:relative;z-index:2;display:flex;max-width:1260px;min-height:520px;margin:0 auto;padding:30px 28px 58px;flex-direction:column}.spot-hero__back{transition:transform .2s ease,background .2s ease}.spot-hero__back:hover{background:#fff!important;transform:translateY(-1px)}.spot-hero__copy{max-width:790px;margin-top:auto}.spot-hero__category{display:inline-flex;align-items:center;gap:6px;margin-bottom:15px;padding:7px 10px;border-radius:999px;background:#079ca5;color:#fff;font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;box-shadow:0 8px 20px rgba(7,156,165,.24)}.spot-hero h1{max-width:850px;margin:0;color:#fff;font-size:clamp(38px,6vw,72px);line-height:1.02;letter-spacing:-.055em;text-shadow:0 4px 24px rgba(0,0,0,.38)}.spot-hero p{max-width:680px;margin:18px 0 0;color:rgba(255,255,255,.9);font-size:clamp(14px,1.6vw,18px);line-height:1.65;text-shadow:0 2px 12px rgba(0,0,0,.42)}.spot-hero>small{position:absolute;right:14px;bottom:10px;z-index:2;color:rgba(255,255,255,.6);font-size:8px}@media(max-width:720px){.spot-hero,.spot-hero__inner{min-height:480px}.spot-hero__inner{padding:20px 18px 38px}.spot-hero__overlay{background:linear-gradient(0deg,rgba(4,13,22,.78) 0%,rgba(4,13,22,.28) 48%,rgba(4,13,22,.06) 100%)}.spot-hero h1{font-size:clamp(36px,12vw,54px)}.spot-hero p{font-size:13px}}
      `}</style>
    </section>
  );
}
