import type { Metadata } from "next";
import { CheckoutContent } from "@/components/shop/CheckoutContent";
import { getCheckoutReadiness } from "@/lib/checkout/config";

export const metadata: Metadata = {
  title: "주문서",
  description: "PI Coffee Roasters 주문 및 결제 화면입니다.",
};

export default function CheckoutPage() {
  const { ready } = getCheckoutReadiness();
  return <CheckoutContent checkoutAvailable={ready} />;
}
