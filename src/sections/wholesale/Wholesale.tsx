import { WHOLESALE_BENEFITS, WHOLESALE_INFO } from "@/data/wholesale";
import { WholesaleContent } from "./WholesaleContent";

export function Wholesale() {
  return (
    <section
      id="wholesale"
      className="relative w-full overflow-hidden bg-background py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <WholesaleContent benefits={WHOLESALE_BENEFITS} info={WHOLESALE_INFO} />
      </div>
    </section>
  );
}
