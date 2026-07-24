"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { NAV_ITEMS } from "@/constants/nav";
import { SITE_CONFIG } from "@/constants/site";
import { DURATION, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils/cn";

const SCROLL_THRESHOLD = 32;

export function HeaderContent() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-500 ease-out",
        scrolled
          ? "border-border bg-background/80 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6 sm:h-16">
        <a
          href="#hero"
          className={cn(
            "font-display text-lg font-medium tracking-tight transition-colors duration-300 ease-out sm:text-xl",
            scrolled ? "text-primary" : "text-background",
          )}
        >
          {SITE_CONFIG.name}
        </a>

        <nav aria-label="Main" className="hidden items-center gap-8 sm:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "font-sans text-sm tracking-wide transition-colors duration-300 ease-out",
                scrolled
                  ? "text-foreground/70 hover:text-primary"
                  : "text-background/80 hover:text-background",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-300 ease-out sm:hidden",
            scrolled ? "text-primary" : "text-background",
          )}
        >
          {menuOpen ? (
            <X className="h-5 w-5" aria-hidden />
          ) : (
            <Menu className="h-5 w-5" aria-hidden />
          )}
        </button>
      </div>

      <motion.nav
        aria-label="Mobile"
        initial={false}
        animate={menuOpen ? "open" : "closed"}
        variants={{
          open: { height: "auto", opacity: 1 },
          closed: { height: 0, opacity: 0 },
        }}
        transition={{ duration: shouldReduceMotion ? 0 : DURATION.item, ease: EASE }}
        className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-md sm:hidden"
      >
        <ul className="flex flex-col gap-1 px-6 py-4">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2 font-sans text-sm text-foreground/80 transition-colors duration-300 ease-out hover:text-primary"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </motion.nav>
    </header>
  );
}
