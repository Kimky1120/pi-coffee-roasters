import "server-only";

const TOSS_API_BASE_URL = "https://api.tosspayments.com/v1";

export type TossPayment = {
  paymentKey: string;
  orderId: string;
  currency: string;
  method: string | null;
  status: string;
  totalAmount: number;
  approvedAt: string | null;
  receipt?: { url?: string | null } | null;
};

type TossErrorBody = {
  code?: string;
  message?: string;
};

export class TossApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

function getAuthorization(secretKey: string) {
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

async function readTossResponse(response: Response) {
  const body = (await response.json().catch(() => ({}))) as
    | TossPayment
    | TossErrorBody;

  if (!response.ok) {
    const error = body as TossErrorBody;
    throw new TossApiError(
      response.status,
      error.code ?? "TOSS_API_ERROR",
      error.message ?? "토스페이먼츠 요청을 처리하지 못했습니다.",
    );
  }

  return body as TossPayment;
}

export async function confirmTossPayment({
  secretKey,
  paymentKey,
  orderId,
  amount,
  idempotencyKey,
}: {
  secretKey: string;
  paymentKey: string;
  orderId: string;
  amount: number;
  idempotencyKey: string;
}) {
  const response = await fetch(`${TOSS_API_BASE_URL}/payments/confirm`, {
    method: "POST",
    headers: {
      Authorization: getAuthorization(secretKey),
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
    cache: "no-store",
  });

  return readTossResponse(response);
}

export async function getTossPayment(secretKey: string, paymentKey: string) {
  const response = await fetch(
    `${TOSS_API_BASE_URL}/payments/${encodeURIComponent(paymentKey)}`,
    {
      headers: { Authorization: getAuthorization(secretKey) },
      cache: "no-store",
    },
  );

  return readTossResponse(response);
}

export function assertTossPaymentMatches({
  payment,
  paymentKey,
  orderId,
  amount,
}: {
  payment: TossPayment;
  paymentKey: string;
  orderId: string;
  amount: number;
}) {
  if (
    payment.paymentKey !== paymentKey ||
    payment.orderId !== orderId ||
    payment.totalAmount !== amount ||
    payment.currency !== "KRW"
  ) {
    throw new Error("Toss Payments response did not match the order.");
  }
}
