"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { DURATION, EASE, OFFSET } from "@/lib/motion";

export function HeroContent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : OFFSET }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.block, ease: EASE }}
      className="relative z-10 flex flex-col items-center gap-8 px-6 text-center text-background"
    >
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-balance font-display text-4xl font-normal leading-[1.15] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          오래 기억되는 커피를 만듭니다.
        </h1>

        <div className="flex flex-col gap-2 font-sans text-base leading-relaxed text-background/90 sm:text-lg">
          <p>유행보다 균형을, 화려함보다 본질을.</p>
          <p>산지의 개성을 담아 일상의 좋은 한 잔을 전합니다.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button href="#about" variant="solid">
          About
        </Button>
        <Button href="#our-coffee" variant="outline">
          Coffee
        </Button>
      </div>
    </motion.div>
  );
}
