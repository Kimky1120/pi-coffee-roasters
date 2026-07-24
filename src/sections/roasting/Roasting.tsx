import Image from "next/image";
import { ROASTING_STEPS } from "@/data/roasting";
import { RoastingContent } from "./RoastingContent";

/**
 * 실제 로스팅 사진 준비 시 이 경로의 파일을 교체하거나
 * ROASTING_IMAGE_SRC 값만 바꾸면 된다.
 */
const ROASTING_IMAGE_SRC = "/images/roasting/roasting-placeholder.jpg";
const ROASTING_IMAGE_ALT =
  "로스팅 머신의 시야창 너머로 붉은 열기 속에 원두가 구워지는 모습";

export function Roasting() {
  return (
    <section
      id="roasting"
      className="relative flex w-full items-center overflow-hidden py-24 sm:py-32"
    >
      <Image
        src={ROASTING_IMAGE_SRC}
        alt={ROASTING_IMAGE_ALT}
        fill
        sizes="100vw"
        className="object-cover object-[center_60%] brightness-90 contrast-115 saturate-75"
      />
      <div className="absolute inset-0 bg-primary/70" aria-hidden />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
        <RoastingContent steps={ROASTING_STEPS} />
      </div>
    </section>
  );
}
