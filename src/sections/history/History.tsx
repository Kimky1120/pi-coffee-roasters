import Image from "next/image";
import { HISTORY_ITEMS } from "@/data/history";
import { HistoryContent } from "./HistoryContent";

export function History() {
  return (
    <section
      id="history"
      className="relative w-full overflow-hidden py-24 sm:py-32"
    >
      <Image
        src="/images/gallery/gallery-02.jpg"
        alt="갓 로스팅한 커피 원두가 쿨링 트레이로 쏟아지는 모습"
        fill
        sizes="100vw"
        className="object-cover object-center saturate-75"
      />
      <div className="absolute inset-0 bg-primary/80" aria-hidden />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
        <HistoryContent items={HISTORY_ITEMS} />
      </div>
    </section>
  );
}
