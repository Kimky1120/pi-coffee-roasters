/**
 * 사이트 전체가 공유하는 모션 타이밍 시스템.
 * Apple/Aesop류의 절제된 스크롤 경험을 위해 값을 한 곳에서만 정의한다.
 */

/** 모든 등장 애니메이션에 쓰는 단일 이징 커브(부드럽게 감속). */
export const EASE = [0.16, 1, 0.3, 1] as const;

export const DURATION = {
  /** 단일 헤딩/텍스트 블록의 등장 애니메이션 */
  block: 0.8,
  /** 그리드/리스트 내 개별 아이템의 등장 애니메이션 */
  item: 0.6,
} as const;

/** 그리드/리스트 아이템이 순차적으로 등장하는 간격(초) */
export const STAGGER = 0.08;

/** fade-up 등장 시 이동 거리(px) */
export const OFFSET = 16;
