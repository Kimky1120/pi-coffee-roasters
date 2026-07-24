export type CoffeeStatus = "available" | "coming-soon";

export interface CoffeeBean {
  /** 3자리 상품 코드 (예: "001") */
  code: string;
  name: string;
  /** 예: "Single Origin", "Blend", "Decaf" */
  type: string;
  tastingNotes: string[];
  status: CoffeeStatus;
  image?: string;
}
