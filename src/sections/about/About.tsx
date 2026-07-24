import Image from "next/image";
import { AboutContent } from "./AboutContent";

/**
 * 실제 로스터리 사진 준비 시 이 경로의 파일을 교체하거나
 * ABOUT_IMAGE_SRC 값만 바꾸면 된다.
 */
const ABOUT_IMAGE_SRC = "/images/about/about-placeholder.jpg";
const ABOUT_IMAGE_ALT =
  "로스팅을 마친 원두가 쿨링 트레이 위에서 믹싱 암에 의해 식혀지는 모습";

export function About() {
  return (
    <section
      id="about"
      className="relative w-full overflow-hidden bg-background py-24 sm:py-32"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm">
          <Image
            src={ABOUT_IMAGE_SRC}
            alt={ABOUT_IMAGE_ALT}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-center grayscale brightness-95 contrast-110"
          />
        </div>
        <AboutContent />
      </div>
    </section>
  );
}
