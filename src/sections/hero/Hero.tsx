import Image from "next/image";
import { HeroContent } from "./HeroContent";

/**
 * 실제 로스터리 사진 준비 시 이 경로의 파일을 교체하거나
 * HERO_IMAGE_SRC 값만 바꾸면 된다.
 */
const HERO_IMAGE_SRC = "/images/hero/roastery-placeholder.jpg";
const HERO_IMAGE_ALT =
  "천안 안서동 파이커피로스터스 로스팅룸에서 원두를 살피는 로스터의 모습";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex h-[100dvh] min-h-[640px] w-full items-center justify-center overflow-hidden"
    >
      <Image
        src={HERO_IMAGE_SRC}
        alt={HERO_IMAGE_ALT}
        fill
        priority
        sizes="100vw"
        className="object-cover object-[35%_center] brightness-90 contrast-110"
      />
      <div className="absolute inset-0 bg-primary/40" aria-hidden />
      <HeroContent />
    </section>
  );
}
