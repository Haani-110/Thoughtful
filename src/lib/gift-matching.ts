/**
 * Thoughtful's deterministic matching layer.
 *
 * Pipeline position:
 *
 *   questionnaire answers
 *     → gift catalog (src/data/gifts.ts)
 *     → deterministic filtering + scoring   ← THIS FILE
 *     → OpenRouter AI ranking               (next stage)
 *     → results
 *
 * Everything here is pure and synchronous. The AI stage later reuses
 * these functions for candidate selection and as its fallback.
 */

import { GIFTS, priceBandFor, type Gift, type PriceBand } from "@/data/gifts";
import type { GiftAnswers } from "@/components/finder/finder-data";
import { BUDGET_CUSTOM_ID } from "@/components/finder/finder-data";

/* ------------------------------------------------------------------ */
/*  Weights — deliberately simple, tuned by hand, easy to change       */
/* ------------------------------------------------------------------ */

export const MATCH_WEIGHTS = {
  /** at least one shared interest — the strongest signal */
  interest: 40,
  /** within the budget the giver set */
  budget: 25,
  /** right for the occasion */
  occasion: 15,
  /** right for the relationship */
  relationship: 10,
  /** matches the kind of gift they had in mind */
  style: 10,
} as const;

export const MAX_MATCH_SCORE = Object.values(MATCH_WEIGHTS).reduce(
  (sum, weight) => sum + weight,
  0,
);

/* ------------------------------------------------------------------ */
/*  Budget                                                             */
/* ------------------------------------------------------------------ */

export type BudgetBandId = Exclude<PriceBand, "250-plus">;

const BUDGET_CAPS: Record<BudgetBandId, number> = {
  "under-25": 25,
  "25-50": 50,
  "50-100": 100,
  "100-250": 250,
};

/**
 * Resolve the questionnaire budget answer to a spending ceiling.
 * Returns Infinity when no budget was chosen.
 */
export function budgetCapFor(
  budget: string | null,
  customBudget?: string,
): number {
  if (!budget) return Infinity;
  if (budget === BUDGET_CUSTOM_ID) {
    const custom = Number(customBudget);
    return Number.isFinite(custom) && custom > 0 ? custom : Infinity;
  }
  return BUDGET_CAPS[budget as BudgetBandId] ?? Infinity;
}

/* ------------------------------------------------------------------ */
/*  Filters — each returns a new array, never mutates                  */
/* ------------------------------------------------------------------ */

export function filterByBudget(
  gifts: Gift[],
  budget: string | null,
  customBudget?: string,
): Gift[] {
  const cap = budgetCapFor(budget, customBudget);
  if (cap === Infinity) return [...gifts];
  return gifts.filter((gift) => gift.price <= cap);
}

export function filterByInterests(gifts: Gift[], interests: string[]): Gift[] {
  if (interests.length === 0) return [...gifts];
  return gifts.filter((gift) =>
    gift.interests.some((interest) => interests.includes(interest)),
  );
}

/** "other" (or unset) occasions are neutral — everything passes. */
export function filterByOccasion(
  gifts: Gift[],
  occasion: string | null,
): Gift[] {
  if (!occasion || occasion === "other") return [...gifts];
  return gifts.filter((gift) =>
    gift.occasions.includes(occasion as Gift["occasions"][number]),
  );
}

/** "other" (or unset) relationships are neutral — everything passes. */
export function filterByRelationship(
  gifts: Gift[],
  relationship: string | null,
): Gift[] {
  if (!relationship || relationship === "other") return [...gifts];
  return gifts.filter((gift) =>
    gift.relationships.includes(
      relationship as Gift["relationships"][number],
    ),
  );
}

/** "surprise" defers to taste — everything passes. */
export function filterByStyle(gifts: Gift[], style: string | null): Gift[] {
  if (!style || style === "surprise") return [...gifts];
  return gifts.filter((gift) =>
    gift.styles.includes(style as Gift["styles"][number]),
  );
}

/* ------------------------------------------------------------------ */
/*  Scoring                                                            */
/* ------------------------------------------------------------------ */

export interface MatchBreakdown {
  interest: number;
  budget: number;
  occasion: number;
  relationship: number;
  style: number;
  /** sum of the parts, 0–100 */
  total: number;
}

export interface ScoredGift {
  gift: Gift;
  score: MatchBreakdown;
}

/**
 * Score one gift against a questionnaire answer set.
 * Flat weights on purpose: easy to read, easy to re-balance later.
 */
export function scoreGift(gift: Gift, answers: GiftAnswers): MatchBreakdown {
  const interest =
    answers.interests.length > 0 &&
    gift.interests.some((i) => answers.interests.includes(i))
      ? MATCH_WEIGHTS.interest
      : 0;

  const budget =
    gift.price <= budgetCapFor(answers.budget, answers.customBudget)
      ? MATCH_WEIGHTS.budget
      : 0;

  const occasion =
    !answers.occasion || answers.occasion === "other"
      ? Math.round(MATCH_WEIGHTS.occasion / 2)
      : gift.occasions.includes(
            answers.occasion as Gift["occasions"][number],
          )
        ? MATCH_WEIGHTS.occasion
        : 0;

  const relationship =
    !answers.recipient || answers.recipient === "other"
      ? Math.round(MATCH_WEIGHTS.relationship / 2)
      : gift.relationships.includes(
            answers.recipient as Gift["relationships"][number],
          )
        ? MATCH_WEIGHTS.relationship
        : 0;

  const style =
    !answers.giftType || answers.giftType === "surprise"
      ? Math.round(MATCH_WEIGHTS.style / 2)
      : gift.styles.includes(answers.giftType as Gift["styles"][number])
        ? MATCH_WEIGHTS.style
        : 0;

  return {
    interest,
    budget,
    occasion,
    relationship,
    style,
    total: interest + budget + occasion + relationship + style,
  };
}

/* ------------------------------------------------------------------ */
/*  Ranking                                                            */
/* ------------------------------------------------------------------ */

/** Score every gift and sort: score desc, then price asc, then name. */
export function rankGifts(
  gifts: Gift[],
  answers: GiftAnswers,
): ScoredGift[] {
  return gifts
    .map((gift) => ({ gift, score: scoreGift(gift, answers) }))
    .sort(
      (a, b) =>
        b.score.total - a.score.total ||
        a.gift.price - b.gift.price ||
        a.gift.name.localeCompare(b.gift.name),
    );
}

export interface RecommendationResult {
  items: ScoredGift[];
  /**
   * True when the budget filter had to be relaxed to keep enough
   * candidates — surfaced as a gentle note, never silently.
   */
  relaxedBudget: boolean;
  /** how many gifts the hard budget filter kept before scoring */
  withinBudget: number;
}

const MIN_BUDGET_CANDIDATES = 6;

/* ------------------------------------------------------------------ */
/*  Candidate pool — the ONE way candidates are selected               */
/*                                                                     */
/*  Both the AI stage and the deterministic fallback draw from this   */
/*  exact pool, so their behaviour can never drift apart:              */
/*  hard-budget filter → graceful relaxation → deterministic ranking.  */
/* ------------------------------------------------------------------ */

export interface CandidatePool {
  /** deterministically ranked (score desc, price asc, name asc) */
  pool: ScoredGift[];
  relaxedBudget: boolean;
  /** gifts surviving the hard budget filter before relaxation */
  withinBudget: number;
}

/**
 * Select and rank the candidate pool for a brief.
 * - Respects the budget whenever it yields enough candidates.
 * - If the exact budget is too narrow, gracefully widens to the whole
 *   catalog — budget keeps its large scoring weight, so affordable
 *   picks still rank first. Never returns an empty pool while the
 *   catalog itself is non-empty.
 */
export function selectCandidatePool(
  answers: GiftAnswers,
  minimum = MIN_BUDGET_CANDIDATES,
): CandidatePool {
  const withinBudget = filterByBudget(
    GIFTS,
    answers.budget,
    answers.customBudget,
  );
  const relaxedBudget = withinBudget.length < minimum;
  const base = relaxedBudget ? GIFTS : withinBudget;

  return {
    pool: rankGifts(base, answers),
    relaxedBudget,
    withinBudget: withinBudget.length,
  };
}

/** The deterministic shortlist used before the AI stage existed. */
export function getRecommendations(
  answers: GiftAnswers,
  limit = 9,
): RecommendationResult {
  const { pool, relaxedBudget, withinBudget } = selectCandidatePool(answers);
  return { items: pool.slice(0, limit), relaxedBudget, withinBudget };
}

/* ------------------------------------------------------------------ */
/*  Small display helpers                                              */
/* ------------------------------------------------------------------ */

export function matchPercentage(score: MatchBreakdown): number {
  return Math.round((score.total / MAX_MATCH_SCORE) * 100);
}

export { priceBandFor };
