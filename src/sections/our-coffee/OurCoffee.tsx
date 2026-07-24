import { COFFEE_BEANS } from "@/data/coffee";
import { OurCoffeeContent } from "./OurCoffeeContent";

export function OurCoffee() {
  return (
    <section
      id="our-coffee"
      className="relative w-full overflow-hidden bg-surface py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <OurCoffeeContent beans={COFFEE_BEANS} />
      </div>
    </section>
  );
}
