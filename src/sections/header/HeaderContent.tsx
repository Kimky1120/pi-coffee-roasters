"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { NAV_ITEMS } from "@/constants/nav";
import { SITE_CONFIG } from "@/constants/site";
import { DURATION, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils/cn";

const SCROLL_THRESHOLD = 32;

export function HeaderContent() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const solidHeader = pathname !== "/" || scrolled || menuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-500 ease-out",
        solidHeader
          ? "border-border bg-background/80 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6 sm:h-16">
        <Link href="/#hero" className="shrink-0" onClick={() => setMenuOpen(false)}>
          <Image
            src={
              solidHeader
                ? "/images/pi-logo-dark.png"
                : "/images/pi-logo-white.png"
            }
            alt={SITE_CONFIG.name}
            width={921}
            height={417}
            priority
            className="h-auto w-[100px] object-contain sm:w-[125px]"
          />
        </Link>

        <nav aria-label="주요 메뉴" className="hidden items-center gap-7 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-sans text-sm tracking-wide transition-colors duration-300 ease-out",
                solidHeader
                  ? "text-foreground/70 hover:text-primary"
                  : "text-background/80 hover:text-background",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            aria-label="로그인 및 회원가입"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 ease-out hover:bg-primary/10",
              solidHeader ? "text-primary" : "text-background",
            )}
          >
            <UserRound className="h-[19px] w-[19px]" aria-hidden />
          </Link>
          <Link
            href="/cart"
            onClick={() => setMenuOpen(false)}
            aria-label="장바구니"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 ease-out hover:bg-primary/10",
              solidHeader ? "text-primary" : "text-background",
            )}
          >
            <ShoppingBag className="h-[19px] w-[19px]" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 ease-out md:hidden",
              solidHeader ? "text-primary" : "text-background",
            )}
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : DURATION.item,
              ease: EASE,
            }}
            className="fixed inset-x-0 top-14 h-[calc(100dvh-3.5rem)] border-t border-border bg-background sm:top-16 sm:h-[calc(100dvh-4rem)] md:hidden"
          >
            <nav
              aria-label="모바일 메뉴"
              className="mx-auto flex h-full max-w-6xl flex-col px-6 py-8"
            >
              <ul className="flex flex-col">
                {NAV_ITEMS.map((item, index) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: shouldReduceMotion ? 0 : index * 0.035,
                      duration: shouldReduceMotion ? 0 : DURATION.item,
                    }}
                    className="border-b border-border"
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-baseline justify-between py-4 text-primary"
                    >
                      <span className="font-display text-3xl">{item.label}</span>
                      <span className="font-sans text-[10px] tracking-[0.2em] text-foreground/40">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-auto grid grid-cols-2 gap-3 pt-8">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 px-4 py-3 text-sm text-primary"
                >
                  <UserRound className="h-4 w-4" aria-hidden />
                  로그인
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm text-background"
                >
                  <ShoppingBag className="h-4 w-4" aria-hidden />
                  장바구니
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
