"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { RoastingStep } from "@/types/roasting";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { DURATION, EASE, OFFSET, STAGGER } from "@/lib/motion";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER } },
};

export function RoastingContent({ steps }: { steps: RoastingStep[] }) {
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
        eyebrow="04 — Roasting"
        title="Roasting Philosophy"
        description="우리는 로스팅으로 원두를 바꾸지 않습니다. 원두가 가진 본연의 목소리를 가장 정확하게 전달할 뿐입니다."
        tone="light"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4"
      >
        {steps.map((step) => (
          <motion.div
            key={step.step}
            variants={itemVariants}
            className="flex flex-col gap-3 border-t border-background/20 pt-6"
          >
            <span className="font-display text-2xl font-medium text-background/50">
              {step.step}
            </span>
            <h3 className="font-sans text-lg font-medium tracking-tight text-background">
              {step.title}
            </h3>
            <p className="font-sans text-sm leading-relaxed text-background/70">
              {step.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
