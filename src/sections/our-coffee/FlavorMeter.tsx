import type { CoffeeBean, FlavorScore } from "@/types/coffee";
import { cn } from "@/lib/utils/cn";

const METERS: { key: keyof Pick<CoffeeBean, "acidity" | "sweetness" | "bitterness" | "body">; label: string }[] = [
  { key: "acidity", label: "Acidity" },
  { key: "sweetness", label: "Sweetness" },
  { key: "bitterness", label: "Bitterness" },
  { key: "body", label: "Body" },
];

function Dots({ value }: { value: FlavorScore }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-[5px] w-[5px] rounded-full",
            i < value ? "bg-primary" : "bg-primary/15",
          )}
        />
      ))}
    </div>
  );
}

export function FlavorMeter({ bean }: { bean: CoffeeBean }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
      {METERS.map(({ key, label }) => (
        <div key={key} className="flex items-center justify-between gap-3">
          <span className="font-sans text-[11px] tracking-[0.15em] text-foreground/50">
            {label}
          </span>
          <Dots value={bean[key]} />
        </div>
      ))}
    </div>
  );
}
