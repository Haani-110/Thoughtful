/**
 * Thoughtful's recommendation engine.
 *
 * Pipeline: validated answers → ONE shared deterministic candidate pool
 * (src/lib/gift-matching.ts) → optional live eBay listings (src/lib/ebay)
 * → OpenRouter ranking over BOTH candidate sets → strict validation →
 * blended scoring → grouped recommendations. Every failure path lands on
 * the deterministic catalog fallback built from the SAME pool, so
 * behaviour is consistent and nothing ever comes back empty.
 *
 * Product facts (name, price, image, description) are ALWAYS read back
 * from the local catalog or the real eBay listing by id — never from
 * model output. The AI only contributes: giftId, relevance judgment,
 * pick type, and a reason.
 */

import { type Gift, type GiftCategory } from "@/data/gifts";
import {
  MATCH_WEIGHTS,
  MAX_MATCH_SCORE,
  budgetCapFor,
  matchPercentage,
  rankGifts,
  selectCandidatePool,
  type ScoredGift,
} from "@/lib/gift-matching";
import {
  formatEbayPrice,
  type EbayListing,
} from "@/lib/ebay/normalize";
import { searchEbayGiftListings } from "@/lib/ebay/search";
import {
  CANDIDATE_LIMIT,
  buildSystemPrompt,
  buildUserPrompt,
  serializeCandidates,
} from "@/lib/ai-prompt";
import { createCompletion, extractJsonObject } from "@/lib/openrouter";
import type { GiftAnswers } from "@/components/finder/finder-data";

/* ------------------------------------------------------------------ */
/*  Public result types (shared with the client over the API)          */
/* ------------------------------------------------------------------ */

export type RecommendationPick =
  | "perfect"
  | "safe"
  | "creative"
  | "personal"
  | "experiences";

/** Where a recommendation's product came from. */
export type RecommendationSource = "catalog" | "ebay";

/**
 * Shared display shape for a catalog gift or a live eBay listing.
 *
 * Catalog entries are mapped 1:1 from the local Gift. eBay entries carry
 * ONLY real data from the eBay API — fields the API did not provide stay
 * null/empty, never fabricated, so no fake metadata is ever introduced.
 */
export interface RecommendationProduct {
  source: RecommendationSource;
  /** Unique id — catalog slug or "ebay-<itemId>". */
  id: string;
  name: string;
  image: string;
  /** Numeric price — catalog: USD estimate, eBay: live listing price. */
  price: number;
  /** ISO-4217 code ("USD" for the catalog). */
  currency: string;
  /** Display price — catalog band label ("$25–50") or exact listing price. */
  priceLabel: string;
  /** One line of product truth; null only for eBay listings without one. */
  description: string | null;
  /** Curated category — null for eBay listings. */
  category: GiftCategory | null;
  /** Curated metadata — empty for eBay listings. */
  interests: string[];
  occasions: string[];
  styles: string[];
  /** The real eBay item page — null for catalog gifts. */
  itemUrl: string | null;
}

export interface RecommendationItem {
  product: RecommendationProduct;
  matchScore: number;
  reason: string;
  pick: RecommendationPick;
}

export interface RecommendationGroups {
  perfect: RecommendationItem | null;
  safe: RecommendationItem[];
  creative: RecommendationItem[];
  personal: RecommendationItem[];
  experiences: RecommendationItem[];
}

export interface RecommendationsPayload {
  source: "ai" | "fallback";
  summary: string | null;
  groups: RecommendationGroups;
  totalCount: number;
}

/* ------------------------------------------------------------------ */
/*  Product adapters — the only place Gift / EbayListing become the    */
/*  shared recommendation shape                                        */
/* ------------------------------------------------------------------ */

/** Map a curated catalog gift 1:1 — no field is lost or altered. */
export function toCatalogProduct(gift: Gift): RecommendationProduct {
  return {
    source: "catalog",
    id: gift.id,
    name: gift.name,
    image: gift.image,
    price: gift.price,
    currency: "USD",
    priceLabel: gift.priceLabel,
    description: gift.description,
    category: gift.category,
    interests: gift.interests,
    occasions: gift.occasions,
    styles: gift.styles,
    itemUrl: null,
  };
}

/** Map a real eBay listing — only API data, nothing invented. */
function toEbayProduct(listing: EbayListing): RecommendationProduct {
  return {
    source: "ebay",
    id: `ebay-${listing.itemId}`,
    name: listing.title,
    image: listing.image,
    price: listing.price,
    currency: listing.currency,
    priceLabel: formatEbayPrice(listing.price, listing.currency),
    description: listing.description,
    category: null,
    interests: [],
    occasions: [],
    styles: [],
    itemUrl: listing.url,
  };
}

/* ------------------------------------------------------------------ */
/*  Internal types + knobs                                             */
/* ------------------------------------------------------------------ */

/** Validated item plus its objective deterministic score (for tie-breaks). */
interface ValidatedItem extends RecommendationItem {
  detScore: number;
}

/**
 * One candidate for the AI stage, from either source. The model is shown
 * the serialized form of these entries and may only pick from them.
 */
interface CandidateEntry {
  /** Stable id the model must echo back character-for-character. */
  id: string;
  product: RecommendationProduct;
  /** Objective deterministic score 0–100 (for blending and tie-breaks). */
  detScore: number;
  /** Pick used when the model's pick is missing or invalid. */
  fallbackPick: RecommendationPick;
}

function catalogEntry(scored: ScoredGift): CandidateEntry {
  return {
    id: scored.gift.id,
    product: toCatalogProduct(scored.gift),
    detScore: matchPercentage(scored.score),
    fallbackPick: inferPick(scored.gift),
  };
}

/** How many live listings may join the AI stage. */
const EBAY_CANDIDATE_LIMIT = 6;

/**
 * eBay listings have no curated metadata, so the ONLY component of the
 * deterministic score they can honestly earn is the budget fit — the same
 * 25/100 the catalog scoring gives a gift within budget.
 */
const EBAY_DETERMINISTIC_PERCENT = Math.round(
  (MATCH_WEIGHTS.budget / MAX_MATCH_SCORE) * 100,
);

/**
 * Narrow the raw search results to the listings that take part in this
 * brief: same-currency budget fit (an open budget keeps everything),
 * capped at EBAY_CANDIDATE_LIMIT.
 */
function selectEbayCandidates(
  listings: EbayListing[],
  answers: GiftAnswers,
): EbayListing[] {
  const cap = budgetCapFor(answers.budget, answers.customBudget);
  return listings
    .filter((listing) => listing.currency === "USD" && listing.price <= cap)
    .slice(0, EBAY_CANDIDATE_LIMIT);
}

/**
 * Hard ceiling on how long a request may WAIT on the live-eBay stage.
 *
 * The eBay layer bounds its own hops (OAuth token, search), but those
 * bounds run in series with each other and in front of the AI stage, so a
 * slow or stalling eBay API could stack tens of seconds ahead of every
 * request before ranking even started. The search module's documented
 * contract is that any failure resolves to an empty list and the curated
 * catalog carries on — this enforces that promise at the orchestration
 * layer too: listings not in by then are simply skipped for this request.
 * The search itself is never cancelled mid-flight; its result is just no
 * longer awaited, so behaviour and product data stay identical either way.
 */
const EBAY_STAGE_WAIT_MS = 4_000;

/**
 * Race the live-eBay search against the stage budget. Never rejects: a
 * failure or a timeout both mean "no usable listings right now" — [].
 */
function waitForEbayListings(answers: GiftAnswers): Promise<EbayListing[]> {
  const search = searchEbayGiftListings(answers).catch(
    () => [] as EbayListing[],
  );
  let timer: ReturnType<typeof setTimeout> | undefined;
  const budget = new Promise<EbayListing[]>((resolve) => {
    timer = setTimeout(() => resolve([]), EBAY_STAGE_WAIT_MS);
  });
  return Promise.race([search, budget]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
}

function ebayEntry(listing: EbayListing): CandidateEntry {
  return {
    id: `ebay-${listing.itemId}`,
    product: toEbayProduct(listing),
    detScore: EBAY_DETERMINISTIC_PERCENT,
    fallbackPick: "safe",
  };
}

const PICKS: RecommendationPick[] = [
  "perfect",
  "safe",
  "creative",
  "personal",
  "experiences",
];

const REASON_MAX_CHARS = 220;
const AI_MIN_ITEMS = 4;
const AI_MAX_ITEMS = 10;

/* ------------------------------------------------------------------ */
/*  Blended final score                                                */
/*                                                                     */
/*  final = round(0.6 × deterministic + 0.4 × ai)                      */
/*                                                                     */
/*  The deterministic catalog score is the objective baseline — it     */
/*  cannot be overridden by the model. The AI's relevance judgment     */
/*  can only nudge it within 40 points. If the AI gives no usable      */
/*  score for a gift, the deterministic score stands alone. The result */
/*  is always an integer 0–100 and never depends on AI product data.   */
/* ------------------------------------------------------------------ */

export const SCORE_WEIGHT_DETERMINISTIC = 0.6;
export const SCORE_WEIGHT_AI = 0.4;

export function blendedScore(
  deterministicPercent: number,
  aiScore: number | null,
): number {
  const ai = aiScore ?? deterministicPercent;
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        SCORE_WEIGHT_DETERMINISTIC * deterministicPercent +
          SCORE_WEIGHT_AI * ai,
      ),
    ),
  );
}

/* ------------------------------------------------------------------ */
/*  AI response validation                                             */
/* ------------------------------------------------------------------ */

interface RawPick {
  giftId?: unknown;
  matchScore?: unknown;
  pick?: unknown;
  reason?: unknown;
}

function inferPick(gift: Gift): RecommendationPick {
  if (gift.category === "experiences") return "experiences";
  if (gift.styles.includes("personalized")) return "personal";
  if (gift.styles.includes("creative") || gift.styles.includes("funny")) {
    return "creative";
  }
  return "safe";
}

/** AI scores outside 0–100 (or missing) become unusable → null. */
function validateAiScore(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value < 0 || value > 100) return null;
  return Math.round(value);
}

function cleanReason(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, REASON_MAX_CHARS);
}

/**
 * The Perfect Match is NEVER taken from the AI's "perfect" label.
 * It is elected from the VALIDATED items: highest blended score wins;
 * ties are broken by the objective deterministic score, then (for full
 * determinism) lower price, then name.
 *
 * Whenever a curated catalog item was validated, only catalog items are
 * eligible — the Perfect Match stays a Thoughtful-curated pick. eBay
 * listings only win in the degenerate case where no catalog item
 * survived validation at all.
 */
function electPerfectMatch(items: ValidatedItem[]): void {
  if (items.length === 0) return;

  const catalogItems = items.filter(
    (item) => item.product.source === "catalog",
  );
  const eligible = catalogItems.length > 0 ? catalogItems : items;

  const winner = eligible.reduce((best, item) => {
    if (item.matchScore !== best.matchScore) {
      return item.matchScore > best.matchScore ? item : best;
    }
    if (item.detScore !== best.detScore) {
      return item.detScore > best.detScore ? item : best;
    }
    if (item.product.price !== best.product.price) {
      return item.product.price < best.product.price ? item : best;
    }
    return item.product.name.localeCompare(best.product.name) < 0 ? item : best;
  });

  for (const item of items) {
    if (item === winner) item.pick = "perfect";
    else if (item.pick === "perfect") item.pick = "safe";
  }
}

/**
 * Validate the model's output against the candidate pool.
 *
 * - giftId must exist in the supplied candidates — anything else is a
 *   hallucination and is discarded.
 * - matchScore must be a usable 0–100 number; otherwise the item is
 *   scored deterministically alone (the item itself survives).
 * - reason is required (clamped); items without one are discarded.
 * - pick must be one of the known values; otherwise it is inferred from
 *   the item's own metadata (catalog) or defaults to "safe" (eBay).
 * - the returned product object is ALWAYS the catalog gift or the real
 *   eBay listing, never the model's words.
 */
export function validateAiItems(
  raw: unknown,
  candidates: CandidateEntry[],
): ValidatedItem[] {
  if (typeof raw !== "object" || raw === null) return [];
  const list = (raw as { recommendations?: unknown }).recommendations;
  if (!Array.isArray(list)) return [];

  const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const seen = new Set<string>();
  const items: ValidatedItem[] = [];

  for (const entry of list as RawPick[]) {
    if (items.length >= AI_MAX_ITEMS) break;
    if (typeof entry !== "object" || entry === null) continue;
    if (typeof entry.giftId !== "string") continue;

    const candidate = byId.get(entry.giftId);
    if (!candidate || seen.has(candidate.id)) continue; // unknown/duplicate id → discard

    const detScore = candidate.detScore;
    const aiScore = validateAiScore(entry.matchScore);
    const matchScore = blendedScore(detScore, aiScore);

    const reason = cleanReason(entry.reason);
    if (!reason) continue;

    const pick: RecommendationPick = PICKS.includes(
      entry.pick as RecommendationPick,
    )
      ? (entry.pick as RecommendationPick)
      : candidate.fallbackPick;

    seen.add(candidate.id);
    items.push({
      product: candidate.product,
      matchScore,
      reason,
      pick,
      detScore,
    });
  }

  electPerfectMatch(items);
  return items;
}

/* ------------------------------------------------------------------ */
/*  Grouping                                                           */
/* ------------------------------------------------------------------ */

function groupItems(items: RecommendationItem[]): RecommendationGroups {
  const groups: RecommendationGroups = {
    perfect: null,
    safe: [],
    creative: [],
    personal: [],
    experiences: [],
  };

  const byScoreDesc = (a: RecommendationItem, b: RecommendationItem) =>
    b.matchScore - a.matchScore;

  for (const item of items) {
    if (item.pick === "perfect" && !groups.perfect) {
      groups.perfect = item;
    } else if (item.pick === "perfect") {
      groups.safe.push({ ...item, pick: "safe" });
    } else {
      groups[item.pick].push(item);
    }
  }

  groups.safe.sort(byScoreDesc);
  groups.creative.sort(byScoreDesc);
  groups.personal.sort(byScoreDesc);
  groups.experiences.sort(byScoreDesc);
  return groups;
}

function countItems(groups: RecommendationGroups): number {
  return (
    (groups.perfect ? 1 : 0) +
    groups.safe.length +
    groups.creative.length +
    groups.personal.length +
    groups.experiences.length
  );
}

/* ------------------------------------------------------------------ */
/*  Deterministic fallback — SAME pool the AI would have seen          */
/* ------------------------------------------------------------------ */

function toFallbackItem(
  scored: ScoredGift,
  pick: RecommendationPick,
): RecommendationItem {
  return {
    product: toCatalogProduct(scored.gift),
    matchScore: matchPercentage(scored.score),
    reason: scored.gift.whyItsGood,
    pick,
  };
}

function buildFallbackPayload(pool: ScoredGift[]): RecommendationsPayload {
  const used = new Set<string>();
  const take = (
    predicate: (scored: ScoredGift) => boolean,
    pick: RecommendationPick,
    max: number,
  ): RecommendationItem[] => {
    const items: RecommendationItem[] = [];
    for (const scored of pool) {
      if (items.length >= max) break;
      if (used.has(scored.gift.id) || !predicate(scored)) continue;
      used.add(scored.gift.id);
      items.push(toFallbackItem(scored, pick));
    }
    return items;
  };

  const perfect = take(() => true, "perfect", 1)[0] ?? null;
  const safe = take(() => true, "safe", 3);
  const creative = take(
    (s) => s.gift.styles.includes("creative") || s.gift.styles.includes("funny"),
    "creative",
    3,
  );
  const personal = take(
    (s) => s.gift.styles.includes("personalized"),
    "personal",
    3,
  );
  const experiences = take(
    (s) => s.gift.category === "experiences",
    "experiences",
    2,
  );

  const groups: RecommendationGroups = {
    perfect,
    safe,
    creative,
    personal,
    experiences,
  };

  return {
    source: "fallback",
    summary: null,
    groups,
    totalCount: countItems(groups),
  };
}

/* ------------------------------------------------------------------ */
/*  The engine                                                         */
/* ------------------------------------------------------------------ */

export async function buildRecommendations(
  answers: GiftAnswers,
): Promise<RecommendationsPayload> {
  // ONE candidate pool, shared by the AI stage and the fallback.
  const { pool } = selectCandidatePool(answers);
  const catalogCandidates = pool.slice(0, CANDIDATE_LIMIT);

  try {
    // Live eBay listings join the AI stage as real candidates. Any
    // failure (missing credentials, OAuth, network, timeout, empty or
    // malformed response) resolves to [] and the engine simply continues
    // with the curated catalog. The whole wait is additionally capped by
    // EBAY_STAGE_WAIT_MS so a stalling eBay API never serialises its own
    // timeouts ahead of the AI stage.
    const ebayCandidates = selectEbayCandidates(
      await waitForEbayListings(answers),
      answers,
    );
    const candidates: CandidateEntry[] = [
      ...catalogCandidates.map(catalogEntry),
      ...ebayCandidates.map(ebayEntry),
    ];

    const completion = await createCompletion([
      { role: "system", content: buildSystemPrompt() },
      {
        role: "user",
        content: buildUserPrompt(
          answers,
          serializeCandidates(catalogCandidates, ebayCandidates),
        ),
      },
    ]);

    if (completion.ok) {
      const parsed = extractJsonObject(completion.content);
      const validated = validateAiItems(parsed, candidates);

      if (validated.length >= AI_MIN_ITEMS) {
        const items: RecommendationItem[] = validated.map(
          ({ product, matchScore, reason, pick }) => ({
            product,
            matchScore,
            reason,
            pick,
          }),
        );
        const groups = groupItems(items);
        const summary =
          typeof (parsed as { summary?: unknown })?.summary === "string"
            ? ((parsed as { summary: string }).summary.trim().slice(0, 200) ||
              null)
            : null;

        return {
          source: "ai",
          summary,
          groups,
          totalCount: countItems(groups),
        };
      }
    }
  } catch {
    // Any AI-stage failure quietly drops to the deterministic fallback.
  }

  return buildFallbackPayload(pool);
}
