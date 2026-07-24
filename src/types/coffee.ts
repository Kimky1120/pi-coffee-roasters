export type CoffeeStatus = "available" | "coming-soon";

export type RoastLevel =
  | "Light"
  | "Medium-Light"
  | "Medium"
  | "Medium-Dark"
  | "Dark";

/** 1(약함) ~ 5(강함) 척도 */
export type FlavorScore = 1 | 2 | 3 | 4 | 5;

export interface CoffeeBean {
  /** 3자리 상품 코드 (예: "001") */
  code: string;
  name: string;
  /** 예: "Single Origin", "Blend", "Decaf" */
  type: string;
  tastingNotes: string[];
  status: CoffeeStatus;
  image?: string;
  /** 원산지 (예: "Ethiopia Yirgacheffe") */
  origin: string;
  acidity: FlavorScore;
  sweetness: FlavorScore;
  bitterness: FlavorScore;
  body: FlavorScore;
  roastLevel: RoastLevel;
  description: string;
  /** 추천 추출 방식 (예: ["Hand Drip", "Espresso"]) */
  recommendedBrewing: string[];
}
