import Link from "next/link";
import { X } from "lucide-react";

export function AuthNotice({ message }: { message: string }) {
  return (
    <div className="fixed inset-x-0 top-20 z-40 flex justify-center px-4 sm:top-24">
      <div
        role="status"
        className="flex w-full max-w-lg items-start gap-3 rounded-sm border border-primary/15 bg-background/95 px-5 py-4 text-sm leading-relaxed text-primary shadow-lg backdrop-blur-md"
      >
        <span className="flex-1">{message}</span>
        <Link
          href="/"
          aria-label="알림 닫기"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-primary/60 hover:bg-primary/10 hover:text-primary"
        >
          <X className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
