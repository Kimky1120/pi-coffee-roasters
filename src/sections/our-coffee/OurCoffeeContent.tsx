"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { CoffeeBean } from "@/types/coffee";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { DURATION, EASE, OFFSET, STAGGER } from "@/lib/motion";
import { CoffeeCard } from "./CoffeeCard";

const OUR_COFFEE_SUBTITLE =
  "블렌드부터 디카페인까지, 산지의 개성을 균형 있게 담은 원두를 소개합니다.";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: STAGGER },
  },
};

export function OurCoffeeContent({ beans }: { beans: CoffeeBean[] }) {
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
        eyebrow="04 — Our Coffee"
        title="Our Coffee"
        description={OUR_COFFEE_SUBTITLE}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3"
      >
        {beans.map((bean) => (
          <motion.div key={bean.code} variants={itemVariants} className="h-full">
            <CoffeeCard bean={bean} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
