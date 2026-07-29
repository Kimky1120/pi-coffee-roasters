"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import { NAV_ITEMS } from "@/constants/nav";
import { SITE_CONFIG } from "@/constants/site";
import { DURATION, EASE } from "@/lib/motion";
import {
  getCartItemCount,
  getCartSnapshot,
  getServerCartSnapshot,
  subscribeCart,
} from "@/lib/cart";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

const SCROLL_THRESHOLD = 32;

export function HeaderContent() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const cartItems = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );
  const cartCount = getCartItemCount(cartItems);
  const shouldReduceMotion = useReducedMotion();
  const solidHeader =
    pathname !== "/" || scrolled || menuOpen || accountMenuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    void supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!accountMenuOpen) return;

    const onClickOutside = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountMenuOpen(false);
    };

    window.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [accountMenuOpen]);

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

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { error } = await supabase.auth.signOut();
    if (error) return;

    setAccountMenuOpen(false);
    setMenuOpen(false);
    router.replace("/?auth=logged-out");
    router.refresh();
  }

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
          {user ? (
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setAccountMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={accountMenuOpen}
                aria-label="마이페이지 및 로그아웃"
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 ease-out hover:bg-primary/10",
                  solidHeader ? "text-primary" : "text-background",
                )}
              >
                <UserRound className="h-[19px] w-[19px]" aria-hidden />
              </button>

              <AnimatePresence>
                {accountMenuOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : DURATION.item,
                      ease: EASE,
                    }}
                    className="absolute right-0 top-12 w-40 overflow-hidden rounded-sm border border-border bg-background"
                  >
                    <Link
                      href="/account"
                      role="menuitem"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-foreground/70 transition-colors duration-300 ease-out hover:bg-primary/10 hover:text-primary"
                    >
                      <UserRound className="h-4 w-4" aria-hidden />
                      마이페이지
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-foreground/70 transition-colors duration-300 ease-out hover:bg-primary/10 hover:text-primary"
                    >
                      <LogOut className="h-4 w-4" aria-hidden />
                      로그아웃
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
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
          )}
          <Link
            href="/cart"
            onClick={() => setMenuOpen(false)}
            aria-label={`장바구니${cartCount > 0 ? `, 상품 ${cartCount}개` : ""}`}
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 ease-out hover:bg-primary/10",
              solidHeader ? "text-primary" : "text-background",
            )}
          >
            <ShoppingBag className="h-[19px] w-[19px]" aria-hidden />
            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-medium leading-none text-background">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => {
              setAccountMenuOpen(false);
              setMenuOpen((open) => !open);
            }}
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
                {user ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setMenuOpen(false)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 px-4 py-3 text-sm text-primary"
                    >
                      <UserRound className="h-4 w-4" aria-hidden />
                      마이페이지
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 px-4 py-3 text-sm text-primary"
                    >
                      <LogOut className="h-4 w-4" aria-hidden />
                      로그아웃
                    </button>
                    <Link
                      href="/cart"
                      onClick={() => setMenuOpen(false)}
                      className="col-span-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm text-background"
                    >
                      <ShoppingBag className="h-4 w-4" aria-hidden />
                      장바구니{cartCount > 0 ? ` (${cartCount})` : ""}
                    </Link>
                  </>
                ) : (
                  <>
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
                      장바구니{cartCount > 0 ? ` (${cartCount})` : ""}
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
