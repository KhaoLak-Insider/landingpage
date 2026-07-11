import Link from "next/link";
import { ChevronLeft } from "lucide-react";
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

export default function SpotHero({
  spot,
  language,
  title,
  description,
  category,
  backHref,
}: SpotHeroProps) {
  return (
    <div style={{ position: "relative", width: "100%", height: "450px" }}>
      <img
        src={typeof spot.image_url === "string" ? spot.image_url : ""}
        alt={title}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {typeof spot.image_url === "string" &&
        spot.image_url.includes("google") && (
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              fontSize: "10px",
              color: "rgba(255,255,255,0.7)",
              background: "rgba(0,0,0,0.3)",
              padding: "2px 6px",
              borderRadius: "4px",
              zIndex: 10,
            }}
          >
            Powered by Google
          </div>
        )}

      <Link
        href={backHref}
        style={{
          position: "absolute",
          top: "30px",
          left: "30px",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(255,255,255,0.9)",
          padding: "10px 20px",
          borderRadius: "50px",
          fontSize: "14px",
          fontWeight: 600,
          color: "#333",
          textDecoration: "none",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <ChevronLeft size={16} />
        {t(language, "backToAllSpots")}
      </Link>

      <div
        style={{
          position: "absolute",
          bottom: "40px",
          left: "40px",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          alignItems: "flex-start",
          maxWidth: "calc(100% - 400px)",
        }}
      >
        {category && (
          <div
            style={{
              background: "#14b8a6",
              color: "#fff",
              padding: "6px 16px",
              borderRadius: "50px",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              width: "fit-content",
            }}
          >
            {category}
          </div>
        )}

        <h1
          style={{
            color: "#fff",
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            margin: 0,
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          {title}
        </h1>

        {description && (
          <p
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: 300,
              margin: 0,
              opacity: 0.9,
              textShadow: "0 1px 5px rgba(0,0,0,0.5)",
            }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
