"use client";

import Image from "next/image";
import { ArrowUp } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import type { NavItem } from "@/constants/nav";
import type { ContactChannel, ContactChannelKey, ContactInfo } from "@/types/contact";

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
  return value;
}

export function FooterContent({
  brandName,
  tagline,
  navItems,
  contactChannels,
  contact,
}: {
  brandName: string;
  tagline: string;
  navItems: NavItem[];
  contactChannels: ContactChannel[];
  contact: ContactInfo;
}) {
  const shouldReduceMotion = useReducedMotion();
  const availableChannels = contactChannels.filter(
    (channel) => contact[channel.key],
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: shouldReduceMotion ? "auto" : "smooth" });
  };

  return (
    <div className="flex flex-col gap-16">
      <div className="grid gap-6 sm:grid-cols-3 sm:gap-8">
        <div className="flex flex-col gap-2">
          <Image
            src="/images/pi-logo-dark.png"
            alt={brandName}
            width={921}
            height={417}
            className="h-auto w-[100px] object-contain sm:w-[125px]"
          />
          <p className="font-sans text-sm leading-relaxed text-foreground/60">
            {tagline}
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-3 sm:items-center">
          <span className="font-sans text-xs tracking-[0.15em] text-foreground/40">
            Navigation
          </span>
          <ul className="flex flex-col gap-2 sm:items-center">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="font-sans text-sm text-foreground/70 transition-colors duration-300 ease-out hover:text-primary"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-2 sm:items-end">
          {availableChannels.length > 0 ? (
            availableChannels.map((channel) => {
              const value = contact[channel.key];
              const href = getChannelHref(channel.key, value);
              const displayValue = getChannelDisplayValue(channel.key, value);
              const isExternal = href?.startsWith("http") ?? false;

              return href ? (
                <a
                  key={channel.key}
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="break-all font-sans text-sm text-foreground/70 transition-colors duration-300 ease-out hover:text-primary sm:text-right"
                >
                  {displayValue}
                </a>
              ) : (
                <span
                  key={channel.key}
                  className="break-all font-sans text-sm text-foreground/70 sm:text-right"
                >
                  {displayValue}
                </span>
              );
            })
          ) : (
            <span className="font-sans text-sm text-foreground/40">-</span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 border-t border-border pt-8 sm:flex-row sm:justify-between">
        <p className="font-sans text-xs text-foreground/50">
          © 2026 PI Coffee Roasters. All Rights Reserved.
        </p>

        <button
          type="button"
          onClick={scrollToTop}
          aria-label="맨 위로 이동"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 text-primary transition-colors duration-300 ease-out hover:bg-primary hover:text-background"
        >
          <ArrowUp className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
