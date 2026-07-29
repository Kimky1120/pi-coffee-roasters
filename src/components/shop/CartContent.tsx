"use client";

import { useMemo, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { COFFEE_BEANS } from "@/data/coffee";
import { formatPrice, PRODUCT_PRICES } from "@/data/shop";
import {
  clearCart,
  getCartItemCount,
  getCartItemId,
  getCartSnapshot,
  getServerCartSnapshot,
  removeCartItem,
  setCartItemQuantity,
  subscribeCart,
} from "@/lib/cart";
import { PreparationNotice } from "./PreparationNotice";

export function CartContent() {
  const items = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );

  const detailedItems = useMemo(
    () =>
      items.flatMap((item) => {
        const bean = COFFEE_BEANS.find(
          (candidate) => candidate.slug === item.productSlug,
        );
        const price = PRODUCT_PRICES[item.productSlug]?.[item.weight];

        return bean && price !== undefined ? [{ ...item, bean, price }] : [];
      }),
    [items],
  );

  if (detailedItems.length === 0) {
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
        </div>
      </main>
    );
  }

  const totalQuantity = getCartItemCount(items);
  const subtotal = detailedItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <main className="min-h-[calc(100vh-4rem)] flex-1 bg-background px-6 py-28 sm:py-32">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-8">
          <div>
            <span className="font-sans text-xs tracking-[0.2em] text-primary/50">
              YOUR CART
            </span>
            <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-primary sm:text-5xl">
              장바구니
            </h1>
            <p className="mt-3 text-sm text-foreground/55">
              선택한 원두 {totalQuantity}개
            </p>
          </div>
          <button
            type="button"
            onClick={clearCart}
            className="text-sm text-foreground/50 underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            전체 비우기
          </button>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
          <section aria-label="장바구니 상품" className="flex flex-col gap-4">
            {detailedItems.map((item) => {
              const id = getCartItemId(item);

              return (
                <article
                  key={id}
                  className="grid grid-cols-[88px_1fr] gap-4 rounded-sm border border-border bg-surface p-4 sm:grid-cols-[120px_1fr_auto] sm:gap-6 sm:p-5"
                >
                  <Link
                    href={`/coffee/${item.productSlug}`}
                    className="overflow-hidden rounded-sm bg-background"
                  >
                    <Image
                      src={item.bean.image}
                      alt={`${item.bean.name} 원두`}
                      width={240}
                      height={240}
                      className="aspect-square h-full w-full object-cover"
                    />
                  </Link>

                  <div className="min-w-0">
                    <Link
                      href={`/coffee/${item.productSlug}`}
                      className="font-display text-2xl font-medium text-primary hover:underline"
                    >
                      {item.bean.name}
                    </Link>
                    <p className="mt-1 text-sm text-foreground/55">
                      {item.weight} · {item.grind}
                    </p>
                    <p className="mt-3 text-sm text-primary">
                      {formatPrice(item.price)}원
                    </p>

                    <div className="mt-5 flex items-center gap-3 sm:hidden">
                      <QuantityControl
                        quantity={item.quantity}
                        onDecrease={() =>
                          setCartItemQuantity(id, item.quantity - 1)
                        }
                        onIncrease={() =>
                          setCartItemQuantity(id, item.quantity + 1)
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeCartItem(id)}
                        aria-label={`${item.bean.name} 삭제`}
                        className="ml-auto flex h-8 w-8 items-center justify-center text-foreground/45 transition-colors hover:text-primary"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-end justify-between border-t border-border pt-4 sm:col-span-1 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                    <div className="hidden items-center gap-3 sm:flex">
                      <QuantityControl
                        quantity={item.quantity}
                        onDecrease={() =>
                          setCartItemQuantity(id, item.quantity - 1)
                        }
                        onIncrease={() =>
                          setCartItemQuantity(id, item.quantity + 1)
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeCartItem(id)}
                        aria-label={`${item.bean.name} 삭제`}
                        className="flex h-8 w-8 items-center justify-center text-foreground/45 transition-colors hover:text-primary"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                    <strong className="font-display text-xl font-medium text-primary">
                      {formatPrice(item.price * item.quantity)}원
                    </strong>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="rounded-sm border border-border bg-surface p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-2xl font-medium text-primary">
              주문 요약
            </h2>
            <div className="mt-6 flex items-center justify-between border-b border-border pb-5 text-sm">
              <span className="text-foreground/60">상품 수량</span>
              <span className="text-primary">{totalQuantity}개</span>
            </div>
            <div className="flex items-end justify-between pt-5">
              <span className="text-sm text-foreground/60">상품 합계</span>
              <strong className="font-display text-3xl font-medium text-primary">
                {formatPrice(subtotal)}
                <span className="ml-1 font-sans text-base font-normal">원</span>
              </strong>
            </div>

            <button
              type="button"
              disabled
              className="mt-7 h-12 w-full rounded-full bg-primary px-6 text-sm tracking-wide text-background opacity-45"
            >
              주문하기 · 준비 중
            </button>

            <PreparationNotice className="mt-5">
              온라인 결제는 준비 중입니다. 장바구니 상품은 현재 사용 중인
              브라우저에만 저장됩니다.
            </PreparationNotice>
          </aside>
        </div>
      </div>
    </main>
  );
}

function QuantityControl({
  quantity,
  onDecrease,
  onIncrease,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onDecrease}
        aria-label="수량 줄이기"
        disabled={quantity === 1}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-primary disabled:opacity-30"
      >
        <Minus className="h-3.5 w-3.5" aria-hidden />
      </button>
      <span className="min-w-4 text-center text-sm tabular-nums">{quantity}</span>
      <button
        type="button"
        onClick={onIncrease}
        aria-label="수량 늘리기"
        disabled={quantity === 10}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-primary disabled:opacity-30"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}
