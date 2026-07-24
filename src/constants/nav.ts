export type NavItem = {
  label: string;
  href: string;
};

/**
 * 단일 페이지(원페이지 스크롤) 구조의 섹션 앵커 내비게이션.
 * Homepage Structure(01 Hero ~ 08 Footer)의 섹션 id와 1:1로 매칭된다.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: "About", href: "#about" },
  { label: "Coffee", href: "#our-coffee" },
  { label: "Roasting", href: "#roasting" },
  { label: "Wholesale", href: "#wholesale" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];
