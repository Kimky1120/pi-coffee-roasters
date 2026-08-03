import { createClient } from "@/lib/supabase/server";
import {
  buildCheckoutQuote,
  InvalidCartError,
} from "@/lib/checkout/catalog";
import { getCheckoutReadiness } from "@/lib/checkout/config";
import {
  assertSameOrigin,
  InvalidRequestError,
  readJsonBody,
} from "@/lib/checkout/security";
import type { CheckoutQuoteResponse } from "@/types/checkout";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = (await readJsonBody(request)) as { cart?: unknown };
    const readiness = getCheckoutReadiness();

    if (!readiness.config) {
      return Response.json(
        { message: "배송 및 결제 운영정보를 준비하고 있습니다." },
        { status: 503 },
      );
    }

    const quote = buildCheckoutQuote(
      body.cart,
      readiness.config.shippingRules,
    );
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const response: CheckoutQuoteResponse = {
      checkoutReady: readiness.ready,
      authenticated: Boolean(user),
      allowGuestCheckout: readiness.config.allowGuestCheckout,
      allowDeliveryMemo: readiness.config.allowDeliveryMemo,
      paymentMode: readiness.config.paymentMode,
      clientKey: readiness.ready ? readiness.config.tossClientKey : null,
      quote,
    };

    return Response.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof InvalidCartError || error instanceof InvalidRequestError) {
      return Response.json({ message: error.message }, { status: 400 });
    }

    return Response.json(
      { message: "주문 금액을 확인하지 못했습니다." },
      { status: 500 },
    );
  }
}
