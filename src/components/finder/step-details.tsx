"use client";

export function StepDetails({
  value,
  onChange,
}: {
  value: string;
  onChange: (detail: string) => void;
}) {
  return (
    <div className="step-enter">
      <label htmlFor="gift-detail" className="sr-only">
        Anything else we should know
      </label>
      <textarea
        id="gift-detail"
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="She\u2019s always taking photos when we travel together..."
        maxLength={600}
        className="w-full resize-none rounded-lg border border-line bg-card p-5 text-[0.9375rem] leading-relaxed text-charcoal transition-colors duration-300 outline-none placeholder:text-faint/70 focus:border-burgundy"
      />
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <p className="text-xs leading-relaxed text-muted">
          Optional — even one sentence helps.
        </p>
        <p aria-hidden="true" className="shrink-0 text-xs text-faint">
          {value.length}/600
        </p>
      </div>
    </div>
  );
}
