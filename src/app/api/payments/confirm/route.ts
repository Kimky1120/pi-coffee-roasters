import { NextRequest } from "next/server";
import { getPaymentBackendConfig } from "@/lib/checkout/config";
import {
  assertSameOrigin,
  InvalidRequestError,
  ORDER_LOOKUP_COOKIE,
  parseOrderLookupCookie,
  readJsonBody,
} from "@/lib/checkout/security";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  assertTossPaymentMatches,
  confirmTossPayment,
  getTossPayment,
  TossApiError,
  type TossPayment,
} from "@/lib/toss/server";

function readPaymentRequest(value: unknown) {
  if (!value || typeof value !== "object") {
    throw new InvalidRequestError("결제 승인 정보가 올바르지 않습니다.");
  }

  const record = value as Record<string, unknown>;
  const paymentKey = String(record.paymentKey ?? "");
  const orderId = String(record.orderId ?? "");
  const amount = Number(record.amount);

  if (
    paymentKey.length < 1 ||
    paymentKey.length > 200 ||
    !/^[A-Za-z0-9_-]{6,64}$/.test(orderId) ||
    !Number.isInteger(amount) ||
    amount < 0
  ) {
    throw new InvalidRequestError("결제 승인 정보가 올바르지 않습니다.");
  }

  return { paymentKey, orderId, amount };
}

async function syncPayment(payment: TossPayment) {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.rpc("sync_toss_payment", {
    p_order_number: payment.orderId,
    p_payment_key: payment.paymentKey,
    p_amount: payment.totalAmount,
    p_toss_status: payment.status,
    p_method: payment.method,
    p_approved_at: payment.approvedAt,
    p_receipt_url: payment.receipt?.url ?? null,
  });

  if (error) throw new Error("Payment synchronization failed.");
  return String(data ?? "payment_pending");
}

function successResponse(payment: TossPayment, orderStatus: string) {
  return Response.json({
    status: orderStatus,
    orderId: payment.orderId,
    receiptUrl: payment.receipt?.url ?? null,
  });
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const paymentRequest = readPaymentRequest(await readJsonBody(request));
    const lookup = parseOrderLookupCookie(
      request.cookies.get(ORDER_LOOKUP_COOKIE)?.value,
    );
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && lookup?.orderId !== paymentRequest.orderId) {
      return Response.json(
        { message: "주문 확인 정보가 만료되었습니다." },
        { status: 403 },
      );
    }

    const admin = getSupabaseAdminClient();
    const { data: claimData, error: claimError } = await admin.rpc(
      "claim_payment_confirmation",
      {
        p_order_number: paymentRequest.orderId,
        p_payment_key: paymentRequest.paymentKey,
        p_amount: paymentRequest.amount,
        p_lookup_token_hash:
          lookup?.orderId === paymentRequest.orderId ? lookup.tokenHash : "",
        p_user_id: user?.id ?? null,
      },
    );

    if (claimError) {
      return Response.json(
        { message: "주문과 결제 정보를 확인할 수 없습니다." },
        { status: 400 },
      );
    }

    const claim = claimData as {
      state?: string;
      idempotency_key?: string;
    } | null;

    if (claim?.state === "already_confirmed") {
      const { tossSecretKey } = getPaymentBackendConfig();
      const payment = await getTossPayment(
        tossSecretKey,
        paymentRequest.paymentKey,
      );
      assertTossPaymentMatches({ payment, ...paymentRequest });
      return successResponse(payment, await syncPayment(payment));
    }

    if (claim?.state === "processing") {
      return Response.json(
        { status: "processing", message: "결제 승인 결과를 확인하고 있습니다." },
        { status: 202 },
      );
    }

    if (claim?.state !== "claimed" || !claim.idempotency_key) {
      throw new Error("Payment confirmation could not be claimed.");
    }

    const { tossSecretKey } = getPaymentBackendConfig();

    try {
      const payment = await confirmTossPayment({
        secretKey: tossSecretKey,
        ...paymentRequest,
        idempotencyKey: claim.idempotency_key,
      });
      assertTossPaymentMatches({ payment, ...paymentRequest });
      return successResponse(payment, await syncPayment(payment));
    } catch (error) {
      try {
        const payment = await getTossPayment(
          tossSecretKey,
          paymentRequest.paymentKey,
        );
        assertTossPaymentMatches({ payment, ...paymentRequest });
        return successResponse(payment, await syncPayment(payment));
      } catch {
        if (error instanceof TossApiError && error.status < 500) {
          await admin.rpc("mark_payment_failure", {
            p_order_number: paymentRequest.orderId,
            p_payment_key: paymentRequest.paymentKey,
            p_failure_code: error.code,
            p_failure_message: error.message,
          });

          return Response.json(
            {
              code: error.code,
              message: "결제 승인이 완료되지 않았습니다. 결제수단을 확인해 주세요.",
            },
            { status: 400 },
          );
        }

        return Response.json(
          { status: "processing", message: "결제 승인 결과를 다시 확인합니다." },
          { status: 202 },
        );
      }
    }
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      return Response.json({ message: error.message }, { status: 400 });
    }

    return Response.json(
      { message: "결제 승인 결과를 확인하지 못했습니다." },
      { status: 500 },
    );
  }
}
