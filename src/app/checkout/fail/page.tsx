import type { Metadata } from "next";
import Link from "next/link";
import { XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "결제 실패",
  robots: { index: false, follow: false },
};

const FAILURE_MESSAGES: Record<string, string> = {
  PAY_PROCESS_CANCELED: "결제 과정이 취소되었습니다.",
  PAY_PROCESS_ABORTED:
    "결제 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
};

type SearchParams = Promise<{
  code?: string | string[];
  orderId?: string | string[];
}>;

function readSingle(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function CheckoutFailPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const code = readSingle(params.code);
  const orderId = readSingle(params.orderId);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-background px-6 py-28">
      <div className="w-full max-w-lg text-center">
        <XCircle
          className="mx-auto h-12 w-12 text-red-700"
          strokeWidth={1.5}
          aria-hidden
        />
        <h1 className="mt-6 font-display text-4xl font-medium text-primary">
          결제가 완료되지 않았습니다
        </h1>
        <p className="mt-5 text-sm leading-7 text-foreground/65">
          {FAILURE_MESSAGES[code] ??
            "결제수단을 확인한 뒤 다시 시도해 주세요."}
        </p>
        {orderId && (
          <p className="mt-3 text-xs text-foreground/45">주문번호 {orderId}</p>
        )}
        <Link
          href="/cart"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm text-background"
        >
          장바구니로 돌아가기
        </Link>
      </div>
    </main>
  );
}
