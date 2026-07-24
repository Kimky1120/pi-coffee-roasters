/**
 * 실제 도메인이 확정되면 NEXT_PUBLIC_SITE_URL 환경변수로 덮어쓴다.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://picoffeeroasters.com";

export const SITE_CONFIG = {
  name: "PI Coffee Roasters",
  shortName: "PI Coffee",
  slogan: "오래 기억되는 커피를 만듭니다.",
  description:
    "PI Coffee Roasters는 유행을 따르는 커피보다 오래 기억되는 커피를 만듭니다. 산지와 품종이 가진 본연의 특성을 균형 있게 표현하는 스페셜티 커피 로스터리입니다.",
  philosophy: [
    "우리는 원두의 개성을 과장하지 않고, 산지와 품종이 가진 본연의 특성을 균형 있게 표현하는 로스팅을 지향합니다.",
    "한 잔의 커피가 특별한 이벤트가 아니라 일상의 좋은 순간이 되기를 바랍니다.",
  ],
  keywords: [
    "PI Coffee Roasters",
    "파이커피로스터스",
    "스페셜티 커피",
    "커피 로스터리",
    "원두 납품",
    "카페 창업 원두",
  ],
  locale: "ko_KR",
  url: SITE_URL,
  contact: {
    address: "충남 천안시 천호지길 27",
    phone: "01088229428",
    email: "lghkfkdehl1@naver.com",
    instagramUrl:
      "https://www.instagram.com/picoffee.roasters?igsh=MW94Z3kzc3g2Z3R5bg==",
    naverMapUrl:
      "https://map.naver.com/p/search/%ED%8C%8C%EC%9D%B4%EC%BB%A4%ED%94%BC%EB%A1%9C%EC%8A%A4%ED%84%B0%EC%8A%A4/place/1636074052?placePath=%3Fbk_query%3D%25ED%258C%258C%25EC%259D%25B4%25EC%25BB%25A4%25ED%2594%25BC%25EB%25A1%259C%25EC%258A%25A4%25ED%2584%25B0%25EC%258A%25A4%26entry%3Dpll%26from%3Dnx%26fromNxList%3Dtrue&placeSearchOption=bk_query%3D%25ED%258C%258C%25EC%259D%25B4%25EC%25BB%25A4%25ED%2594%25BC%25EB%25A1%259C%25EC%258A%25A4%25ED%2584%25B0%25EC%258A%25A4%26entry%3Dpll%26fromNxList%3Dtrue&searchType=place",
    googleMapUrl: "",
  } as Record<
    "address" | "phone" | "email" | "instagramUrl" | "naverMapUrl" | "googleMapUrl",
    string
  >,
} as const;
