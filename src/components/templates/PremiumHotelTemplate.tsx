"use client";

import HotelHero from "@/src/components/hotel/HotelHero";
import StandardTemplate, {
  type StandardTemplateProps,
} from "@/src/components/templates/StandardTemplate";

export default function PremiumHotelTemplate(
  props: StandardTemplateProps
) {
  const hotelProfile = props.hotelProfile;
  void hotelProfile;

  return (
    <>
      <HotelHero
        spot={props.spot}
        language={props.language}
        title={props.localizedTitle}
        description={props.localizedDescription}
        category={props.localizedCategory}
        backHref={props.localizedHref("/entdecken")}
      />

      <StandardTemplate
        {...props}
        showHero={false}
      />
    </>
  );
}
