"use client";

import {
  ArrowUpRight,
  AtSign,
  Clock3,
  Mail,
  Map,
  MapPin,
  MessageCircle,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { DURATION, EASE, OFFSET } from "@/lib/motion";
import type { ContactChannel, ContactChannelKey, ContactInfo } from "@/types/contact";

const CHANNEL_ICONS: Record<ContactChannelKey, LucideIcon> = {
  address: MapPin,
  hours: Clock3,
  phone: Phone,
  email: Mail,
  instagramUrl: AtSign,
  naverMapUrl: Map,
  googleMapUrl: Map,
};

function getChannelHref(key: ContactChannelKey, value: string): string | undefined {
  switch (key) {
    case "hours":
    case "address":
      return undefined;
    case "phone":
      return `tel:${value}`;
    case "email":
      return `mailto:${value}`;
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
  kakaoChatUrl,
}: {
  channels: ContactChannel[];
  contact: ContactInfo;
  kakaoChatUrl: string;
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
        description="천안 안서동 파이커피로스터스와 함께할 새로운 공간을 기다립니다."
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

          {kakaoChatUrl && (
            <a
              href={kakaoChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-sm border border-black/10 bg-[#FEE500] p-5 text-[#191919] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#191919]/10 sm:p-6"
            >
              <span
                aria-hidden
                className="absolute -top-12 -right-10 h-36 w-36 rounded-full border border-[#191919]/10"
              />
              <span
                aria-hidden
                className="absolute -right-4 -bottom-16 h-32 w-32 rounded-full bg-white/20"
              />

              <span className="relative flex flex-col gap-5">
                <span className="flex min-w-0 flex-1 items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#191919] text-[#FEE500] shadow-sm">
                    <MessageCircle
                      aria-hidden
                      className="h-6 w-6"
                      strokeWidth={1.8}
                    />
                  </span>
                  <span className="flex min-w-0 flex-col gap-1.5">
                    <span className="font-sans text-[11px] font-semibold tracking-[0.14em] text-[#191919]/55">
                      KAKAO 1:1 CHAT
                    </span>
                    <strong className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                      원두와 납품, 톡으로 편하게 물어보세요
                    </strong>
                    <span className="font-sans text-sm leading-relaxed text-[#191919]/65">
                      매장에 맞는 원두 선택부터 샘플·납품 상담까지 편하게
                      남겨주세요.
                    </span>
                  </span>
                </span>

                <span className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#191919] px-5 font-sans text-sm font-medium text-white transition-transform duration-300 group-hover:translate-x-1">
                  카카오톡으로 상담하기
                  <ArrowUpRight aria-hidden className="h-4 w-4" />
                </span>
              </span>
            </a>
          )}
        </motion.div>
      </div>
    </div>
  );
}
