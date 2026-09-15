"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** delay in ms before the transition starts */
  delay?: number;
  /** "up" = soft fade/slide · "media" = image settle inside a mask */
  variant?: "up" | "media";
  className?: string;
}

/**
 * Gentle one-shot reveal on scroll. Everything snaps to visible instantly
 * for users who prefer reduced motion (handled via CSS).
 */
export function Reveal({
  children,
  delay = 0,
  variant = "up",
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    /* Reduced-motion users are handled entirely in CSS (everything stays
       visible); the observer only ever marks visibility from its callback. */
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (variant === "media") {
    return (
      <div
        ref={ref}
        className={`reveal-media ${visible ? "is-visible" : ""} ${className}`}
      >
        <div
          className="reveal-media-inner h-full w-full"
          style={{ transitionDelay: `${delay}ms` }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
