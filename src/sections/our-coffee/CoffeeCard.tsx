"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useInView } from "framer-motion";
import type { CoffeeBean } from "@/types/coffee";
import { cn } from "@/lib/utils/cn";
import { FlavorMeter } from "./FlavorMeter";

const STATUS_LABEL: Record<CoffeeBean["status"], string> = {
  available: "Available",
  "coming-soon": "Coming Soon",
};

export function CoffeeCard({ bean }: { bean: CoffeeBean }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const isInView = useInView(cardRef, { amount: 0.55 });

  return (
    <Link
      ref={cardRef}
      href={`/coffee/${bean.slug}`}
      aria-label={`${bean.name} 상세페이지 보기`}
      className={cn(
        "group relative flex h-full min-h-[660px] overflow-hidden rounded-sm border border-border bg-background",
        "transition-[transform,box-shadow,border-color] duration-300 ease-out",
        "hover:-translate-y-2 hover:border-transparent hover:shadow-xl hover:shadow-primary/15",
        "focus-visible:-translate-y-2 focus-visible:border-transparent focus-visible:shadow-xl focus-visible:shadow-primary/15",
        isInView &&
          "max-sm:-translate-y-2 max-sm:border-transparent max-sm:shadow-xl max-sm:shadow-primary/15",
      )}
    >
      <Image
        src={bean.image}
        alt=""
        fill
        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
        className={cn(
          "object-cover scale-100 opacity-0 transition-[opacity,transform] duration-700 ease-out",
          "group-hover:scale-[1.06] group-hover:opacity-100 group-focus-visible:scale-[1.06] group-focus-visible:opacity-100",
          isInView && "max-sm:scale-[1.06] max-sm:opacity-100",
        )}
      />
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-b from-black/40 via-black/35 to-black/75 opacity-0 transition-opacity duration-500",
          "group-hover:opacity-100 group-focus-visible:opacity-100",
          isInView && "max-sm:opacity-100",
        )}
      />

      <div
        className={cn(
          "relative z-10 flex w-full flex-col gap-5 p-8 transition-opacity duration-300 sm:p-10",
          "group-hover:opacity-0 group-focus-visible:opacity-0",
          isInView && "max-sm:opacity-0",
        )}
      >
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs tracking-[0.2em] text-primary/50">
            {bean.code}
          </span>
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-xs tracking-wide",
              bean.status === "available"
                ? "border-primary/30 text-primary"
                : "border-border text-foreground/40",
            )}
          >
            {STATUS_LABEL[bean.status]}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-sans text-xs tracking-[0.15em] text-foreground/50">
            {bean.type}
          </span>
          <h3 className="font-display text-2xl font-medium tracking-tight text-primary sm:text-3xl">
            {bean.name}
          </h3>
        </div>

        <p className="font-sans text-sm leading-relaxed text-foreground/70">
          {bean.description}
        </p>

        <span className="font-sans text-xs tracking-[0.15em] text-foreground/50">
          {bean.origin} · {bean.roastLevel}
        </span>

        <FlavorMeter bean={bean} />

        <div className="mt-auto flex flex-col gap-3 pt-4">
          <div className="flex flex-col gap-2">
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-foreground/40">
              Flavor Notes
            </span>
            <div className="flex flex-wrap gap-2">
              {bean.tastingNotes.map((note) => (
                <span
                  key={note}
                  className="rounded-full bg-primary/5 px-3 py-1 text-xs text-foreground/70"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-foreground/40">
              Best With
            </span>
            <div className="flex flex-wrap gap-2">
              {bean.recommendedBrewing.map((method) => (
                <span
                  key={method}
                  className="rounded-full border border-border px-3 py-1 text-xs text-foreground/60"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-20 flex translate-y-3 flex-col p-8 text-white opacity-0 transition-[opacity,transform] delay-75 duration-500 sm:p-10",
          "group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100",
          isInView && "max-sm:translate-y-0 max-sm:opacity-100",
        )}
      >
        <div className="flex flex-col gap-2">
          <span className="font-sans text-xs tracking-[0.2em] text-white/75">
            {bean.code}
          </span>
          <span className="font-sans text-xs tracking-[0.15em] text-white/75">
            {bean.type}
          </span>
        </div>

        <div className="mt-10">
          <h3 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
            {bean.name}
          </h3>
          <div className="mt-5 h-px bg-white/40" />
          <p className="mt-5 max-w-sm font-sans text-sm leading-7 text-white/90">
            {bean.description}
          </p>
        </div>

        <div className="mt-auto">
          <div className="mb-5 flex flex-wrap gap-2">
            {bean.tastingNotes.map((note) => (
              <span
                key={note}
                className="rounded-full border border-white/40 bg-black/10 px-3 py-1 font-sans text-xs text-white/90 backdrop-blur-sm"
              >
                {note}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between border-b border-white/50 pb-3 font-display text-lg">
            <span>View Details</span>
            <ArrowRight aria-hidden size={24} strokeWidth={1.4} />
          </div>
        </div>
      </div>
    </Link>
  );
}
