import type { GrindOption, ProductWeight } from "@/data/shop";

export type CheckoutCartItem = {
  productSlug: string;
  weight: ProductWeight;
  grind: GrindOption;
  quantity: number;
};

export type CheckoutQuoteItem = CheckoutCartItem & {
  productName: string;
  unitPrice: number;
  lineTotal: number;
};

export type CheckoutQuote = {
  items: CheckoutQuoteItem[];
  itemQuantity: number;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
};

export type CheckoutCustomer = {
  ordererName: string;
  ordererEmail: string;
  ordererPhone: string;
  recipientName: string;
  recipientPhone: string;
  postalCode: string;
  addressLine1: string;
  addressLine2: string;
  deliveryMemo: string;
};

export type CheckoutQuoteResponse = {
  checkoutReady: boolean;
  authenticated: boolean;
  allowGuestCheckout: boolean;
  allowDeliveryMemo: boolean;
  paymentMode: "test" | "live" | null;
  clientKey: string | null;
  quote: CheckoutQuote;
};

export type CheckoutOrderResponse = {
  orderId: string;
  orderName: string;
  amount: number;
};
