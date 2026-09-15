export function FinderProgress({
  step,
  total,
}: {
  step: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-5">
      <p className="shrink-0 text-[0.6875rem] font-medium tracking-[0.25em] text-muted uppercase">
        Step {step} of {total}
      </p>
      <div
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Step ${step} of ${total}`}
        className="h-[3px] w-full overflow-hidden rounded-full bg-line"
      >
        <div
          className="h-full rounded-full bg-burgundy transition-[width] duration-500 ease-out"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
