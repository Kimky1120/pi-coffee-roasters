import { Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function PreparationNotice({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-sm bg-primary/5 px-4 py-3 text-sm leading-relaxed text-foreground/70",
        className,
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <p>{children}</p>
    </div>
  );
}
