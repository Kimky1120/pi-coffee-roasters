"use client";

import { AtSign, Mail, Map, MapPin, Phone, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { DURATION, EASE, OFFSET } from "@/lib/motion";
import type { ContactChannel, ContactChannelKey, ContactInfo } from "@/types/contact";

const CHANNEL_ICONS: Record<ContactChannelKey, LucideIcon> = {
  address: MapPin,
  phone: Phone,
  email: Mail,
  instagramUrl: AtSign,
  naverMapUrl: Map,
  googleMapUrl: Map,
};

function getChannelHref(key: ContactChannelKey, value: string): string | undefined {
  switch (key) {
    case "phone":
      return `tel:${value}`;
    case "email":
      return `mailto:${value}`;
    case "address":
      return undefined;
    default:
      return value;
  }
}

function getChannelDisplayValue(
  key: ContactChannelKey,
  value: string,
): string {
  if (key === "instagramUrl") return "instagram.com/picoffee.roasters";
  if (key === "naverMapUrl") return "map.naver.com";
  if (key === "googleMapUrl") return "google.com";
  return value;
}

export function ContactContent({
  channels,
  contact,
}: {
  channels: ContactChannel[];
  contact: ContactInfo;
}) {
  const shouldReduceMotion = useReducedMotion();
  const availableChannels = channels.filter((channel) => contact[channel.key]);

  const fadeUp = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : OFFSET },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.4 } as const,
    transition: { duration: DURATION.block, ease: EASE },
  };

  return (
    <div className="flex flex-col gap-16">
      <SectionIntro
        eyebrow="07 — Contact"
        title="Contact"
        description="PI Coffee Roasters와 함께할 새로운 공간을 기다립니다."
      />

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <motion.div {...fadeUp} className="flex flex-col gap-8">
          {availableChannels.length > 0 ? (
            availableChannels.map((channel) => {
              const value = contact[channel.key];
              const href = getChannelHref(channel.key, value);
              const displayValue = getChannelDisplayValue(channel.key, value);
              const Icon = CHANNEL_ICONS[channel.key];
              const isExternal = href?.startsWith("http") ?? false;

              return (
                <div key={channel.key} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary">
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-sans text-xs tracking-[0.15em] text-foreground/50">
                      {channel.label}
                    </span>
                    {href ? (
                      <a
                        href={href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        className="break-all font-sans text-base text-primary underline-offset-4 hover:underline sm:text-lg"
                      >
                        {displayValue}
                      </a>
                    ) : (
                      <span className="break-all font-sans text-base text-primary sm:text-lg">
                        {displayValue}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="font-sans text-base leading-relaxed text-foreground/60">
              연락처 정보는 준비 중입니다.
            </p>
          )}
        </motion.div>

        <motion.div
          {...fadeUp}
          className="flex flex-col justify-center gap-7 rounded-sm border border-border bg-surface p-8 sm:p-10"
        >
          <div className="flex flex-col gap-3">
            <span className="font-sans text-xs tracking-[0.16em] text-foreground/50">
              PI COFFEE WHOLESALE
            </span>
            <h3 className="font-display text-xl font-medium tracking-tight text-primary sm:text-2xl">
              커피가 매장의 인상이 되도록
            </h3>
            <p className="font-sans text-sm leading-relaxed text-foreground/70">
              공간의 분위기와 주력 메뉴, 사용하는 장비를 살펴 매장에 어울리는
              원두와 추출 방향을 제안합니다. 새로 문을 여는 매장은 첫 세팅부터,
              운영 중인 매장은 지금의 고민부터 함께 이야기합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 border-y border-border sm:grid-cols-3">
            {["원두 셀렉션", "메뉴 밸런스", "추출 기준 세팅"].map((item) => (
              <span
                key={item}
                className="border-b border-border py-3 font-sans text-sm text-primary last:border-b-0 sm:border-r sm:border-b-0 sm:px-3 sm:text-center sm:last:border-r-0"
              >
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
