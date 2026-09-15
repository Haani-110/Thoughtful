/**
 * Thoughtful's recommendation engine.
 *
 * Pipeline: validated answers → ONE shared deterministic candidate pool
 * (src/lib/gift-matching.ts) → OpenRouter ranking → strict validation →
 * blended scoring → grouped recommendations. Every failure path lands on
 * the deterministic fallback built from the SAME pool, so behaviour is
 * consistent and nothing ever comes back empty.
 *
 * Product facts (name, price, image, description) are ALWAYS read back
 * from the local catalog by giftId — never from model output. The AI
 * only contributes: giftId, relevance judgment, pick type, and a reason.
 */

import { GIFTS, type Gift } from "@/data/gifts";
import {
  matchPercentage,
  rankGifts,
  selectCandidatePool,
  type ScoredGift,
} from "@/lib/gift-matching";
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

export interface RecommendationItem {
  gift: Gift;
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
/*  Internal types + knobs                                             */
/* ------------------------------------------------------------------ */

/** Validated item plus its objective deterministic score (for tie-breaks). */
interface ValidatedItem extends RecommendationItem {
  detScore: number;
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
 */
function electPerfectMatch(items: ValidatedItem[]): void {
  if (items.length === 0) return;

  const winner = items.reduce((best, item) => {
    if (item.matchScore !== best.matchScore) {
      return item.matchScore > best.matchScore ? item : best;
    }
    if (item.detScore !== best.detScore) {
      return item.detScore > best.detScore ? item : best;
    }
    if (item.gift.price !== best.gift.price) {
      return item.gift.price < best.gift.price ? item : best;
    }
    return item.gift.name.localeCompare(best.gift.name) < 0 ? item : best;
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
 * - matchScore must be a usable 0–100 number; otherwise the gift is
 *   scored deterministically alone (the item itself survives).
 * - reason is required (clamped); items without one are discarded.
 * - pick must be one of the known values; otherwise it is inferred from
 *   catalog metadata.
 * - the returned product object is ALWAYS the catalog gift, never the
 *   model's words.
 */
export function validateAiItems(
  raw: unknown,
  candidates: ScoredGift[],
): ValidatedItem[] {
  if (typeof raw !== "object" || raw === null) return [];
  const list = (raw as { recommendations?: unknown }).recommendations;
  if (!Array.isArray(list)) return [];

  const byId = new Map(candidates.map((scored) => [scored.gift.id, scored]));
  const seen = new Set<string>();
  const items: ValidatedItem[] = [];

  for (const entry of list as RawPick[]) {
    if (items.length >= AI_MAX_ITEMS) break;
    if (typeof entry !== "object" || entry === null) continue;
    if (typeof entry.giftId !== "string") continue;

    const scored = byId.get(entry.giftId);
    if (!scored || seen.has(scored.gift.id)) continue; // unknown/duplicate id → discard

    const detScore = matchPercentage(scored.score);
    const aiScore = validateAiScore(entry.matchScore);
    const matchScore = blendedScore(detScore, aiScore);

    const reason = cleanReason(entry.reason);
    if (!reason) continue;

    const pick: RecommendationPick = PICKS.includes(
      entry.pick as RecommendationPick,
    )
      ? (entry.pick as RecommendationPick)
      : inferPick(scored.gift);

    seen.add(scored.gift.id);
    items.push({ gift: scored.gift, matchScore, reason, pick, detScore });
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
    gift: scored.gift,
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
  const candidates = pool.slice(0, CANDIDATE_LIMIT);

  try {
    const completion = await createCompletion([
      { role: "system", content: buildSystemPrompt() },
      {
        role: "user",
        content: buildUserPrompt(answers, serializeCandidates(candidates)),
      },
    ]);

    if (completion.ok) {
      const parsed = extractJsonObject(completion.content);
      const validated = validateAiItems(parsed, candidates);

      if (validated.length >= AI_MIN_ITEMS) {
        const items: RecommendationItem[] = validated.map(
          ({ gift, matchScore, reason, pick }) => ({
            gift,
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
