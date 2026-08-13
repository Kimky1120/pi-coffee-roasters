import { MessageCircle } from "lucide-react";

export function KakaoChannelFloat({ href }: { href: string }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="카카오톡 채널에서 원두 상담하기"
      className="group fixed bottom-8 right-8 z-40 hidden h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-[#FEE500] text-[#191919] shadow-lg shadow-black/10 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:-translate-y-1 md:flex"
    >
      <MessageCircle className="h-6 w-6" strokeWidth={1.9} aria-hidden />
      <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded-full bg-[#191919] px-3 py-2 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
        카카오 상담
      </span>
    </a>
  );
}
