"use client";

import { useState } from "react";
import { t } from "@/src/lib/translations";
import type { Language } from "@/src/lib/i18n";

export interface SpotDescriptionBlock {
  type?: string;
  content?: string;
}

interface SpotDescriptionProps {
  title: string;
  blocks: SpotDescriptionBlock[];
  language: Language;
  initiallyVisibleBlocks?: number;
  seoCollapsible?: boolean;
}

export default function SpotDescription({
  title,
  blocks,
  language,
  initiallyVisibleBlocks = 2,
  seoCollapsible = false,
}: SpotDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (blocks.length === 0) {
    return null;
  }

  const visibleBlocks = blocks.slice(0, initiallyVisibleBlocks);
  const hiddenBlocks = blocks.slice(initiallyVisibleBlocks);

  const renderBlock = (
    block: SpotDescriptionBlock,
    key: string | number
  ) => {
    if (block.type === "heading") {
      return (
        <h3
          key={key}
          style={{
            fontSize: 20,
            fontWeight: 700,
            marginTop: "24px",
            marginBottom: "12px",
          }}
        >
          {block.content}
        </h3>
      );
    }

    return (
      <p
        key={key}
        style={{
          color: "#475569",
          lineHeight: 1.8,
          fontSize: "15px",
          marginBottom: "16px",
        }}
      >
        {block.content}
      </p>
    );
  };

  return (
    <section className="spot-description">
      <span className="spot-description__eyebrow">{language === "en" ? "Insider portrait" : "Insider-Porträt"}</span>
      <h2
        style={{
          fontSize: 25,
          fontWeight: 800,
          margin: "0 0 22px",
          color: "#10233f",
          letterSpacing: "-0.03em",
        }}
      >
        {t(language, "about")} {title}
      </h2>

      {visibleBlocks.map((block, index) =>
        renderBlock(block, `visible-${index}`)
      )}

      {seoCollapsible && hiddenBlocks.length > 0 ? (
        <div
          id="spot-description-more"
          className={`spot-description__more ${
            isExpanded ? "spot-description__more--expanded" : ""
          }`}
        >
          <div className="spot-description__more-inner">
            {hiddenBlocks.map((block, index) =>
              renderBlock(block, `hidden-${index}`)
            )}
          </div>
        </div>
      ) : (
        isExpanded &&
        hiddenBlocks.map((block, index) =>
          renderBlock(block, `hidden-${index}`)
        )
      )}

      {hiddenBlocks.length > 0 && (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          aria-expanded={isExpanded}
          aria-controls={seoCollapsible ? "spot-description-more" : undefined}
          style={{
            color: "#14b8a6",
            fontWeight: 700,
            fontSize: "15px",
            background: "none",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
            padding: 0,
          }}
        >
          {isExpanded
            ? t(language, "learnLess")
            : t(language, "learnMore")}
        </button>
      )}
      <style jsx>{`
        .spot-description__eyebrow{display:block;margin-bottom:6px;color:#079ca5;font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.spot-description :global(p){max-width:760px}.spot-description :global(button){display:inline-flex!important;margin-top:4px!important;padding:9px 12px!important;border:1px solid #cde7e8!important;border-radius:9px!important;background:#eefafa!important;color:#078f96!important;font-size:10px!important;text-decoration:none!important}
        .spot-description__more {
          position: relative;
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 320ms ease;
        }
        .spot-description__more::before {
          position: absolute;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 1;
          height: 72px;
          background: linear-gradient(to bottom, rgba(255,255,255,0), #fff 82%);
          content: "";
          pointer-events: none;
          transform: translateY(2px);
        }
        .spot-description__more-inner {
          min-height: 0;
          overflow: hidden;
        }
        .spot-description__more--expanded {
          grid-template-rows: 1fr;
        }
        .spot-description__more--expanded::before {
          opacity: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          .spot-description__more { transition: none; }
        }
      `}</style>
    </section>
  );
}
