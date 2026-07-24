import { CONTACT_CHANNELS } from "@/data/contact";
import type { ContactChannelKey } from "@/types/contact";

const FOOTER_CONTACT_KEYS: ContactChannelKey[] = [
  "address",
  "phone",
  "email",
  "instagramUrl",
];

/**
 * Footer에는 지도 링크(naverMapUrl, googleMapUrl)를 제외한 핵심 연락처만 노출한다.
 */
export const FOOTER_CONTACT_CHANNELS = CONTACT_CHANNELS.filter((channel) =>
  FOOTER_CONTACT_KEYS.includes(channel.key),
);
