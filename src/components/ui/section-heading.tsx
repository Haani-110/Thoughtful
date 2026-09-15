import type { ReactNode } from "react";
import { Reveal } from "./reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  className?: string;
}

/**
 * Shared editorial header: a burgundy eyebrow with a short champagne rule,
 * a large serif title and an optional muted intro line.
 */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={className}>
      <Reveal>
        <p className="eyebrow flex items-center gap-4">
          <span aria-hidden="true" className="h-px w-8 bg-champagne" />
          {eyebrow}
        </p>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="mt-7 max-w-2xl font-serif text-[2.5rem] leading-[1.08] tracking-[-0.015em] text-balance text-charcoal md:text-6xl md:leading-[1.05]">
          {title}
        </h2>
      </Reveal>
      {intro ? (
        <Reveal delay={160}>
          <p className="mt-6 max-w-md text-[0.9375rem] leading-relaxed text-muted">
            {intro}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
