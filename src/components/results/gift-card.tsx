"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Gift } from "lucide-react";
import { GIFT_CATEGORY_LABELS } from "@/data/gifts";
import type { RecommendationItem } from "@/lib/recommendations";

export function GiftCard({
  item,
  index,
  onView,
}: {
  item: RecommendationItem;
  index: number;
  onView: (item: RecommendationItem) => void;
}) {
  const { gift } = item;
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article
      className="step-enter flex h-full flex-col overflow-hidden rounded-lg border border-line bg-card"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-beige">
        {imageFailed ? (
          <div className="grid h-full place-items-center">
            <Gift className="h-7 w-7 text-bronze/70" aria-hidden="true" />
          </div>
        ) : (
          <Image
            src={gift.image}
            alt={gift.name}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.6875rem] font-medium tracking-[0.22em] text-bronze uppercase">
            {GIFT_CATEGORY_LABELS[gift.category]}
          </p>
          <p className="font-serif text-[0.9375rem] text-burgundy">
            {item.matchScore}
            <span className="ml-0.5 text-[0.6875rem] font-medium tracking-[0.1em] text-muted uppercase">
              match
            </span>
          </p>
        </div>

        <h3 className="mt-3 font-serif text-xl leading-snug tracking-[-0.01em] text-charcoal">
          {gift.name}
        </h3>
        <p className="mt-1.5 text-sm font-medium text-charcoal">
          {gift.priceLabel}
          <span className="ml-2 font-normal text-muted">· about ${gift.price}</span>
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {gift.description}
        </p>

        <div className="mt-5 flex-1 border-t border-line-soft pt-4">
          <p className="text-[0.6875rem] font-medium tracking-[0.22em] text-faint uppercase">
            Why it&rsquo;s a match
          </p>
          <p className="mt-2 font-serif text-[0.9375rem] leading-snug text-charcoal-2 italic">
            {item.reason}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onView(item)}
          aria-label={`View details for ${gift.name}`}
          className="group mt-5 inline-flex w-fit items-center gap-2 border-b border-transparent pb-0.5 text-sm font-medium text-burgundy transition-colors duration-300 hover:border-burgundy/50"
        >
          View gift
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </button>
      </div>
    </article>
  );
}
