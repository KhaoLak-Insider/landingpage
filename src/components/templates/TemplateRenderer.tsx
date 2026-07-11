"use client";

import StandardTemplate, {
  type StandardTemplateProps,
} from "@/src/components/templates/StandardTemplate";
import PremiumHotelTemplate from "@/src/components/templates/PremiumHotelTemplate";

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
    case "premium-hotel":
    case "hotel-premium":
      return <PremiumHotelTemplate {...templateProps} />;

    case "standard":
    case "default":
    case "":
      return <StandardTemplate {...templateProps} />;

    default:
      return <StandardTemplate {...templateProps} />;
  }
}
