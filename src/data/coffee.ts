import type { CoffeeBean } from "@/types/coffee";

/**
 * 판매 중인 원두 목록.
 * 신규 원두(예: Daisy Blend)는 이 배열에 항목을 추가하는 것만으로 확장된다.
 */
export const COFFEE_BEANS: CoffeeBean[] = [
  {
    code: "001",
    slug: "pi-ting",
    name: "PI.TING",
    type: "Blend",
    tastingNotes: ["Nutty", "Dark Chocolate", "Caramel"],
    status: "available",
    image: "/images/coffee/pi-ting-cupnote.jpg",
    origin: "Ethiopia, Brazil, Indonesia",
    acidity: 2,
    sweetness: 4,
    bitterness: 3,
    body: 4,
    roastLevel: "Medium-Dark",
    description:
      "고소한 견과류와 다크 초콜릿이 어우러지는, 균형감 있고 부드러운 데일리 블렌드.",
    recommendedBrewing: ["Hand Drip", "Espresso"],
  },
  {
    code: "002",
    slug: "bottom-up",
    name: "Bottom Up",
    type: "Blend",
    tastingNotes: ["Nutty", "Roasted Corn"],
    status: "available",
    image: "/images/coffee/bottom-up-cupnote.jpg",
    origin: "Brazil, Colombia, India R",
    acidity: 1,
    sweetness: 3,
    bitterness: 4,
    body: 5,
    roastLevel: "Dark",
    description:
      "묵직한 바디감과 구수한 로스티드 콘 향이 특징인 진한 다크 로스트 블렌드.",
    recommendedBrewing: ["Espresso", "Hand Drip"],
  },
  {
    code: "004",
    slug: "decaf",
    name: "Decaf",
    type: "Decaf",
    tastingNotes: ["Sweet Potato", "Almond"],
    status: "available",
    image: "/images/coffee/decaf-cupnote.jpg",
    origin: "Colombia (Decaf)",
    acidity: 2,
    sweetness: 3,
    bitterness: 2,
    body: 3,
    roastLevel: "Dark",
    description:
      "카페인 부담 없이 즐기는 초콜릿과 견과류 풍미의 부드러운 디카페인 원두.",
    recommendedBrewing: ["Espresso", "Hand Drip"],
  },
];
