"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
} from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { GalleryAspect, GalleryImage } from "@/types/gallery";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { DURATION, EASE, OFFSET, STAGGER } from "@/lib/motion";

const ASPECT_CLASS: Record<GalleryAspect, string> = {
  portrait: "aspect-[4/5]",
  square: "aspect-square",
  landscape: "aspect-[4/3]",
  tall: "aspect-[3/5]",
};

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER } },
};

export function GalleryContent({ images }: { images: GalleryImage[] }) {
  const shouldReduceMotion = useReducedMotion();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (selectedIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedIndex(null);
      if (event.key === "ArrowLeft") {
        setSelectedIndex((current) =>
          current === null ? null : (current - 1 + images.length) % images.length,
        );
      }
      if (event.key === "ArrowRight") {
        setSelectedIndex((current) =>
          current === null ? null : (current + 1) % images.length,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [images.length, selectedIndex]);

  const selectedImage =
    selectedIndex === null ? null : images[selectedIndex];

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : OFFSET },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: DURATION.item, ease: EASE },
    },
  };

  return (
    <div className="flex flex-col gap-16">
      <SectionIntro
        eyebrow="07 — Gallery"
        title="Gallery"
        description="생두를 고르는 손끝부터 한 잔의 완성까지, PI Coffee의 하루를 담았습니다."
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="columns-2 gap-6 sm:columns-3 sm:gap-8"
      >
        {images.map((image) => (
          <motion.figure
            key={image.src}
            variants={itemVariants}
            className={`relative mb-6 w-full overflow-hidden rounded-sm break-inside-avoid sm:mb-8 ${ASPECT_CLASS[image.aspect]}`}
          >
            <button
              type="button"
              onClick={() => setSelectedIndex(images.indexOf(image))}
              aria-label={`${image.alt} 크게 보기`}
              className="group absolute inset-0 cursor-zoom-in overflow-hidden text-left"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                style={{ objectPosition: image.objectPosition ?? "center" }}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <span className="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                <ZoomIn className="h-4 w-4" aria-hidden />
              </span>
            </button>
          </motion.figure>
        ))}
      </motion.div>

      {selectedImage && selectedIndex !== null && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="갤러리 이미지 크게 보기"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedIndex(null)}
            aria-label="이미지 닫기"
            className="absolute top-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:top-6 sm:right-6"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedIndex(
                    (selectedIndex - 1 + images.length) % images.length,
                  );
                }}
                aria-label="이전 이미지"
                className="absolute top-1/2 left-2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedIndex((selectedIndex + 1) % images.length);
                }}
                aria-label="다음 이미지"
                className="absolute top-1/2 right-2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </>
          )}

          <div
            className="relative h-[calc(100dvh-7rem)] w-[calc(100vw-2rem)] sm:h-[calc(100dvh-6rem)] sm:w-[calc(100vw-10rem)]"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt}
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-sans text-xs tracking-[0.12em] text-white/65 sm:bottom-6">
            {selectedIndex + 1} / {images.length}
          </span>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : OFFSET }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: DURATION.block, ease: EASE }}
        className="flex flex-col items-center gap-3 pt-4 text-center"
      >
        <p className="font-sans text-sm text-foreground/60 sm:text-base">
          이 순간들을, 이제 여러분의 자리에서 이어가 보세요.
        </p>
        <a
          href="#contact"
          aria-label="Contact 섹션으로 이동"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 text-primary transition-colors duration-300 ease-out hover:bg-primary hover:text-background"
        >
          <ChevronDown className="h-4 w-4" aria-hidden />
        </a>
      </motion.div>
    </div>
  );
}
