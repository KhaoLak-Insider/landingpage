"use client";

import type { HotelForm } from "../types";
import GalleryEditor from "./GalleryEditor";

interface Props {
  hotel: HotelForm;
  hotelSlug: string;
  setHotel: React.Dispatch<React.SetStateAction<HotelForm>>;
}

export default function HotelGallery({ hotel, hotelSlug, setHotel }: Props) {
  return (
    <section className="admin-hotel-card">
      <div className="admin-hotel-card__header">
        <div>
          <span>Medien</span>
          <h2>Hotelgalerie</h2>
        </div>
        <p>{hotel.gallery_images.length} Bilder</p>
      </div>

      <GalleryEditor
        images={hotel.gallery_images}
        hotelSlug={hotelSlug}
        onChange={(images) =>
          setHotel((current) => ({
            ...current,
            gallery_images: images,
          }))
        }
      />
    </section>
  );
}
