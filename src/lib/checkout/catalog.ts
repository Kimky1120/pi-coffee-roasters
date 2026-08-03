import { COFFEE_BEANS } from "@/data/coffee";
import {
  GRIND_OPTIONS,
  PRODUCT_PRICES,
  type GrindOption,
  type ProductWeight,
} from "@/data/shop";
import type {
  CheckoutCartItem,
  CheckoutQuote,
  CheckoutQuoteItem,
} from "@/types/checkout";

const MAX_CART_LINES = 50;
const MAX_ITEM_QUANTITY = 10;

export type ShippingRules = {
  shippingFee: number;
  freeShippingThreshold: number | null;
};

export class InvalidCartError extends Error {}

function isProductWeight(value: string): value is ProductWeight {
  return value === "200g" || value === "500g" || value === "1kg";
}

function isGrindOption(value: string): value is GrindOption {
  return GRIND_OPTIONS.includes(value as GrindOption);
}

export function normalizeCheckoutCart(value: unknown): CheckoutCartItem[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new InvalidCartError("장바구니가 비어 있습니다.");
  }

  if (value.length > MAX_CART_LINES) {
    throw new InvalidCartError("장바구니 상품 종류가 너무 많습니다.");
  }

  const mergedItems = new Map<string, CheckoutCartItem>();

  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object") {
      throw new InvalidCartError("장바구니 상품 정보가 올바르지 않습니다.");
    }

    const record = candidate as Record<string, unknown>;
    const productSlug = String(record.productSlug ?? "");
    const weightValue = String(record.weight ?? "");
    const grindValue = String(record.grind ?? "");
    const quantity = Number(record.quantity);

    if (
      !isProductWeight(weightValue) ||
      !isGrindOption(grindValue) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_ITEM_QUANTITY ||
      PRODUCT_PRICES[productSlug]?.[weightValue] === undefined
    ) {
      throw new InvalidCartError("판매 중인 상품 옵션을 다시 확인해 주세요.");
    }

    const item: CheckoutCartItem = {
      productSlug,
      weight: weightValue,
      grind: grindValue,
      quantity,
    };
    const itemId = `${productSlug}::${weightValue}::${grindValue}`;
    const existing = mergedItems.get(itemId);
    const mergedQuantity = (existing?.quantity ?? 0) + quantity;

    if (mergedQuantity > MAX_ITEM_QUANTITY) {
      throw new InvalidCartError("같은 상품은 최대 10개까지 주문할 수 있습니다.");
    }

    mergedItems.set(itemId, { ...item, quantity: mergedQuantity });
  }

  return Array.from(mergedItems.values());
}

export function buildCheckoutQuote(
  value: unknown,
  shippingRules: ShippingRules,
): CheckoutQuote {
  const cartItems = normalizeCheckoutCart(value);
  const items: CheckoutQuoteItem[] = cartItems.map((item) => {
    const product = COFFEE_BEANS.find(
      (candidate) => candidate.slug === item.productSlug,
    );
    const unitPrice = PRODUCT_PRICES[item.productSlug]?.[item.weight];

    if (!product || unitPrice === undefined || product.status !== "available") {
      throw new InvalidCartError("현재 주문할 수 없는 상품이 포함되어 있습니다.");
    }

    return {
      ...item,
      productName: product.name,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    };
  });

  const itemQuantity = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);
  const qualifiesForFreeShipping =
    shippingRules.freeShippingThreshold !== null &&
    subtotal >= shippingRules.freeShippingThreshold;
  const shippingFee = qualifiesForFreeShipping
    ? 0
    : shippingRules.shippingFee;

  return {
    items,
    itemQuantity,
    subtotal,
    shippingFee,
    totalAmount: subtotal + shippingFee,
  };
}

export function getCheckoutOrderName(items: CheckoutQuoteItem[]) {
  const firstItem = items[0];
  if (!firstItem) return "PI Coffee Roasters 원두";

  return items.length === 1
    ? firstItem.productName
    : `${firstItem.productName} 외 ${items.length - 1}건`;
}
