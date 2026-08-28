"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { HistoryItem } from "@/data/history";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { DURATION, EASE, OFFSET, STAGGER } from "@/lib/motion";

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER } },
};

export function HistoryContent({ items }: { items: HistoryItem[] }) {
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
        eyebrow="03 — History"
        title="History"
        description="2022 — Present"
        tone="light"
      />

      <motion.ol
        variants={listVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="border-t border-background/25"
      >
        {items.map((item) => (
          <motion.li
            key={`${item.date}-${item.title}`}
            variants={itemVariants}
            className="grid gap-3 border-b border-background/25 py-7 sm:grid-cols-[9rem_1fr] sm:items-baseline sm:gap-10 sm:py-8"
          >
            <time className="font-sans text-sm font-normal tracking-[0.1em] text-background/60 sm:text-[15px]">
              {item.date}
            </time>
            <p className="text-balance font-sans text-base font-normal leading-relaxed tracking-[-0.01em] text-background/90 sm:text-lg">
              {item.title}
            </p>
          </motion.li>
        ))}
      </motion.ol>
    </div>
  );
}
