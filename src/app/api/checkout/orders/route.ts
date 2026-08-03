import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import {
  buildCheckoutQuote,
  getCheckoutOrderName,
  InvalidCartError,
} from "@/lib/checkout/catalog";
import { getCheckoutReadiness } from "@/lib/checkout/config";
import {
  assertSameOrigin,
  createOrderLookupToken,
  InvalidRequestError,
  ORDER_LOOKUP_COOKIE,
  readJsonBody,
} from "@/lib/checkout/security";
import {
  InvalidCheckoutCustomerError,
  normalizeCheckoutCustomer,
} from "@/lib/checkout/validation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { CheckoutOrderResponse } from "@/types/checkout";

function createOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `PI_${date}_${randomBytes(9).toString("hex")}`;
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = (await readJsonBody(request)) as {
      cart?: unknown;
      customer?: unknown;
      acceptedOrderTerms?: unknown;
    };
    const readiness = getCheckoutReadiness();

    if (!readiness.ready || !readiness.config) {
      return Response.json(
        { message: "온라인 주문 설정이 아직 완료되지 않았습니다." },
        { status: 503 },
      );
    }

    if (body.acceptedOrderTerms !== true) {
      return Response.json(
        { message: "주문 내용과 필수 약관을 확인해 주세요." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !readiness.config.allowGuestCheckout) {
      return Response.json(
        { message: "로그인 후 주문해 주세요." },
        { status: 401 },
      );
    }

    const customer = normalizeCheckoutCustomer(
      body.customer,
      readiness.config.allowDeliveryMemo,
    );
    const quote = buildCheckoutQuote(
      body.cart,
      readiness.config.shippingRules,
    );
    const orderNumber = createOrderNumber();
    const lookup = createOrderLookupToken();
    const admin = getSupabaseAdminClient();

    const { error } = await admin.rpc("create_checkout_order", {
      p_order: {
        order_number: orderNumber,
        user_id: user?.id ?? "",
        lookup_token_hash: lookup.hash,
        orderer_name: customer.ordererName,
        orderer_email: customer.ordererEmail,
        orderer_phone: customer.ordererPhone,
        recipient_name: customer.recipientName,
        recipient_phone: customer.recipientPhone,
        postal_code: customer.postalCode,
        address_line1: customer.addressLine1,
        address_line2: customer.addressLine2,
        delivery_memo: customer.deliveryMemo,
        subtotal: quote.subtotal,
        shipping_fee: quote.shippingFee,
        total_amount: quote.totalAmount,
      },
      p_items: quote.items.map((item) => ({
        product_slug: item.productSlug,
        product_name: item.productName,
        weight: item.weight,
        grind: item.grind,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        line_total: item.lineTotal,
      })),
    });

    if (error) {
      return Response.json(
        { message: "주문을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." },
        { status: 500 },
      );
    }

    const responseBody: CheckoutOrderResponse = {
      orderId: orderNumber,
      orderName: getCheckoutOrderName(quote.items),
      amount: quote.totalAmount,
    };
    const response = NextResponse.json(responseBody, { status: 201 });

    response.cookies.set(
      ORDER_LOOKUP_COOKIE,
      `${orderNumber}.${lookup.token}`,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
      },
    );

    return response;
  } catch (error) {
    if (
      error instanceof InvalidCartError ||
      error instanceof InvalidCheckoutCustomerError ||
      error instanceof InvalidRequestError
    ) {
      return Response.json({ message: error.message }, { status: 400 });
    }

    return Response.json(
      { message: "주문을 준비하지 못했습니다." },
      { status: 500 },
    );
  }
}
