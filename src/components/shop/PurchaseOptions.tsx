"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import {
  formatPrice,
  GRIND_OPTIONS,
  PRODUCT_PRICES,
  type GrindOption,
  type ProductWeight,
} from "@/data/shop";
import { PreparationNotice } from "./PreparationNotice";

export function PurchaseOptions({
  productName,
  productSlug,
}: {
  productName: string;
  productSlug: string;
}) {
  const prices = PRODUCT_PRICES[productSlug];
  const weightOptions = Object.keys(prices) as ProductWeight[];
  const [weight, setWeight] = useState<ProductWeight>(weightOptions[0]);
  const [grind, setGrind] = useState<GrindOption>("홀빈");
  const [quantity, setQuantity] = useState(1);
  const [showNotice, setShowNotice] = useState(false);

  const price = useMemo(() => prices[weight] ?? 0, [prices, weight]);

  return (
    <section
      aria-labelledby="purchase-options-title"
      className="border-b border-black/10 bg-background px-5 py-10 sm:px-8 sm:py-14"
    >
      <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-14">
        <div>
          <span className="font-sans text-xs tracking-[0.2em] text-primary/50">
            COFFEE BEANS
          </span>
          <h1
            id="purchase-options-title"
            className="mt-3 font-display text-4xl font-medium tracking-tight text-primary sm:text-5xl"
          >
            {productName}
          </h1>
          <p className="mt-5 text-sm leading-7 text-foreground/65">
            원하시는 용량과 분쇄도를 선택해 주세요.
          </p>
        </div>

        <div className="flex flex-col gap-7">
          <fieldset>
            <legend className="mb-3 text-sm font-medium text-primary">용량</legend>
            <div className="grid grid-cols-3 gap-2">
              {weightOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setWeight(option);
                    setShowNotice(false);
                  }}
                  aria-pressed={weight === option}
                  className={`h-11 rounded-sm border text-sm transition-colors ${
                    weight === option
                      ? "border-primary bg-primary text-background"
                      : "border-border bg-background text-foreground/70 hover:border-primary/50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col gap-3 text-sm font-medium text-primary">
            분쇄도
            <select
              value={grind}
              onChange={(event) => {
                setGrind(event.target.value as GrindOption);
                setShowNotice(false);
              }}
              className="h-12 rounded-sm border border-border bg-background px-4 text-sm font-normal text-foreground outline-none transition-colors focus:border-primary"
            >
              {GRIND_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center justify-between border-y border-border py-5">
            <span className="text-sm font-medium text-primary">수량</span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                aria-label="수량 줄이기"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-primary disabled:opacity-30"
                disabled={quantity === 1}
              >
                <Minus className="h-3.5 w-3.5" aria-hidden />
              </button>
              <span className="min-w-4 text-center text-sm tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(10, value + 1))}
                aria-label="수량 늘리기"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-primary disabled:opacity-30"
                disabled={quantity === 10}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-end justify-between">
              <span className="text-sm text-foreground/60">일반 판매가</span>
              <strong className="font-display text-3xl font-medium text-primary">
                {formatPrice(price)}
                <span className="ml-1 font-sans text-base font-normal">원</span>
              </strong>
            </div>
            {quantity > 1 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground/60">총 상품금액</span>
                <span className="font-medium text-primary">
                  {formatPrice(price * quantity)}원
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowNotice(true)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm tracking-wide text-background transition-colors hover:bg-primary/90"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden />
            장바구니 담기
          </button>

          {showNotice && (
            <PreparationNotice>
              장바구니 기능은 준비 중입니다. 선택하신 {weight} · {grind} 옵션은
              저장되지 않습니다.
            </PreparationNotice>
          )}
        </div>
      </div>
    </section>
  );
}
