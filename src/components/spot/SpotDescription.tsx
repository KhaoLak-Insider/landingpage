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
}

export default function SpotDescription({
  title,
  blocks,
  language,
  initiallyVisibleBlocks = 2,
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
    <section>
      <h2
        style={{
          fontSize: 24,
          fontWeight: 800,
          marginBottom: "20px",
        }}
      >
        {t(language, "about")} {title}
      </h2>

      {visibleBlocks.map((block, index) =>
        renderBlock(block, `visible-${index}`)
      )}

      {isExpanded &&
        hiddenBlocks.map((block, index) =>
          renderBlock(block, `hidden-${index}`)
        )}

      {hiddenBlocks.length > 0 && (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
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
    </section>
  );
}
