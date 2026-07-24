import type { ContactChannel } from "@/types/contact";

/**
 * 연락처 채널의 표시 순서와 라벨.
 * 실제 값은 SITE_CONFIG.contact에서 가져오며, 값이 비어 있는 채널은 렌더링하지 않는다.
 */
export const CONTACT_CHANNELS: ContactChannel[] = [
  { key: "address", label: "주소" },
  { key: "phone", label: "전화" },
  { key: "email", label: "이메일" },
  { key: "instagramUrl", label: "Instagram" },
  { key: "naverMapUrl", label: "네이버 지도" },
  { key: "googleMapUrl", label: "Google 지도" },
];
