import type { WholesaleBenefit, WholesaleInfoItem } from "@/types/wholesale";

/**
 * "왜 PI Coffee인가"에 대한 답. 항목을 추가하면 그리드에 자동 반영된다.
 */
export const WHOLESALE_BENEFITS: WholesaleBenefit[] = [
  {
    icon: "quality",
    title: "균일한 품질",
    description: "동일한 로스팅 프로파일로 언제 주문해도 같은 맛을 보장합니다.",
  },
  {
    icon: "supply",
    title: "안정적인 공급",
    description: "정기 납품 일정에 맞춰 끊김 없이 원두를 공급합니다.",
  },
  {
    icon: "custom",
    title: "맞춤 로스팅",
    description: "매장의 메뉴와 취향에 맞춰 로스팅 포인트를 함께 조율합니다.",
  },
  {
    icon: "support",
    title: "전담 지원",
    description: "메뉴 구성부터 바리스타 교육까지 운영을 함께 고민합니다.",
  },
];

/**
 * 실제 운영 정보. 값이 확정되면 이 배열만 수정하면 된다.
 */
export const WHOLESALE_INFO: WholesaleInfoItem[] = [
  { label: "최소 주문 수량", value: "5kg부터" },
  { label: "납품 주기", value: "주 1~2회 정기 배송" },
  { label: "배송 지역", value: "전국" },
  { label: "샘플 원두", value: "무료 제공" },
];
