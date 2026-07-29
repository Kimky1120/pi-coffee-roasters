import {
  GRIND_OPTIONS,
  PRODUCT_PRICES,
  type GrindOption,
  type ProductWeight,
} from "@/data/shop";

export const CART_UPDATED_EVENT = "pi-coffee:cart-updated";

const CART_STORAGE_KEY = "pi-coffee-cart-v1";
const MAX_ITEM_QUANTITY = 10;
const EMPTY_CART: readonly CartItem[] = Object.freeze([]);

let cachedRaw: string | null | undefined;
let cachedItems: readonly CartItem[] = EMPTY_CART;

export type CartItem = {
  productSlug: string;
  weight: ProductWeight;
  grind: GrindOption;
  quantity: number;
};

export function getCartItemId(
  item: Pick<CartItem, "productSlug" | "weight" | "grind">,
) {
  return `${item.productSlug}::${item.weight}::${item.grind}`;
}

function normalizeCartItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];

  const items = new Map<string, CartItem>();

  value.forEach((candidate) => {
    if (!candidate || typeof candidate !== "object") return;

    const record = candidate as Record<string, unknown>;
    const productSlug = String(record.productSlug ?? "");
    const weight = String(record.weight ?? "") as ProductWeight;
    const grind = String(record.grind ?? "") as GrindOption;
    const quantity = Number(record.quantity);
    const price = PRODUCT_PRICES[productSlug]?.[weight];

    if (
      price === undefined ||
      !GRIND_OPTIONS.includes(grind) ||
      !Number.isFinite(quantity)
    ) {
      return;
    }

    const normalizedQuantity = Math.min(
      MAX_ITEM_QUANTITY,
      Math.max(1, Math.floor(quantity)),
    );
    const item = { productSlug, weight, grind, quantity: normalizedQuantity };
    const id = getCartItemId(item);
    const existing = items.get(id);

    items.set(id, {
      ...item,
      quantity: Math.min(
        MAX_ITEM_QUANTITY,
        (existing?.quantity ?? 0) + normalizedQuantity,
      ),
    });
  });

  return Array.from(items.values());
}

export function getCartSnapshot(): readonly CartItem[] {
  if (typeof window === "undefined") return EMPTY_CART;

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (raw === cachedRaw) return cachedItems;

    cachedRaw = raw;
    cachedItems = raw ? normalizeCartItems(JSON.parse(raw)) : EMPTY_CART;
  } catch {
    cachedRaw = null;
    cachedItems = EMPTY_CART;
  }

  return cachedItems;
}

export function getServerCartSnapshot(): readonly CartItem[] {
  return EMPTY_CART;
}

export function subscribeCart(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const onStorage = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener(CART_UPDATED_EVENT, listener);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(CART_UPDATED_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}

function saveCartItems(items: readonly CartItem[]) {
  if (typeof window === "undefined") return false;

  try {
    const normalized = normalizeCartItems(items);
    const raw = JSON.stringify(normalized);

    window.localStorage.setItem(CART_STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedItems = normalized;
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function addCartItem(item: CartItem) {
  return saveCartItems([...getCartSnapshot(), item]);
}

export function setCartItemQuantity(id: string, quantity: number) {
  return saveCartItems(
    getCartSnapshot().map((item) =>
      getCartItemId(item) === id
        ? {
            ...item,
            quantity: Math.min(
              MAX_ITEM_QUANTITY,
              Math.max(1, Math.floor(quantity)),
            ),
          }
        : item,
    ),
  );
}

export function removeCartItem(id: string) {
  return saveCartItems(
    getCartSnapshot().filter((item) => getCartItemId(item) !== id),
  );
}

export function clearCart() {
  return saveCartItems([]);
}

export function getCartItemCount(items: readonly CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}
