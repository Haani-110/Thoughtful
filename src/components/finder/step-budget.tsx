"use client";

import { useEffect, useRef } from "react";
import { BUDGET_CUSTOM_ID, BUDGET_OPTIONS } from "./finder-data";
import { OptionRow } from "./selection-controls";

export function StepBudget({
  value,
  custom,
  onChange,
  onCustomChange,
}: {
  value: string | null;
  custom: string;
  onChange: (id: string) => void;
  onCustomChange: (amount: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isCustom = value === BUDGET_CUSTOM_ID;

  useEffect(() => {
    if (isCustom) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 350);
      return () => window.clearTimeout(t);
    }
  }, [isCustom]);

  return (
    <div>
      <ul className="grid gap-3">
        {BUDGET_OPTIONS.map((option, i) => (
          <li
            key={option.id}
            className="step-enter"
            style={{ animationDelay: `${i * 55}ms` }}
          >
            <OptionRow
              label={option.label}
              hint={option.hint}
              selected={value === option.id}
              onSelect={() => onChange(option.id)}
            />
          </li>
        ))}
      </ul>

      {/* custom amount — revealed only when chosen */}
      <div
        className={`grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isCustom ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
        aria-hidden={!isCustom}
      >
        <div className="overflow-hidden">
          <div className="rounded-lg border border-line bg-card px-5 py-5">
            <label
              htmlFor="custom-budget"
              className="text-[0.6875rem] font-medium tracking-[0.25em] text-muted uppercase"
            >
              Your budget
            </label>
            <div className="mt-3 flex items-baseline gap-2">
              <span aria-hidden="true" className="font-serif text-xl text-muted">
                $
              </span>
              <input
                ref={inputRef}
                id="custom-budget"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="75"
                tabIndex={isCustom ? undefined : -1}
                value={custom}
                onChange={(e) => onCustomChange(e.target.value.replace(/[^\d]/g, ""))}
                className="w-full max-w-[12rem] border-b border-line-strong bg-transparent pb-1.5 font-serif text-2xl text-charcoal transition-colors duration-300 outline-none placeholder:text-faint/60 focus:border-burgundy"
              />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Roughly is fine — it only guides the ideas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
