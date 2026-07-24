import type { CoffeeBean } from "@/types/coffee";

/**
 * 판매 중인 원두 목록.
 * 신규 원두(예: Daisy Blend)는 이 배열에 항목을 추가하는 것만으로 확장된다.
 */
export const COFFEE_BEANS: CoffeeBean[] = [
  {
    code: "001",
    name: "PI.TING",
    type: "Blend",
    tastingNotes: ["Nutty", "Dark Chocolate", "Caramel"],
    status: "available",
  },
  {
    code: "002",
    name: "Bottom Up",
    type: "Blend",
    tastingNotes: ["Nutty", "Roasted Corn"],
    status: "available",
  },
  {
    code: "004",
    name: "Decaf",
    type: "Decaf",
    tastingNotes: ["Chocolate", "Nutty"],
    status: "available",
  },
];
