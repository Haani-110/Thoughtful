"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Gift } from "lucide-react";
import { GIFT_CATEGORY_LABELS } from "@/data/gifts";
import type { RecommendationItem } from "@/lib/recommendations";

/**
 * The single strongest recommendation — an editorial hero layout,
 * with the match score as quiet typography rather than a badge.
 */
export function PerfectPick({
  item,
  onView,
}: {
  item: RecommendationItem;
  onView: (item: RecommendationItem) => void;
}) {
  const { product } = item;
  const isEbay = product.source === "ebay";
  const eyebrow = isEbay
    ? "eBay"
    : product.category
      ? GIFT_CATEGORY_LABELS[product.category]
      : null;
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="step-enter grid overflow-hidden rounded-lg border border-line bg-card lg:grid-cols-2">
      <div className="relative aspect-[4/3] overflow-hidden bg-beige lg:aspect-auto lg:min-h-[460px]">
        {imageFailed ? (
          <div className="grid h-full min-h-[18rem] place-items-center">
            <Gift className="h-9 w-9 text-bronze/70" aria-hidden="true" />
          </div>
        ) : (
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <div className="flex flex-col p-6 sm:p-9 lg:p-12">
        <div className="flex items-start justify-between gap-6">
          <p className="eyebrow flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-6 bg-champagne" />
            Perfect match
          </p>
          <p className="text-right leading-none">
            <span className="font-serif text-4xl text-burgundy lg:text-[2.75rem]">
              {item.matchScore}
              <span className="text-[0.6em]">%</span>
            </span>
            <span className="mt-2 block text-[0.6875rem] font-medium tracking-[0.22em] text-faint uppercase">
              match
            </span>
          </p>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted">
          Our strongest pick based on everything you told us.
        </p>

        <h3 className="mt-6 font-serif text-[1.75rem] leading-snug tracking-[-0.01em] text-charcoal lg:text-[2.2rem]">
          {product.name}
        </h3>
        <p className="mt-2">
          <span className="mr-3 rounded-full border border-line bg-beige px-3 py-1 text-[0.6875rem] font-medium tracking-[0.16em] text-charcoal-2 uppercase">
            {eyebrow}
          </span>
          <span className="text-sm font-medium text-charcoal">
            {product.priceLabel}
            {!isEbay ? (
              <span className="ml-2 font-normal text-muted">
                · about ${product.price}
              </span>
            ) : null}
          </span>
        </p>

        {product.description ? (
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-muted">
            {product.description}
          </p>
        ) : null}

        <blockquote className="mt-7 border-l-2 border-champagne pl-5">
          <p className="text-[0.6875rem] font-medium tracking-[0.22em] text-faint uppercase">
            Why it&rsquo;s a match
          </p>
          <p className="mt-2 font-serif text-lg leading-snug text-charcoal-2 italic">
            {item.reason}
          </p>
        </blockquote>

        <div className="mt-auto pt-9">
          {isEbay && product.itemUrl ? (
            <a
              href={product.itemUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Shop ${product.name} on eBay`}
              className="group inline-flex items-center justify-center gap-3 rounded-[2px] bg-burgundy px-7 py-4 text-[0.6875rem] font-medium tracking-[0.22em] text-cream uppercase transition-all duration-300 hover:-translate-y-px hover:bg-burgundy-2 active:bg-burgundy-3"
            >
              Shop on eBay
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </a>
          ) : (
            <button
              type="button"
              onClick={() => onView(item)}
              aria-label={`View details for ${product.name}`}
              className="group inline-flex items-center justify-center gap-3 rounded-[2px] bg-burgundy px-7 py-4 text-[0.6875rem] font-medium tracking-[0.22em] text-cream uppercase transition-all duration-300 hover:-translate-y-px hover:bg-burgundy-2 active:bg-burgundy-3"
            >
              View this gift
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
