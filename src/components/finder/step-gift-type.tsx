"use client";

import { GIFT_TYPE_OPTIONS } from "./finder-data";
import { OptionCard } from "./selection-controls";

export function StepGiftType({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (id: string) => void;
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {GIFT_TYPE_OPTIONS.map((option, i) => (
        <li
          key={option.id}
          className={`step-enter ${option.id === "surprise" ? "sm:col-span-2" : ""}`}
          style={{ animationDelay: `${i * 55}ms` }}
        >
          <OptionCard
            label={option.label}
            hint={option.hint}
            Icon={option.Icon}
            selected={value === option.id}
            onSelect={() => onChange(option.id)}
          />
        </li>
      ))}
    </ul>
  );
}
