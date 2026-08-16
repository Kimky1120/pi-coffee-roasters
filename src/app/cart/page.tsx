import type { Metadata } from "next";
import { CartContent } from "@/components/shop/CartContent";
import { getCheckoutReadiness } from "@/lib/checkout/config";

export const metadata: Metadata = {
  title: "장바구니",
  description: "PI Coffee Roasters 장바구니 화면입니다.",
};

export default function CartPage() {
  const { ready, config } = getCheckoutReadiness();
  const shippingRules = config?.shippingRules ?? {
    shippingFee: 3_000,
    freeShippingThreshold: 50_000,
  };

  return (
    <CartContent
      checkoutAvailable={ready}
      shippingFee={shippingRules.shippingFee}
      freeShippingThreshold={shippingRules.freeShippingThreshold}
    />
  );
}
