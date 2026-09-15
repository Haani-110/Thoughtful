/**
 * Prompt construction for Thoughtful's AI ranking step.
 *
 * Kept separate from the route handler and the OpenRouter client so the
 * brief given to the model is easy to read, review and refine.
 */

import type { ScoredGift } from "@/lib/gift-matching";
import { formatEbayPrice, type EbayListing } from "@/lib/ebay/normalize";
import {
  BUDGET_OPTIONS,
  GIFT_TYPE_OPTIONS,
  OCCASION_OPTIONS,
  RECIPIENT_OPTIONS,
  type GiftAnswers,
} from "@/components/finder/finder-data";

/** Hard ceiling on how many catalog candidates the model ever sees. */
export const CANDIDATE_LIMIT = 18;

/* ------------------------------------------------------------------ */
/*  Labelling — id answers become human language for the model         */
/* ------------------------------------------------------------------ */

function label(
  options: { id: string; label: string }[],
  id: string | null,
): string | null {
  if (!id) return null;
  return options.find((option) => option.id === id)?.label ?? null;
}

function budgetLine(answers: GiftAnswers): string {
  if (!answers.budget) return "No strict budget given — use sensible judgement.";
  if (answers.customBudget && answers.budget === "custom") {
    return `Around $${answers.customBudget}.`;
  }
  const optionLabel = label(BUDGET_OPTIONS, answers.budget);
  return optionLabel ? `${optionLabel}.` : "No strict budget given.";
}

/* ------------------------------------------------------------------ */
/*  Candidate serialisation — compact, model-friendly catalogue slice  */
/* ------------------------------------------------------------------ */

export interface SerializedCandidate {
  giftId: string;
  /** "catalog" = curated Thoughtful gift, "ebay" = live eBay listing. */
  source: "catalog" | "ebay";
  name: string;
  /** Catalog category id, or the real eBay category name. */
  category: string | null;
  price: number;
  currency: string;
  priceLabel: string;
  interests: string[];
  occasions: string[];
  relationships: string[];
  styles: string[];
  description: string | null;
  whyItsGood: string | null;
}

/**
 * Serialize the two candidate sets for the model. eBay entries carry only
 * the real data the API returned — unknown metadata is left empty so the
 * model has nothing to hallucinate from.
 */
export function serializeCandidates(
  catalog: ScoredGift[],
  ebay: EbayListing[] = [],
): SerializedCandidate[] {
  const catalogEntries: SerializedCandidate[] = catalog.map(({ gift }) => ({
    giftId: gift.id,
    source: "catalog",
    name: gift.name,
    category: gift.category,
    price: gift.price,
    currency: "USD",
    priceLabel: gift.priceLabel,
    interests: gift.interests,
    occasions: gift.occasions,
    relationships: gift.relationships,
    styles: gift.styles,
    description: gift.description,
    whyItsGood: gift.whyItsGood,
  }));

  const ebayEntries: SerializedCandidate[] = ebay.map((listing) => ({
    giftId: `ebay-${listing.itemId}`,
    source: "ebay",
    name: listing.title,
    category: listing.categoryName,
    price: listing.price,
    currency: listing.currency,
    priceLabel: formatEbayPrice(listing.price, listing.currency),
    interests: [],
    occasions: [],
    relationships: [],
    styles: [],
    description: listing.description,
    whyItsGood: null,
  }));

  return [...catalogEntries, ...ebayEntries];
}

/* ------------------------------------------------------------------ */
/*  System prompt — the rules the model must live by                   */
/* ------------------------------------------------------------------ */

export function buildSystemPrompt(): string {
  return [
    "You are Thoughtful's gift recommendation assistant. Thoughtful is a warm, editorial gifting service — not a chatbot and not a search engine.",
    "",
    "Your only job: choose and rank items from the candidate catalog provided in the user message.",
    "",
    "STRICT RULES — never break these:",
    "1. Choose ONLY items that appear in the candidate catalog. Never invent products, names, prices, brands, descriptions, URLs or availability.",
    "2. Refer to items exclusively by their exact giftId string, copied character-for-character.",
    "3. Respond with a single valid JSON object and nothing else — no markdown, no code fences, no commentary.",
    "4. Never repeat a giftId.",
    "",
    "SOURCE OF ITEMS:",
    "The candidate catalog mixes two real sources. Entries with source \"catalog\" are Thoughtful's curated gifts. Entries with source \"ebay\" are live listings fetched from eBay's API — their name, price, currency and category are actual eBay data.",
    "Judge eBay entries by the information actually present (title, category, price, description, budget fit). Their interests/occasions/relationships/styles fields are intentionally empty — never assume or invent them, and never invent anything else about an eBay listing (seller, shipping, availability, brand).",
    "",
    "PRIORITIES, in order of importance:",
    "1. The personal detail, when provided — it is the strongest signal you have. Let it reshape your picks.",
    "2. Genuine interest matches.",
    "3. Budget compatibility — never exceed the stated budget ceiling.",
    "4. Occasion relevance.",
    "5. Relationship appropriateness.",
    "6. The requested gift style.",
    "A gift that echoes the personal detail should outrank a generic but popular option.",
    "",
    "OUTPUT JSON SHAPE (exactly this):",
    "{",
    '  "summary": "one warm sentence about the direction you chose, max 140 characters",',
    '  "recommendations": [',
    "    {",
    '      "giftId": "exact-id-from-catalog",',
    '      "matchScore": 94,',
    '      "pick": "perfect",',
    '      "reason": "Why this gift lands for THIS person, max 200 characters."',
    "    }",
    "  ]",
    "}",
    "",
    'The "pick" field must be one of: "perfect" (exactly one — your single strongest choice), "safe" (2–4 reliable fits), "creative" (0–3 unusual or imaginative options), "personal" (0–3 emotionally resonant options), "experiences" (0–2 experience gifts).',
    "Do not force a gift into a category it does not belong to. Return 6–10 recommendations in total.",
    "matchScore is an integer 0–100 reflecting fit for this exact brief.",
    "",
    "VOICE: reasons read like a note from a thoughtful friend — specific, warm, plain-spoken. No exclamation marks, no emojis, no marketing clichés, no web addresses.",
  ].join("\n");
}

/* ------------------------------------------------------------------ */
/*  User prompt — this exact brief                                     */
/* ------------------------------------------------------------------ */

export function buildUserPrompt(
  answers: GiftAnswers,
  candidates: SerializedCandidate[],
): string {
  const lines: string[] = ["THE GIFT BRIEF", ""];

  const recipient = label(RECIPIENT_OPTIONS, answers.recipient);
  lines.push(`Recipient: ${recipient ?? "Someone (relationship unspecified)"}.`);

  const occasion = label(OCCASION_OPTIONS, answers.occasion);
  lines.push(`Occasion: ${occasion ?? "Unspecified"}.`);

  lines.push(
    `Their interests: ${answers.interests.length > 0 ? answers.interests.join(", ") : "Unspecified"}.`,
  );

  lines.push(`Budget: ${budgetLine(answers)}`);

  const style = label(GIFT_TYPE_OPTIONS, answers.giftType);
  lines.push(`Gift style they asked for: ${style ?? "No preference"}.`);

  if (answers.detail.trim()) {
    lines.push("");
    lines.push("PERSONAL DETAIL — treat this as the heart of the brief:");
    lines.push(`"${answers.detail.trim()}"`);
  }

  lines.push("");
  const hasEbay = candidates.some((candidate) => candidate.source === "ebay");
  lines.push(
    hasEbay
      ? "CANDIDATE CATALOG — choose only from these (curated gifts and live eBay listings):"
      : "CANDIDATE CATALOG — choose only from these gifts:",
  );
  lines.push(JSON.stringify(candidates, null, 0));
  lines.push("");
  lines.push(
    "Now rank the strongest gifts for this brief and answer with the JSON object only.",
  );

  return lines.join("\n");
}
