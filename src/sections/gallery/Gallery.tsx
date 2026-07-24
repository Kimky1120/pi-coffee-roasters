import { GALLERY_IMAGES } from "@/data/gallery";
import { GalleryContent } from "./GalleryContent";

export function Gallery() {
  return (
    <section
      id="gallery"
      className="relative w-full overflow-hidden bg-surface py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <GalleryContent images={GALLERY_IMAGES} />
      </div>
    </section>
  );
}
