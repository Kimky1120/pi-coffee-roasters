import type { RoastingStep } from "@/types/roasting";

/**
 * 로스팅 철학을 전달하는 프로세스 단계.
 * 새 단계가 생기면 이 배열에 항목을 추가하는 것만으로 확장된다.
 */
export const ROASTING_STEPS: RoastingStep[] = [
  {
    step: "01",
    title: "생두 선별",
    description:
      "산지와 품종이 가진 고유의 개성을 가장 잘 표현할 수 있는 생두만을 고릅니다.",
  },
  {
    step: "02",
    title: "샘플 로스팅 & 커핑",
    description:
      "수십 차례의 샘플 로스팅과 커핑을 거쳐 원두 본연의 밸런스를 찾습니다.",
  },
  {
    step: "03",
    title: "로스팅",
    description: "과장하거나 왜곡하지 않고, 원두가 가진 특성을 있는 그대로 담아냅니다.",
  },
  {
    step: "04",
    title: "테이스팅 & 완성",
    description: "일상에서 편안하게 즐길 수 있는 한 잔으로 다듬어 완성합니다.",
  },
];
