"use client";

import { INTEREST_OPTIONS } from "./finder-data";
import { SelectChip } from "./selection-controls";

export function StepInterests({
  values,
  onToggle,
}: {
  values: string[];
  onToggle: (label: string) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-2.5 sm:gap-3">
        {INTEREST_OPTIONS.map((interest, i) => (
          <span
            key={interest}
            className="step-enter inline-block"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <SelectChip
              label={interest}
              selected={values.includes(interest)}
              onToggle={() => onToggle(interest)}
            />
          </span>
        ))}
      </div>
      <p
        aria-live="polite"
        className={`mt-7 text-[0.6875rem] font-medium tracking-[0.22em] text-bronze uppercase transition-opacity duration-300 ${
          values.length > 0 ? "opacity-100" : "opacity-0"
        }`}
      >
        {values.length} selected
      </p>
    </div>
  );
}
