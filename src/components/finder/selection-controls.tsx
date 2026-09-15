"use client";

import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Shared selected / unselected styling language:                     */
/*  base  — warm white card, warm beige hairline                       */
/*  hover — soft dusty-rose tint, gentle lift                          */
/*  on    — dusty-rose border + tint, burgundy accents                 */
/* ------------------------------------------------------------------ */

const BASE_CARD =
  "group relative flex w-full rounded-lg border bg-card text-left transition-all duration-300 ease-out";
const CARD_STATE = (selected: boolean) =>
  selected
    ? "border-rose bg-rose/10"
    : "border-line hover:-translate-y-0.5 hover:border-rose/60 hover:bg-rose/5";

interface OptionCardProps {
  label: string;
  hint?: string;
  Icon?: LucideIcon;
  selected: boolean;
  onSelect: () => void;
}

/** A single-select card with a small tasteful icon. */
export function OptionCard({ label, hint, Icon, selected, onSelect }: OptionCardProps) {
  const stacked = Boolean(hint);
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`${BASE_CARD} ${CARD_STATE(selected)} ${
        stacked ? "flex-col items-start gap-4 p-5" : "items-center gap-3.5 p-4"
      }`}
    >
      {Icon ? (
        <span
          aria-hidden="true"
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors duration-300 ${
            selected ? "bg-rose/20 text-burgundy" : "bg-beige text-burgundy/80 group-hover:bg-rose/15"
          }`}
        >
          <Icon className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.75} />
        </span>
      ) : null}
      <span>
        <span
          className={`block text-sm font-medium ${
            selected ? "text-burgundy" : "text-charcoal"
          }`}
        >
          {label}
        </span>
        {hint ? (
          <span className="mt-1 block text-xs leading-relaxed text-muted">{hint}</span>
        ) : null}
      </span>
      <span
        aria-hidden="true"
        className={`absolute top-3 right-3 grid h-5 w-5 place-items-center rounded-full bg-burgundy text-cream transition-all duration-300 ${
          selected ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    </button>
  );
}

interface OptionRowProps {
  label: string;
  hint?: string;
  selected: boolean;
  onSelect: () => void;
}

/** A list row with a radio-style indicator — used for budget choices. */
export function OptionRow({ label, hint, selected, onSelect }: OptionRowProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`${BASE_CARD} ${CARD_STATE(selected)} items-center justify-between gap-4 p-5`}
    >
      <span>
        <span
          className={`block font-serif text-xl tracking-[-0.01em] ${
            selected ? "text-burgundy" : "text-charcoal"
          }`}
        >
          {label}
        </span>
        {hint ? (
          <span className="mt-1 block text-xs text-muted">{hint}</span>
        ) : null}
      </span>
      <span
        aria-hidden="true"
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors duration-300 ${
          selected ? "border-burgundy" : "border-line-strong group-hover:border-rose/70"
        }`}
      >
        <span
          className={`h-2.5 w-2.5 rounded-full bg-burgundy transition-transform duration-300 ${
            selected ? "scale-100" : "scale-0"
          }`}
        />
      </span>
    </button>
  );
}

interface SelectChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

/** A multi-select pill for interests. */
export function SelectChip({ label, selected, onToggle }: SelectChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={`inline-flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm transition-all duration-300 ease-out ${
        selected
          ? "border-rose bg-rose/10 font-medium text-burgundy"
          : "border-line bg-card text-charcoal-2 hover:-translate-y-0.5 hover:border-rose/60 hover:bg-rose/5"
      }`}
    >
      <span
        aria-hidden="true"
        className={`grid h-4 w-4 place-items-center rounded-full bg-burgundy text-cream transition-all duration-300 ${
          selected ? "scale-100 opacity-100" : "hidden scale-50 opacity-0"
        }`}
      >
        <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
      </span>
      {label}
    </button>
  );
}
