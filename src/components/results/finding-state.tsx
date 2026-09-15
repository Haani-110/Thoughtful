"use client";

import { useEffect, useState, type ReactNode } from "react";

const DOT_COLORS = ["bg-burgundy", "bg-rose", "bg-champagne"];

const DEFAULT_CAPTIONS = [
  "Looking at what makes them unique…",
  "Matching their interests…",
  "Finding the thoughtful ones…",
];

/**
 * Thoughtful's loading experience — quiet dots and a rotating serif
 * caption. No robots, no orbs, no "AI is thinking" theatrics.
 */
export function FindingState({
  title,
  captions = DEFAULT_CAPTIONS,
  statusText = "Finding your gifts, please wait.",
}: {
  title?: ReactNode;
  captions?: string[];
  statusText?: string;
}) {
  const [captionIndex, setCaptionIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setCaptionIndex((i) => (i + 1) % captions.length),
      2200,
    );
    return () => window.clearInterval(timer);
  }, [captions.length]);

  return (
    <main
      id="main"
      className="container-x flex flex-1 flex-col items-center justify-center py-24 text-center"
    >
      <div role="status" aria-live="polite">
        <span className="sr-only">{statusText}</span>
        <div aria-hidden="true" className="flex items-center justify-center gap-2.5">
          {DOT_COLORS.map((color, i) => (
            <span
              key={color}
              className={`loading-dot h-2.5 w-2.5 rounded-full ${color}`}
              style={{ animationDelay: `${i * 180}ms` }}
            />
          ))}
        </div>
      </div>

      <h1 className="mt-10 max-w-lg font-serif text-4xl leading-[1.12] tracking-[-0.015em] text-balance text-charcoal md:text-5xl">
        {title ?? (
          <>
            Finding something
            <br />
            they&rsquo;ll love&hellip;
          </>
        )}
      </h1>

      <div aria-hidden="true" className="mt-6 h-6">
        <p
          key={captionIndex}
          className="step-enter font-serif text-lg text-muted italic"
        >
          {captions[captionIndex]}
        </p>
      </div>
    </main>
  );
}
