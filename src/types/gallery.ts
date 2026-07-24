export type GalleryAspect = "portrait" | "square" | "landscape" | "tall";

export interface GalleryImage {
  src: string;
  alt: string;
  aspect: GalleryAspect;
  objectPosition?: "center" | "top" | "bottom";
}
