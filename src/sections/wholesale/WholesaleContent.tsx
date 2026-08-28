"use client";

import {
  Award,
  Headphones,
  SlidersHorizontal,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { DURATION, EASE, OFFSET, STAGGER } from "@/lib/motion";
import { notoSansKR } from "@/lib/fonts";
import type {
  WholesaleBenefit,
  WholesaleBenefitIcon,
  WholesaleInfoItem,
} from "@/types/wholesale";

const BENEFIT_ICONS: Record<WholesaleBenefitIcon, LucideIcon> = {
  quality: Award,
  supply: Truck,
  custom: SlidersHorizontal,
  support: Headphones,
};

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER } },
};

export function WholesaleContent({
  benefits,
  info,
}: {
  benefits: WholesaleBenefit[];
  info: WholesaleInfoItem[];
}) {
  const shouldReduceMotion = useReducedMotion();

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : OFFSET },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: DURATION.item, ease: EASE },
    },
  };

  const fadeUp = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : OFFSET },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.4 } as const,
    transition: { duration: DURATION.block, ease: EASE },
  };

  return (
    <div className="flex flex-col gap-16">
      <SectionIntro
        eyebrow="06 — Wholesale"
        title="Wholesale"
        description="매장에 어울리는 원두를 고르고, 매일 같은 맛을 낼 수 있는 기준까지 함께 만듭니다."
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4"
      >
        {benefits.map((benefit) => {
          const Icon = BENEFIT_ICONS[benefit.icon];
          return (
            <motion.div
              key={benefit.title}
              variants={itemVariants}
              className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="font-sans text-lg font-medium tracking-tight text-primary">
                {benefit.title}
              </h3>
              <p className="font-sans text-sm leading-relaxed text-foreground/70">
                {benefit.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        {...fadeUp}
        className="grid grid-cols-2 gap-8 rounded-sm border border-border bg-surface p-8 sm:grid-cols-4 sm:p-10"
      >
        {info.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-1 text-center"
          >
            <span
              className={`${notoSansKR.className} text-xs tracking-[0.15em] text-foreground/50`}
            >
              {item.label}
            </span>
            <span
              className={`${notoSansKR.className} text-xl font-medium text-primary sm:text-2xl`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </motion.div>

      <motion.div
        {...fadeUp}
        className="flex flex-col items-center gap-8 text-center"
      >
        <div className="flex max-w-2xl flex-col gap-3">
          <h3 className="font-display text-xl font-medium tracking-tight text-primary sm:text-2xl">
            매장마다 필요한 커피는 다릅니다.
          </h3>
          <p className="font-sans text-sm leading-relaxed text-foreground/70 sm:text-base">
            공간의 분위기와 주력 메뉴, 사용하는 장비를 살펴 원두와 추출
            방향을 제안합니다. 새로 문을 여는 매장은 첫 세팅부터, 운영 중인
            매장은 지금의 고민부터 들려주세요.
          </p>
        </div>
        <Button href="#contact" variant="primary">
          납품 문의하기
        </Button>
      </motion.div>
    </div>
  );
}
