import { NextResponse } from "next/server";
import { buildRecommendations } from "@/lib/recommendations";
import {
  BUDGET_OPTIONS,
  GIFT_TYPE_OPTIONS,
  INTEREST_OPTIONS,
  OCCASION_OPTIONS,
  RECIPIENT_OPTIONS,
  type GiftAnswers,
} from "@/components/finder/finder-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  Request sanitisation                                               */
/*                                                                     */
/*  The client only ever sends questionnaire answers. Everything else  */
/*  (the catalog, the prompt, the model) stays server-side. Fields are */
/*  whitelisted against the known option sets and length-capped so     */
/*  nothing arbitrary can reach the model.                             */
/* ------------------------------------------------------------------ */

const KNOWN = {
  recipients: new Set(RECIPIENT_OPTIONS.map((o) => o.id)),
  occasions: new Set(OCCASION_OPTIONS.map((o) => o.id)),
  giftTypes: new Set(GIFT_TYPE_OPTIONS.map((o) => o.id)),
  budgets: new Set(BUDGET_OPTIONS.map((o) => o.id)),
  interests: new Set<string>(INTEREST_OPTIONS),
};

const DETAIL_MAX_CHARS = 400;
const INTERESTS_MAX = 15;
const CUSTOM_BUDGET_MAX_DIGITS = 6;

function pickId(raw: unknown, known: Set<string>): string | null {
  return typeof raw === "string" && known.has(raw) ? raw : null;
}

function sanitizeAnswers(body: unknown): GiftAnswers | null {
  if (typeof body !== "object" || body === null) return null;
  const raw = body as Record<string, unknown>;

  const recipient = pickId(raw.recipient, KNOWN.recipients);
  const occasion = pickId(raw.occasion, KNOWN.occasions);
  const giftType = pickId(raw.giftType, KNOWN.giftTypes);
  const budget = pickId(raw.budget, KNOWN.budgets);

  const interests = Array.isArray(raw.interests)
    ? raw.interests
        .filter((i): i is string => typeof i === "string" && KNOWN.interests.has(i))
        .slice(0, INTERESTS_MAX)
    : [];

  const customBudget =
    typeof raw.customBudget === "string"
      ? raw.customBudget.replace(/[^\d]/g, "").slice(0, CUSTOM_BUDGET_MAX_DIGITS)
      : "";

  const detail =
    typeof raw.detail === "string"
      ? raw.detail.trim().slice(0, DETAIL_MAX_CHARS)
      : "";

  // The questionnaire's required questions are minimum signals here too:
  // without a relationship, an occasion and at least one interest there
  // is nothing meaningful to recommend against. Anything less is rejected.
  if (!recipient || !occasion || interests.length === 0) return null;

  return { recipient, occasion, interests, budget, customBudget, giftType, detail };
}

/* ------------------------------------------------------------------ */
/*  POST /api/recommendations                                          */
/* ------------------------------------------------------------------ */

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: "error", message: "invalid-request" },
      { status: 400 },
    );
  }

  const answers = sanitizeAnswers(body);
  if (!answers) {
    return NextResponse.json(
      { status: "error", message: "invalid-request" },
      { status: 400 },
    );
  }

  try {
    const payload = await buildRecommendations(answers);
    return NextResponse.json({ status: "ok", ...payload });
  } catch (error) {
    // Log the message only — never the error object (it may carry
    // request/response details we don't want in server logs).
    console.error(
      "[recommendations] unexpected failure",
      error instanceof Error ? error.message : "unknown error",
    );
    return NextResponse.json(
      { status: "error", message: "recommendations-failed" },
      { status: 500 },
    );
  }
}
