import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "solid" | "outline" | "primary" | "outline-primary";

interface ButtonProps {
  /** 값이 없으면 비활성 상태로 렌더링된다(연결할 채널이 아직 준비되지 않은 경우). */
  href?: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
}

export function Button({
  href,
  children,
  variant = "solid",
  className,
}: ButtonProps) {
  const classes = cn(
    "group inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm tracking-wide transition duration-300 ease-out active:scale-[0.98] sm:text-base",
    variant === "solid" && "bg-background text-primary hover:bg-background/90",
    variant === "outline" &&
      "border border-background text-background hover:bg-background hover:text-primary",
    variant === "primary" && "bg-primary text-background hover:bg-primary/90",
    variant === "outline-primary" &&
      "border border-primary/30 text-primary hover:bg-primary hover:text-background",
    !href && "pointer-events-none opacity-40 hover:bg-none",
    className,
  );

  if (!href) {
    return (
      <span className={classes} aria-disabled="true">
        {children}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </span>
    );
  }

  return (
    <a href={href} className={classes}>
      {children}
      <ArrowRight
        className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1"
        aria-hidden
      />
    </a>
  );
}
