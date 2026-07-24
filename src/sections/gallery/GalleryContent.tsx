"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
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
        eyebrow="06 — Gallery"
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
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 640px) 33vw, 50vw"
              style={{ objectPosition: image.objectPosition ?? "center" }}
              className="object-cover transition-transform duration-700 ease-out hover:scale-[1.04]"
            />
          </motion.figure>
        ))}
      </motion.div>

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
