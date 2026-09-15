"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

/**
 * "Want to make these even more personal?" — one more detail,
 * then the recommendations are regenerated server-side.
 */
export function RefinePanel({
  onRefine,
  errorMessage = null,
}: {
  onRefine: (detail: string) => void;
  errorMessage?: string | null;
}) {
  const [detail, setDetail] = useState("");
  const canRefine = detail.trim().length > 0;

  const submit = () => {
    if (!canRefine) return;
    onRefine(detail.trim());
    setDetail("");
  };

  return (
    <section
      aria-labelledby="refine-title"
      className="mt-20 border-y border-line bg-beige"
    >
      <div className="mx-auto grid max-w-5xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
        <div>
          <p className="eyebrow flex items-center gap-4">
            <span aria-hidden="true" className="h-px w-8 bg-champagne" />
            One more thing
          </p>
          <h2
            id="refine-title"
            className="mt-6 font-serif text-[1.9rem] leading-[1.15] tracking-[-0.015em] text-balance text-charcoal md:text-4xl"
          >
            Want to make these even more personal?
          </h2>
          <p className="mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-muted">
            Tell us one more thing about them and we&rsquo;ll refine your
            picks.
          </p>
        </div>

        <div>
          <label
            htmlFor="refine-detail"
            className="text-[0.6875rem] font-medium tracking-[0.22em] text-muted uppercase"
          >
            One more detail about them
          </label>
          <textarea
            id="refine-detail"
            rows={4}
            value={detail}
            maxLength={400}
            onChange={(event) => setDetail(event.target.value)}
            placeholder="She keeps every photo from our trips..."
            className="mt-3 w-full resize-none rounded-lg border border-line bg-card p-4 text-[0.9375rem] leading-relaxed text-charcoal transition-colors duration-300 outline-none placeholder:text-faint/70 focus:border-burgundy"
          />
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-4">
            <button
              type="button"
              onClick={submit}
              disabled={!canRefine}
              className="group inline-flex items-center justify-center gap-3 rounded-[2px] bg-burgundy px-7 py-4 text-[0.6875rem] font-medium tracking-[0.22em] text-cream uppercase transition-all duration-300 hover:-translate-y-px hover:bg-burgundy-2 active:bg-burgundy-3 disabled:pointer-events-none disabled:opacity-40"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Make it more personal
            </button>
            <p className="text-xs leading-relaxed text-muted">
              Your new picks appear in a few seconds.
            </p>
          </div>
          <div aria-live="polite">
            {errorMessage ? (
              <p role="status" className="mt-4 text-xs leading-relaxed text-[#a0564c]">
                {errorMessage}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
