import type { GalleryImage } from "@/types/gallery";

/**
 * 실제 사진 준비 시 src만 교체하거나, 항목을 추가하면
 * 매스너리 그리드에 자동으로 반영된다.
 */
export const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: "/images/gallery/gallery-01.jpg",
    alt: "PI Coffee Roasters의 로스팅 머신",
    aspect: "landscape",
  },
  {
    src: "/images/gallery/gallery-02.jpg",
    alt: "로스팅 직후 드럼에서 쏟아지는 원두",
    aspect: "landscape",
  },
  {
    src: "/images/gallery/gallery-03.jpg",
    alt: "완성된 로스팅 원두의 텍스처 디테일",
    aspect: "landscape",
  },
  {
    src: "/images/gallery/gallery-04.jpg",
    alt: "커핑으로 원두의 품질을 확인하는 과정",
    aspect: "landscape",
  },
  {
    src: "/images/gallery/gallery-05.jpg",
    alt: "콜드브루가 추출되는 로스터리 공간",
    aspect: "portrait",
    objectPosition: "top",
  },
  {
    src: "/images/gallery/gallery-06.jpg",
    alt: "PI Coffee Roasters 원두 패키지 디테일",
    aspect: "landscape",
  },
  {
    src: "/images/gallery/gallery-07.jpg",
    alt: "가지런히 놓인 PI Coffee Roasters 패키지",
    aspect: "landscape",
  },
  {
    src: "/images/gallery/gallery-08.jpg",
    alt: "출고를 기다리는 원두 패키지와 콜드브루 병",
    aspect: "portrait",
    objectPosition: "top",
  },
  {
    src: "/images/gallery/gallery-09.jpg",
    alt: "PI Coffee Roasters 매장 외관과 사이니지",
    aspect: "landscape",
  },
];
