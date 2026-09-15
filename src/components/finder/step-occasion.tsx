"use client";

import { OCCASION_OPTIONS } from "./finder-data";
import { OptionCard } from "./selection-controls";

export function StepOccasion({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (id: string) => void;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {OCCASION_OPTIONS.map((option, i) => (
        <li
          key={option.id}
          className="step-enter"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <OptionCard
            label={option.label}
            Icon={option.Icon}
            selected={value === option.id}
            onSelect={() => onChange(option.id)}
          />
        </li>
      ))}
    </ul>
  );
}
