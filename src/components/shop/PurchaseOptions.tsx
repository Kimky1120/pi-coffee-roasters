"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import {
  formatPrice,
  GRIND_OPTIONS,
  PRODUCT_PRICES,
  type GrindOption,
  type ProductWeight,
} from "@/data/shop";
import { addCartItem } from "@/lib/cart";
import { PreparationNotice } from "./PreparationNotice";

export function PurchaseOptions({
  productName,
  productSlug,
  productImage,
  shippingFee,
  freeShippingThreshold,
}: {
  productName: string;
  productSlug: string;
  productImage: string;
  shippingFee: number;
  freeShippingThreshold: number | null;
}) {
  const prices = PRODUCT_PRICES[productSlug];
  const weightOptions = Object.keys(prices) as ProductWeight[];
  const [weight, setWeight] = useState<ProductWeight>(weightOptions[0]);
  const [grind, setGrind] = useState<GrindOption>("홀빈");
  const [quantity, setQuantity] = useState(1);
  const [cartStatus, setCartStatus] = useState<"success" | "error" | null>(
    null,
  );

  const price = useMemo(() => prices[weight] ?? 0, [prices, weight]);

  return (
    <section
      aria-labelledby="purchase-options-title"
      className="border-b border-black/10 bg-background px-5 py-10 sm:px-8 sm:py-14"
    >
      <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-14">
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
          <div className="relative mt-7 aspect-[4/3] overflow-hidden rounded-sm border border-border bg-surface md:aspect-[4/5]">
            <Image
              src={productImage}
              alt={`${productName} 원두의 대표 컵노트 이미지`}
              fill
              priority
              sizes="(min-width: 768px) 340px, calc(100vw - 40px)"
              className="object-cover object-center"
            />
          </div>
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
                    setCartStatus(null);
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
                setCartStatus(null);
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

          <div className="flex items-start gap-3 border-y border-border py-4 text-sm">
            <Truck
              className="mt-0.5 h-4 w-4 shrink-0 text-primary/60"
              aria-hidden
            />
            <div className="flex flex-col gap-1">
              <span className="font-medium text-primary">
                배송비 {formatPrice(shippingFee)}원
              </span>
              {freeShippingThreshold !== null && (
                <span className="text-xs text-foreground/55">
                  {formatPrice(freeShippingThreshold)}원 이상 구매 시 무료배송
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const saved = addCartItem({
                productSlug,
                weight,
                grind,
                quantity,
              });
              setCartStatus(saved ? "success" : "error");
            }}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm tracking-wide text-background transition-colors hover:bg-primary/90"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden />
            장바구니 담기
          </button>

          {cartStatus === "success" && (
            <PreparationNotice>
              선택하신 {weight} · {grind} 옵션을 장바구니에 담았습니다.{" "}
              <Link
                href="/cart"
                className="font-medium text-primary underline underline-offset-4"
              >
                장바구니 보기
              </Link>
            </PreparationNotice>
          )}
          {cartStatus === "error" && (
            <PreparationNotice>
              장바구니에 저장하지 못했습니다. 브라우저 설정을 확인한 뒤 다시
              시도해 주세요.
            </PreparationNotice>
          )}
        </div>
      </div>
    </section>
  );
}
