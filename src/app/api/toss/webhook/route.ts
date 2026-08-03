import { getPaymentBackendConfig } from "@/lib/checkout/config";
import {
  InvalidRequestError,
  readJsonBody,
} from "@/lib/checkout/security";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTossPayment } from "@/lib/toss/server";

const SUPPORTED_EVENTS = new Set([
  "PAYMENT_STATUS_CHANGED",
  "DEPOSIT_CALLBACK",
  "CANCEL_STATUS_CHANGED",
]);

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as {
      eventType?: unknown;
      data?: { paymentKey?: unknown };
    };
    const eventType = String(body.eventType ?? "");

    if (!SUPPORTED_EVENTS.has(eventType)) {
      return Response.json({ received: true });
    }

    const paymentKey = String(body.data?.paymentKey ?? "");
    if (!paymentKey || paymentKey.length > 200) {
      throw new InvalidRequestError("Invalid webhook payload.");
    }

    // 일반결제 웹훅에는 서명 헤더가 없으므로 토스 조회 API로 원본을 재검증한다.
    const { tossSecretKey } = getPaymentBackendConfig();
    const payment = await getTossPayment(tossSecretKey, paymentKey);
    const admin = getSupabaseAdminClient();
    const { error } = await admin.rpc("sync_toss_payment", {
      p_order_number: payment.orderId,
      p_payment_key: payment.paymentKey,
      p_amount: payment.totalAmount,
      p_toss_status: payment.status,
      p_method: payment.method,
      p_approved_at: payment.approvedAt,
      p_receipt_url: payment.receipt?.url ?? null,
    });

    if (error) {
      return Response.json({ received: false }, { status: 500 });
    }

    return Response.json({ received: true });
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      return Response.json({ received: false }, { status: 400 });
    }

    return Response.json({ received: false }, { status: 500 });
  }
}
