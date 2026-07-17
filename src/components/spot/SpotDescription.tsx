"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
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
    return (
      <div key={key} className="spot-description__markdown">
        <ReactMarkdown>
          {block.type === "heading"
            ? `### ${block.content || ""}`
            : block.content || ""}
        </ReactMarkdown>
      </div>
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
        .spot-description__eyebrow{display:block;margin-bottom:6px;color:#079ca5;font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.spot-description :global(.spot-description__markdown p){max-width:760px;margin:0 0 16px;color:#475569;font-size:15px;line-height:1.8}.spot-description :global(.spot-description__markdown h1),.spot-description :global(.spot-description__markdown h2),.spot-description :global(.spot-description__markdown h3),.spot-description :global(.spot-description__markdown h4),.spot-description :global(.spot-description__markdown h5),.spot-description :global(.spot-description__markdown h6){margin:24px 0 12px;color:#10233f;font-size:20px;font-weight:700;line-height:1.35}.spot-description :global(.spot-description__markdown ul),.spot-description :global(.spot-description__markdown ol){max-width:760px;margin:0 0 16px;padding-left:24px;color:#475569;font-size:15px;line-height:1.8}.spot-description :global(.spot-description__markdown ul){list-style:disc}.spot-description :global(.spot-description__markdown ol){list-style:decimal}.spot-description :global(.spot-description__markdown li){margin-bottom:5px;padding-left:3px}.spot-description :global(.spot-description__markdown strong){color:#263b56;font-weight:700}.spot-description :global(.spot-description__markdown em){font-style:italic}.spot-description :global(.spot-description__markdown a){color:#078f96;font-weight:600;text-decoration:underline;text-underline-offset:2px}.spot-description :global(button){display:inline-flex!important;margin-top:4px!important;padding:9px 12px!important;border:1px solid #cde7e8!important;border-radius:9px!important;background:#eefafa!important;color:#078f96!important;font-size:10px!important;text-decoration:none!important}
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
