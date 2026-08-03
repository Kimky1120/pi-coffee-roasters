import type { Metadata } from "next";
import { PaymentResultContent } from "@/components/shop/PaymentResultContent";

export const metadata: Metadata = {
  title: "결제 결과",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{
  paymentKey?: string | string[];
  orderId?: string | string[];
  amount?: string | string[];
}>;

function readSingle(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  return (
    <PaymentResultContent
      paymentKey={readSingle(params.paymentKey)}
      orderId={readSingle(params.orderId)}
      amount={readSingle(params.amount)}
    />
  );
}
