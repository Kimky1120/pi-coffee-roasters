/**
 * 실제 도메인이 확정되면 NEXT_PUBLIC_SITE_URL 환경변수로 덮어쓴다.
 */
const DEFAULT_SITE_URL = "https://www.pi-coffeeroasters.com";
const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
const kakaoChatUrl = process.env.NEXT_PUBLIC_KAKAO_CHAT_URL?.trim() ?? "";

const SITE_URL = (() => {
  const url = new URL(configuredSiteUrl);

  if (
    url.hostname === "pi-coffeeroasters.com" ||
    url.hostname === "www.pi-coffeeroasters.com"
  ) {
    url.protocol = "https:";
    url.hostname = "www.pi-coffeeroasters.com";
    url.pathname = url.pathname.replace(/\/+$/, "");
    url.search = "";
    url.hash = "";
  }

  return url.toString().replace(/\/$/, "");
})();

export const SITE_CONFIG = {
  name: "파이커피로스터스",
  alternateName: "PI Coffee Roasters",
  shortName: "파이커피",
  homeTitle: "파이커피로스터스 | 천안 안서동 스페셜티 커피 로스터리",
  slogan: "오래 기억되는 커피를 만듭니다.",
  description:
    "천안 안서동 파이커피로스터스. 산지와 품종의 개성을 살린 스페셜티 원두를 로스팅하고 카페·매장에 납품합니다.",
  philosophy: [
    "우리는 원두의 개성을 과장하지 않고, 산지와 품종이 가진 본연의 특성을 균형 있게 표현하는 로스팅을 지향합니다.",
    "한 잔의 커피가 특별한 이벤트가 아니라 일상의 좋은 순간이 되기를 바랍니다.",
  ],
  keywords: [
    "파이커피",
    "파이커피로스터스",
    "PI Coffee Roasters",
    "천안 파이커피",
    "천안 안서동 카페",
    "천안 스페셜티 커피",
    "스페셜티 커피",
    "커피 로스터리",
    "원두 납품",
    "카페 창업 원두",
  ],
  locale: "ko_KR",
  url: SITE_URL,
  kakaoChatUrl,
  businessAddress: {
    streetAddress: "천호지길 27 2동 지하1층",
    addressLocality: "천안시 동남구",
    addressRegion: "충청남도",
    addressCountry: "KR",
  },
  openingHours: {
    days: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "09:00",
    closes: "21:00",
  },
  contact: {
    address: "충남 천안시 동남구 천호지길 27 2동 지하1층",
    hours: "매일 09:00–21:00 · 라스트오더 20:50",
    phone: "010-8822-9428",
    email: "picoffeeroasters@naver.com",
    instagramUrl:
      "https://www.instagram.com/picoffee.roasters?igsh=MW94Z3kzc3g2Z3R5bg==",
    naverMapUrl:
      "https://map.naver.com/p/search/%ED%8C%8C%EC%9D%B4%EC%BB%A4%ED%94%BC%EB%A1%9C%EC%8A%A4%ED%84%B0%EC%8A%A4/place/1636074052?placePath=%3Fbk_query%3D%25ED%258C%258C%25EC%259D%25B4%25EC%25BB%25A4%25ED%2594%25BC%25EB%25A1%259C%25EC%258A%25A4%25ED%2584%25B0%25EC%258A%25A4%26entry%3Dpll%26from%3Dnx%26fromNxList%3Dtrue&placeSearchOption=bk_query%3D%25ED%258C%258C%25EC%259D%25B4%25EC%25BB%25A4%25ED%2594%25BC%25EB%25A1%259C%25EC%258A%25A4%25ED%2584%25B0%25EC%258A%25A4%26entry%3Dpll%26fromNxList%3Dtrue&searchType=place",
    googleMapUrl: "",
  } as Record<
    | "address"
    | "hours"
    | "phone"
    | "email"
    | "instagramUrl"
    | "naverMapUrl"
    | "googleMapUrl",
    string
  >,
} as const;
