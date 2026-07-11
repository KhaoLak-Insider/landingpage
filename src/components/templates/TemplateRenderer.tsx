"use client";

import StandardTemplate, {
  type StandardTemplateProps,
} from "@/src/components/templates/StandardTemplate";

interface TemplateRendererProps
  extends StandardTemplateProps {
  template?: string | null;
}

function normalizeTemplate(
  template?: string | null
): string {
  return String(template || "standard")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");
}

export default function TemplateRenderer({
  template,
  ...templateProps
}: TemplateRendererProps) {
  const normalizedTemplate = normalizeTemplate(template);

  switch (normalizedTemplate) {
    case "standard":
    case "default":
    case "":
      return <StandardTemplate {...templateProps} />;

    default:
      return <StandardTemplate {...templateProps} />;
  }
}
