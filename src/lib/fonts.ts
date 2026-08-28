import localFont from "next/font/local";

export const cormorantGaramond = localFont({
  src: [
    { path: "../fonts/local/cormorant-400.ttf", weight: "400", style: "normal" },
    { path: "../fonts/local/cormorant-400-italic.ttf", weight: "400", style: "italic" },
    { path: "../fonts/local/cormorant-500.ttf", weight: "500", style: "normal" },
    { path: "../fonts/local/cormorant-500-italic.ttf", weight: "500", style: "italic" },
    { path: "../fonts/local/cormorant-600.ttf", weight: "600", style: "normal" },
    { path: "../fonts/local/cormorant-600-italic.ttf", weight: "600", style: "italic" },
    { path: "../fonts/local/cormorant-700.ttf", weight: "700", style: "normal" },
    { path: "../fonts/local/cormorant-700-italic.ttf", weight: "700", style: "italic" },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

export const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export const notoSansKR = localFont({
  src: [
    { path: "../fonts/local/noto-sans-kr-400.ttf", weight: "400", style: "normal" },
    { path: "../fonts/local/noto-sans-kr-500.ttf", weight: "500", style: "normal" },
  ],
  display: "swap",
});
