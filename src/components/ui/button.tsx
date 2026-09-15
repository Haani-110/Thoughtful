import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

type Variant = "primary" | "outline" | "link";

interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
  variant?: Variant;
  withArrow?: boolean;
  className?: string;
}

/**
 * Thoughtful's single interactive styling language:
 * - primary : burgundy fill, small-caps label, arrow that drifts on hover
 * - outline : quiet hairline border (navigation)
 * - link    : editorial underline that redraws itself on hover
 */
export function Button({
  href,
  children,
  variant = "primary",
  withArrow = variant === "primary",
  className = "",
  ...rest
}: ButtonProps) {
  if (variant === "link") {
    return (
      <Link
        href={href}
        className={`group relative inline-flex items-center gap-2 py-1 text-sm font-medium tracking-[0.02em] text-charcoal transition-colors duration-300 hover:text-burgundy ${className}`}
        {...rest}
      >
        {children}
        <ArrowRight
          className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1"
          aria-hidden="true"
        />
        <span
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-0.5 h-px bg-charcoal/20 transition-colors duration-300 group-hover:bg-burgundy/30"
        />
        <span
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-burgundy transition-transform duration-500 ease-out group-hover:scale-x-100"
        />
      </Link>
    );
  }

  const base =
    "group inline-flex items-center justify-center gap-3 rounded-[2px] text-[0.6875rem] font-medium uppercase tracking-[0.22em] transition-all duration-300 ease-out";

  const styles =
    variant === "primary"
      ? "bg-burgundy px-7 py-4 text-cream hover:-translate-y-px hover:bg-burgundy-2 active:bg-burgundy-3"
      : "border border-line px-5 py-2.5 text-charcoal hover:border-burgundy/50 hover:bg-rose/5 hover:text-burgundy";

  return (
    <Link href={href} className={`${base} ${styles} ${className}`} {...rest}>
      {children}
      {withArrow ? (
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1"
          aria-hidden="true"
        />
      ) : null}
    </Link>
  );
}
