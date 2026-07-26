import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { PreparationNotice } from "@/components/shop/PreparationNotice";

export const metadata: Metadata = {
  title: "장바구니",
  description: "PI Coffee Roasters 장바구니 화면입니다.",
};

export default function CartPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-background px-6 py-28 sm:py-32">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/5 text-primary">
          <ShoppingBag className="h-8 w-8" strokeWidth={1.4} aria-hidden />
        </div>
        <span className="mt-8 block font-sans text-xs tracking-[0.2em] text-primary/50">
          YOUR CART
        </span>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-primary sm:text-5xl">
          장바구니가 비어 있습니다
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-foreground/60">
          파이커피가 준비한 원두를 둘러보고 취향에 맞는 커피를 찾아보세요.
        </p>

        <Link
          href="/#our-coffee"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm tracking-wide text-background transition-colors hover:bg-primary/90"
        >
          원두 둘러보기
        </Link>

        <PreparationNotice className="mt-8 text-left">
          장바구니 저장 및 결제 기능은 현재 준비 중입니다. 별도의 정보는 저장되지
          않습니다.
        </PreparationNotice>
      </div>
    </main>
  );
}
