"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { DURATION, EASE, OFFSET } from "@/lib/motion";

interface SectionIntroProps {
  eyebrow: string;
  title: string;
  description?: string;
  /** dark: 밝은 배경 위(text-primary), light: 이미지·어두운 배경 위(text-background) */
  tone?: "dark" | "light";
  className?: string;
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  tone = "dark",
  className,
}: SectionIntroProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : OFFSET }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: DURATION.block, ease: EASE }}
      className={cn("flex flex-col items-center gap-6 text-center", className)}
    >
      <div className="flex flex-col items-center gap-3">
        <span
          className={cn(
            "font-sans text-sm tracking-[0.2em]",
            tone === "dark" ? "text-primary/60" : "text-background/60",
          )}
        >
          {eyebrow}
        </span>

        <h2
          className={cn(
            "text-balance font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl md:text-5xl",
            tone === "dark" ? "text-primary" : "text-background",
          )}
        >
          {title}
        </h2>
      </div>

      {description ? (
        <p
          className={cn(
            "max-w-xl text-balance font-sans text-base leading-relaxed sm:text-lg",
            tone === "dark" ? "text-foreground/70" : "text-background/80",
          )}
        >
          {description}
        </p>
      ) : null}
    </motion.div>
  );
}
