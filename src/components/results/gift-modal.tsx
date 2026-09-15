"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Asterisk, Gift, X } from "lucide-react";
import { GIFT_CATEGORY_LABELS } from "@/data/gifts";
import {
  GIFT_TYPE_OPTIONS,
  OCCASION_OPTIONS,
} from "@/components/finder/finder-data";
import type { RecommendationItem } from "@/lib/recommendations";

function labelFor(
  options: { id: string; label: string }[],
  id: string,
): string {
  return options.find((o) => o.id === id)?.label ?? id;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/** A calm, editorial detail view for one recommendation. */
export function GiftModal({
  item,
  onClose,
}: {
  item: RecommendationItem;
  onClose: () => void;
}) {
  const { gift } = item;
  const dialogRef = useRef<HTMLDivElement>(null);
  const [imageFailed, setImageFailed] = useState(false);

  /* Escape to close, scroll lock, focus containment, focus restore. */
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  const occasions = gift.occasions
    .slice(0, 3)
    .map((id) => labelFor(OCCASION_OPTIONS, id));
  const styles = gift.styles
    .filter((s) => s !== "surprise")
    .map((id) => labelFor(GIFT_TYPE_OPTIONS, id));

  return (
    <div
      className="modal-backdrop-enter fixed inset-0 z-[80] flex items-end justify-center bg-charcoal/35 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gift-modal-title"
        className="modal-panel-enter flex max-h-[92svh] w-full max-w-3xl flex-col overflow-hidden rounded-t-xl border border-line bg-cream sm:rounded-xl"
      >
        <div className="flex items-center justify-between border-b border-line-soft px-5 py-4 sm:px-7">
          <p className="eyebrow">A closer look</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close gift details"
            className="grid h-9 w-9 place-items-center rounded-full text-charcoal transition-colors duration-300 hover:bg-rose/10 hover:text-burgundy"
          >
            <X className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
          </button>
        </div>

        <div className="grid overflow-y-auto md:grid-cols-2">
          {/* ------------------------------ image ------------------------------ */}
          <div className="relative aspect-[4/3] bg-beige md:aspect-auto md:min-h-[420px]">
            {imageFailed ? (
              <div className="grid h-full min-h-[16rem] place-items-center bg-beige">
                <Gift className="h-8 w-8 text-bronze/70" aria-hidden="true" />
              </div>
            ) : (
              <Image
                src={gift.image}
                alt={gift.name}
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-cover"
                onError={() => setImageFailed(true)}
              />
            )}
          </div>

          {/* ----------------------------- details ------------------------------ */}
          <div className="flex flex-col p-6 sm:p-8">
            <div className="flex items-center gap-2.5">
              <span className="rounded-full border border-line bg-beige px-3 py-1 text-[0.6875rem] font-medium tracking-[0.16em] text-charcoal-2 uppercase">
                {GIFT_CATEGORY_LABELS[gift.category]}
              </span>
              <span className="text-[0.6875rem] font-medium tracking-[0.16em] text-bronze uppercase">
                {item.matchScore}% match
              </span>
            </div>

            <h3
              id="gift-modal-title"
              className="mt-4 font-serif text-[1.65rem] leading-snug tracking-[-0.01em] text-charcoal"
            >
              {gift.name}
            </h3>
            <p className="mt-1.5 text-sm font-medium text-charcoal">
              {gift.priceLabel}
              <span className="ml-2 font-normal text-muted">
                · about ${gift.price}
              </span>
            </p>

            <p className="mt-4 text-sm leading-relaxed text-muted">
              {gift.description}
            </p>

            <div className="mt-6 border-t border-line-soft pt-5">
              <p className="text-[0.6875rem] font-medium tracking-[0.22em] text-faint uppercase">
                Why it&rsquo;s a match
              </p>
              <p className="mt-2 font-serif text-[1.05rem] leading-snug text-charcoal-2 italic">
                {item.reason}
              </p>
            </div>

            <dl className="mt-6 space-y-4 border-t border-line-soft pt-5 text-sm">
              <div className="flex gap-4">
                <dt className="w-24 shrink-0 text-[0.6875rem] font-medium tracking-[0.18em] text-muted uppercase">
                  Their interests
                </dt>
                <dd className="text-charcoal-2">{gift.interests.join(", ")}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-24 shrink-0 text-[0.6875rem] font-medium tracking-[0.18em] text-muted uppercase">
                  Great for
                </dt>
                <dd className="text-charcoal-2">{occasions.join(", ")}</dd>
              </div>
              {styles.length > 0 ? (
                <div className="flex gap-4">
                  <dt className="w-24 shrink-0 text-[0.6875rem] font-medium tracking-[0.18em] text-muted uppercase">
                    Gift style
                  </dt>
                  <dd className="text-charcoal-2">{styles.join(", ")}</dd>
                </div>
              ) : null}
            </dl>

            <p className="mt-auto flex items-center justify-center gap-2 pt-8 text-xs tracking-[0.04em] text-faint">
              <Asterisk className="h-3 w-3 text-champagne" aria-hidden="true" />
              Retailer links are coming soon — we&rsquo;re hand-picking where to
              buy each gift.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
