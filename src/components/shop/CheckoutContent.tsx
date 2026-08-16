"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ANONYMOUS,
  loadTossPayments,
  type TossPaymentsWidgets,
  type WidgetAgreementWidget,
  type WidgetPaymentMethodWidget,
} from "@tosspayments/tosspayments-sdk";
import {
  ArrowUpRight,
  Clock3,
  CreditCard,
  LockKeyhole,
  MapPin,
  ShoppingBag,
} from "lucide-react";
import { SITE_CONFIG } from "@/constants/site";
import { formatPrice } from "@/data/shop";
import {
  getCartSnapshot,
  getServerCartSnapshot,
  subscribeCart,
} from "@/lib/cart";
import type {
  CheckoutCustomer,
  CheckoutOrderResponse,
  CheckoutQuoteResponse,
} from "@/types/checkout";
import { PreparationNotice } from "./PreparationNotice";

const DELIVERY_MEMO_OPTIONS = [
  "문 앞에 놓아 주세요.",
  "경비실에 맡겨 주세요.",
  "택배함에 넣어 주세요.",
  "배송 전에 연락해 주세요.",
] as const;

const DIRECT_MEMO_VALUE = "DIRECT";

const EMPTY_CUSTOMER: CheckoutCustomer = {
  ordererName: "",
  ordererEmail: "",
  ordererPhone: "",
  recipientName: "",
  recipientPhone: "",
  postalCode: "",
  addressLine1: "",
  addressLine2: "",
  deliveryMemo: "",
};

type ApiError = { message?: string };

export function CheckoutContent({
  checkoutAvailable,
}: {
  checkoutAvailable: boolean;
}) {
  const cart = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );
  const [quoteResponse, setQuoteResponse] =
    useState<CheckoutQuoteResponse | null>(null);
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  const [deliveryMemoOption, setDeliveryMemoOption] = useState("");
  const [sameRecipient, setSameRecipient] = useState(false);
  const [requiredTermsAgreed, setRequiredTermsAgreed] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);

  useEffect(() => {
    if (!checkoutAvailable || cart.length === 0) {
      return;
    }

    const controller = new AbortController();

    async function loadQuote() {
      setLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch("/api/checkout/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart }),
          signal: controller.signal,
        });
        const body = (await response.json()) as CheckoutQuoteResponse & ApiError;

        if (!response.ok) {
          throw new Error(body.message ?? "주문 금액을 불러오지 못했습니다.");
        }

        setQuoteResponse(body);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "주문 금액을 불러오지 못했습니다.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadQuote();
    return () => controller.abort();
  }, [cart, checkoutAvailable]);

  useEffect(() => {
    const clientKey = quoteResponse?.clientKey;
    const quote = quoteResponse?.quote;

    if (!quoteResponse?.checkoutReady || !clientKey || !quote) return;

    let active = true;
    let paymentWidget: WidgetPaymentMethodWidget | null = null;
    let agreementWidget: WidgetAgreementWidget | null = null;

    async function renderWidgets() {
      try {
        setWidgetReady(false);
        const tossPayments = await loadTossPayments(clientKey as string);
        if (!active) return;

        const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
        widgetsRef.current = widgets;
        await widgets.setAmount({ currency: "KRW", value: quote!.totalAmount });
        paymentWidget = await widgets.renderPaymentMethods({
          selector: "#payment-methods",
          variantKey: "DEFAULT",
        });
        agreementWidget = await widgets.renderAgreement({
          selector: "#payment-agreement",
          variantKey: "AGREEMENT",
        });
        agreementWidget.on("agreementStatusChange", (status) => {
          if (active) setRequiredTermsAgreed(status.agreedRequiredTerms);
        });

        if (active) setWidgetReady(true);
      } catch {
        if (active) {
          setErrorMessage(
            "결제수단을 불러오지 못했습니다. 토스 테스트 키 설정을 확인해 주세요.",
          );
        }
      }
    }

    void renderWidgets();

    return () => {
      active = false;
      widgetsRef.current = null;
      void paymentWidget?.destroy();
      void agreementWidget?.destroy();
    };
  }, [quoteResponse]);

  function updateCustomer<K extends keyof CheckoutCustomer>(
    key: K,
    value: CheckoutCustomer[K],
  ) {
    setCustomer((current) => {
      const next = { ...current, [key]: value };

      if (sameRecipient && key === "ordererName") {
        next.recipientName = value;
      }
      if (sameRecipient && key === "ordererPhone") {
        next.recipientPhone = value;
      }

      return next;
    });
  }

  function toggleSameRecipient(checked: boolean) {
    setSameRecipient(checked);
    if (checked) {
      setCustomer((current) => ({
        ...current,
        recipientName: current.ordererName,
        recipientPhone: current.ordererPhone,
      }));
    }
  }

  function updateDeliveryMemoOption(value: string) {
    setDeliveryMemoOption(value);
    updateCustomer(
      "deliveryMemo",
      value === DIRECT_MEMO_VALUE || value === "" ? "" : value,
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const widgets = widgetsRef.current;

    if (!quoteResponse || !widgets || !widgetReady || !requiredTermsAgreed) {
      setErrorMessage("주문 정보와 필수 결제 약관을 확인해 주세요.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/checkout/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          customer,
          acceptedOrderTerms: requiredTermsAgreed,
        }),
      });
      const body = (await response.json()) as CheckoutOrderResponse & ApiError;

      if (!response.ok) {
        throw new Error(body.message ?? "주문을 준비하지 못했습니다.");
      }

      if (body.amount !== quoteResponse.quote.totalAmount) {
        setErrorMessage(
          "주문 금액이 변경되었습니다. 화면을 새로고침한 뒤 다시 확인해 주세요.",
        );
        return;
      }

      await widgets.setAmount({ currency: "KRW", value: body.amount });
      await widgets.requestPayment({
        orderId: body.orderId,
        orderName: body.orderName,
        customerEmail: customer.ordererEmail,
        customerName: customer.ordererName,
        customerMobilePhone: customer.ordererPhone.replace(/\D/g, ""),
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "결제를 요청하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!checkoutAvailable) {
    return <CheckoutUnavailable />;
  }

  if (cart.length === 0) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-background px-6 py-28">
        <div className="w-full max-w-lg text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-primary/50" aria-hidden />
          <h1 className="mt-6 font-display text-4xl font-medium text-primary">
            주문할 상품이 없습니다
          </h1>
          <Link
            href="/#our-coffee"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm text-background"
          >
            원두 둘러보기
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-background px-6 py-28">
        <p className="text-sm text-foreground/60">안전한 주문 금액을 확인하고 있습니다...</p>
      </main>
    );
  }

  if (!quoteResponse) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-background px-6 py-28">
        <div className="w-full max-w-lg">
          <PreparationNotice>
            {errorMessage ?? "주문 금액을 확인하지 못했습니다."}
          </PreparationNotice>
          <Link
            href="/cart"
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full border border-primary text-sm text-primary"
          >
            장바구니로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  if (!quoteResponse.authenticated && !quoteResponse.allowGuestCheckout) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-background px-6 py-28">
        <div className="w-full max-w-lg text-center">
          <LockKeyhole className="mx-auto h-10 w-10 text-primary/50" aria-hidden />
          <h1 className="mt-6 font-display text-4xl font-medium text-primary">
            로그인이 필요합니다
          </h1>
          <p className="mt-4 text-sm leading-7 text-foreground/60">
            현재 주문 정책은 회원 구매만 허용합니다.
          </p>
          <Link
            href="/login?next=/checkout"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm text-background"
          >
            로그인하기
          </Link>
        </div>
      </main>
    );
  }

  const { quote } = quoteResponse;

  return (
    <main className="min-h-[calc(100vh-4rem)] flex-1 bg-background px-5 py-24 sm:px-8 sm:py-28">
      <form
        onSubmit={handleSubmit}
        className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_380px] lg:items-start"
      >
        <div className="flex flex-col gap-8">
          <header className="border-b border-border pb-7">
            <span className="text-xs tracking-[0.2em] text-primary/50">
              CHECKOUT
            </span>
            <h1 className="mt-3 font-display text-4xl font-medium text-primary sm:text-5xl">
              주문서
            </h1>
            <p className="mt-4 text-sm leading-7 text-foreground/60">
              주문자와 배송 정보를 확인한 뒤 결제수단을 선택해 주세요.
            </p>
          </header>

          <CheckoutSection title="주문자 정보">
            <div className="grid gap-4 sm:grid-cols-2">
              <CheckoutInput
                label="주문자명"
                value={customer.ordererName}
                onChange={(value) => updateCustomer("ordererName", value)}
                autoComplete="name"
              />
              <CheckoutInput
                label="연락처"
                type="tel"
                value={customer.ordererPhone}
                onChange={(value) => updateCustomer("ordererPhone", value)}
                placeholder="010-0000-0000"
                autoComplete="tel"
              />
              <div className="sm:col-span-2">
                <CheckoutInput
                  label="이메일"
                  type="email"
                  value={customer.ordererEmail}
                  onChange={(value) => updateCustomer("ordererEmail", value)}
                  autoComplete="email"
                />
              </div>
            </div>
          </CheckoutSection>

          <CheckoutSection title="배송 정보">
            <label className="mb-4 flex items-center gap-2 text-sm text-foreground/65">
              <input
                type="checkbox"
                checked={sameRecipient}
                onChange={(event) => toggleSameRecipient(event.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              주문자와 수령인이 같습니다
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <CheckoutInput
                label="수령인명"
                value={customer.recipientName}
                onChange={(value) => updateCustomer("recipientName", value)}
                autoComplete="shipping name"
              />
              <CheckoutInput
                label="수령인 연락처"
                type="tel"
                value={customer.recipientPhone}
                onChange={(value) => updateCustomer("recipientPhone", value)}
                placeholder="010-0000-0000"
                autoComplete="shipping tel"
              />
              <CheckoutInput
                label="우편번호"
                value={customer.postalCode}
                onChange={(value) => updateCustomer("postalCode", value)}
                autoComplete="shipping postal-code"
              />
              <div className="hidden sm:block" aria-hidden />
              <div className="sm:col-span-2">
                <CheckoutInput
                  label="주소"
                  value={customer.addressLine1}
                  onChange={(value) => updateCustomer("addressLine1", value)}
                  autoComplete="shipping address-line1"
                />
              </div>
              <div className="sm:col-span-2">
                <CheckoutInput
                  label="상세 주소"
                  value={customer.addressLine2}
                  onChange={(value) => updateCustomer("addressLine2", value)}
                  autoComplete="shipping address-line2"
                  required={false}
                />
              </div>
              {quoteResponse.allowDeliveryMemo && (
                <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-foreground/70">
                  배송메모
                  <select
                    value={deliveryMemoOption}
                    onChange={(event) =>
                      updateDeliveryMemoOption(event.target.value)
                    }
                    className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors focus:border-primary"
                  >
                    <option value="">배송메모를 선택해 주세요</option>
                    {DELIVERY_MEMO_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                    <option value={DIRECT_MEMO_VALUE}>직접 입력</option>
                  </select>
                  {deliveryMemoOption === DIRECT_MEMO_VALUE && (
                    <textarea
                      aria-label="배송메모 직접 입력"
                      value={customer.deliveryMemo}
                      onChange={(event) =>
                        updateCustomer("deliveryMemo", event.target.value)
                      }
                      placeholder="배송 기사님께 전달할 내용을 입력해 주세요."
                      maxLength={200}
                      rows={3}
                      className="resize-none rounded-sm border border-border bg-background px-4 py-3 text-base outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
                    />
                  )}
                </label>
              )}
            </div>
          </CheckoutSection>

          <CheckoutSection title="결제수단">
            <div id="payment-methods" />
            <div id="payment-agreement" />
          </CheckoutSection>
        </div>

        <aside className="rounded-sm border border-border bg-surface p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-2xl font-medium text-primary">
            최종 주문
          </h2>
          <div className="mt-5 flex flex-col gap-4 border-b border-border pb-5">
            {quote.items.map((item) => (
              <div
                key={`${item.productSlug}-${item.weight}-${item.grind}`}
                className="flex items-start justify-between gap-4 text-sm"
              >
                <div>
                  <p className="font-medium text-primary">{item.productName}</p>
                  <p className="mt-1 text-xs text-foreground/50">
                    {item.weight} · {item.grind} · {item.quantity}개
                  </p>
                </div>
                <span className="shrink-0 text-primary">
                  {formatPrice(item.lineTotal)}원
                </span>
              </div>
            ))}
          </div>
          <SummaryRow label="상품금액" value={quote.subtotal} />
          <SummaryRow label="배송비" value={quote.shippingFee} />
          <div className="mt-5 flex items-end justify-between border-t border-border pt-5">
            <span className="text-sm text-foreground/60">총 결제금액</span>
            <strong className="font-display text-3xl font-medium text-primary">
              {formatPrice(quote.totalAmount)}
              <span className="ml-1 font-sans text-base font-normal">원</span>
            </strong>
          </div>

          <button
            type="submit"
            disabled={!widgetReady || !requiredTermsAgreed || submitting}
            className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm tracking-wide text-background transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CreditCard className="h-4 w-4" aria-hidden />
            {submitting ? "주문 확인 중..." : "결제하기"}
          </button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-foreground/50">
            <LockKeyhole className="h-3.5 w-3.5" aria-hidden />
            서버에서 가격과 결제금액을 다시 검증합니다.
          </p>

          {quoteResponse.paymentMode === "test" && (
            <PreparationNotice className="mt-5">
              테스트 결제 환경입니다. 실제 금액은 출금되지 않습니다.
            </PreparationNotice>
          )}
          {errorMessage && (
            <p role="alert" className="mt-5 text-sm leading-6 text-red-700">
              {errorMessage}
            </p>
          )}
        </aside>
      </form>
    </main>
  );
}

function CheckoutUnavailable() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex-1 bg-background px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <section>
          <span className="text-xs tracking-[0.2em] text-primary/50">
            VISIT PI COFFEE
          </span>
          <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-primary sm:text-5xl">
            파이커피로 오시는 길
          </h1>
          <p className="mt-6 text-base leading-8 text-foreground/60">
            온라인 주문은 조금만 기다려 주세요.
            <br />
            그동안 매장에서 직접 만나요.
          </p>

          <div className="mt-8 flex flex-col gap-4 border-y border-border py-6">
            <div className="flex items-start gap-3 text-sm leading-6">
              <MapPin
                className="mt-0.5 h-4 w-4 shrink-0 text-primary/60"
                aria-hidden
              />
              <span className="text-primary">{SITE_CONFIG.contact.address}</span>
            </div>
            <div className="flex items-start gap-3 text-sm leading-6">
              <Clock3
                className="mt-0.5 h-4 w-4 shrink-0 text-primary/60"
                aria-hidden
              />
              <span className="text-primary">{SITE_CONFIG.contact.hours}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={SITE_CONFIG.contact.naverMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm text-background transition-colors hover:bg-primary/90"
            >
              네이버 지도에서 보기
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
            <Link
              href="/cart"
              className="inline-flex h-12 items-center justify-center rounded-full border border-primary px-7 text-sm text-primary transition-colors hover:bg-primary/5"
            >
              장바구니로 돌아가기
            </Link>
          </div>
        </section>

        <section
          aria-label="파이커피로스터스 매장과 원두 사진"
          className="grid grid-cols-2 gap-3"
        >
          <div className="relative col-span-2 aspect-[16/9] overflow-hidden rounded-sm bg-surface">
            <Image
              src="/images/gallery/gallery-09.jpg"
              alt="파이커피로스터스 매장 외관"
              fill
              priority
              sizes="(min-width: 1024px) 620px, calc(100vw - 40px)"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-surface">
            <Image
              src="/images/gallery/gallery-06.jpg"
              alt="파이커피로스터스 원두 패키지"
              fill
              sizes="(min-width: 1024px) 300px, 50vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-surface">
            <Image
              src="/images/gallery/gallery-04.jpg"
              alt="파이커피로스터스 커피 커핑 테이블"
              fill
              sizes="(min-width: 1024px) 300px, 50vw"
              className="object-cover"
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function CheckoutSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-sm border border-border bg-surface p-5 sm:p-7">
      <h2 className="mb-6 font-display text-2xl font-medium text-primary">
        {title}
      </h2>
      {children}
    </section>
  );
}

function CheckoutInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel";
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-foreground/70">
      {label}
      <input
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
      />
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <span className="text-foreground/60">{label}</span>
      <span className="text-primary">{formatPrice(value)}원</span>
    </div>
  );
}
