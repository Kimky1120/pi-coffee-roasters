"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SITE_CONFIG } from "@/constants/site";
import { DURATION, EASE, OFFSET } from "@/lib/motion";

export function AboutContent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : OFFSET }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: DURATION.block, ease: EASE }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-3">
        <span className="font-sans text-sm tracking-[0.2em] text-primary/60">
          02 — About
        </span>

        <h2 className="text-balance font-display text-3xl font-medium leading-tight tracking-tight text-primary sm:text-4xl md:text-5xl">
          Philosophy
        </h2>
      </div>

      <div className="flex max-w-xl flex-col gap-4 font-sans text-base leading-relaxed text-foreground/80 sm:text-lg">
        {SITE_CONFIG.philosophy.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </motion.div>
  );
}
