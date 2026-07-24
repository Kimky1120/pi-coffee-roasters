import type { CoffeeBean } from "@/types/coffee";
import { cn } from "@/lib/utils/cn";
import { FlavorMeter } from "./FlavorMeter";

const STATUS_LABEL: Record<CoffeeBean["status"], string> = {
  available: "Available",
  "coming-soon": "Coming Soon",
};

export function CoffeeCard({ bean }: { bean: CoffeeBean }) {
  return (
    <div
      className={cn(
        "flex h-full flex-col gap-5 rounded-sm border border-border bg-background p-8 sm:p-10",
        "transition-[transform,box-shadow] duration-300 ease-out",
        "hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs tracking-[0.2em] text-primary/50">
          {bean.code}
        </span>
        <span
          className={cn(
            "rounded-full border px-3 py-1 text-xs tracking-wide",
            bean.status === "available"
              ? "border-primary/30 text-primary"
              : "border-border text-foreground/40",
          )}
        >
          {STATUS_LABEL[bean.status]}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-sans text-xs tracking-[0.15em] text-foreground/50">
          {bean.type}
        </span>
        <h3 className="font-display text-2xl font-medium tracking-tight text-primary sm:text-3xl">
          {bean.name}
        </h3>
      </div>

      <p className="font-sans text-sm leading-relaxed text-foreground/70">
        {bean.description}
      </p>

      <span className="font-sans text-xs tracking-[0.15em] text-foreground/50">
        {bean.origin} · {bean.roastLevel}
      </span>

      <FlavorMeter bean={bean} />

      <div className="mt-auto flex flex-col gap-3 pt-4">
        <div className="flex flex-col gap-2">
          <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-foreground/40">
            Flavor Notes
          </span>
          <div className="flex flex-wrap gap-2">
            {bean.tastingNotes.map((note) => (
              <span
                key={note}
                className="rounded-full bg-primary/5 px-3 py-1 text-xs text-foreground/70"
              >
                {note}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-foreground/40">
            Best With
          </span>
          <div className="flex flex-wrap gap-2">
            {bean.recommendedBrewing.map((method) => (
              <span
                key={method}
                className="rounded-full border border-border px-3 py-1 text-xs text-foreground/60"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
