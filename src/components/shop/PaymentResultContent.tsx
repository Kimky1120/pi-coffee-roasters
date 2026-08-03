"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { clearCart } from "@/lib/cart";

type ResultState =
  | { type: "processing"; message: string }
  | { type: "success"; message: string; receiptUrl: string | null }
  | { type: "error"; message: string };

export function PaymentResultContent({
  paymentKey,
  orderId,
  amount,
}: {
  paymentKey: string;
  orderId: string;
  amount: string;
}) {
  const [result, setResult] = useState<ResultState>({
    type: "processing",
    message: "결제 승인 결과를 안전하게 확인하고 있습니다.",
  });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let active = true;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    async function confirmPayment(attempt: number) {
      if (!paymentKey || !orderId || !/^\d+$/.test(amount)) {
        setResult({
          type: "error",
          message: "결제 결과 주소가 올바르지 않습니다.",
        });
        return;
      }

      try {
        const response = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
          }),
        });
        const body = (await response.json()) as {
          status?: string;
          message?: string;
          receiptUrl?: string | null;
        };

        if (response.status === 202 && attempt < 5) {
          if (active) {
            retryTimer = setTimeout(() => void confirmPayment(attempt + 1), 1500);
          }
          return;
        }

        if (!response.ok || !body.status) {
          throw new Error(body.message ?? "결제 승인이 완료되지 않았습니다.");
        }

        if (body.status === "paid" || body.status === "awaiting_deposit") {
          clearCart();
        }

        if (active) {
          setResult({
            type: "success",
            message:
              body.status === "awaiting_deposit"
                ? "결제 신청이 완료되었습니다. 안내된 계좌로 입금해 주세요."
                : "결제가 정상적으로 완료되었습니다.",
            receiptUrl: body.receiptUrl ?? null,
          });
        }
      } catch (error) {
        if (active) {
          setResult({
            type: "error",
            message:
              error instanceof Error
                ? error.message
                : "결제 결과를 확인하지 못했습니다.",
          });
        }
      }
    }

    void confirmPayment(0);

    return () => {
      active = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [amount, orderId, paymentKey]);

  const Icon =
    result.type === "success"
      ? CheckCircle2
      : result.type === "error"
        ? XCircle
        : Clock3;

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-background px-6 py-28">
      <div className="w-full max-w-lg text-center">
        <Icon
          className={`mx-auto h-12 w-12 ${
            result.type === "error" ? "text-red-700" : "text-primary"
          }`}
          strokeWidth={1.5}
          aria-hidden
        />
        <h1 className="mt-6 font-display text-4xl font-medium text-primary">
          {result.type === "processing"
            ? "결제 확인 중"
            : result.type === "success"
              ? "주문이 접수되었습니다"
              : "결제를 확인해 주세요"}
        </h1>
        <p className="mt-5 text-sm leading-7 text-foreground/65">
          {result.message}
        </p>
        {orderId && (
          <p className="mt-3 text-xs text-foreground/45">주문번호 {orderId}</p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {result.type === "error" ? (
            <Link
              href="/cart"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm text-background"
            >
              장바구니로 돌아가기
            </Link>
          ) : (
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm text-background"
            >
              홈으로 이동
            </Link>
          )}
          {result.type === "success" && result.receiptUrl && (
            <a
              href={result.receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full border border-primary px-8 text-sm text-primary"
            >
              영수증 보기
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
