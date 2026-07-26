export const GRIND_OPTIONS = [
  "홀빈",
  "프렌치프레스",
  "핸드드립·커피메이커",
  "더치커피",
  "모카포트",
  "에스프레소",
] as const;

export type GrindOption = (typeof GRIND_OPTIONS)[number];
export type ProductWeight = "200g" | "500g" | "1kg";

export const PRODUCT_PRICES: Record<
  string,
  Partial<Record<ProductWeight, number>>
> = {
  "pi-ting": {
    "200g": 12_000,
    "500g": 22_000,
    "1kg": 33_000,
  },
  "bottom-up": {
    "200g": 12_000,
    "500g": 22_000,
    "1kg": 33_000,
  },
  decaf: {
    "1kg": 44_000,
  },
};

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("ko-KR").format(price);
