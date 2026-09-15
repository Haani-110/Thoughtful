/**
 * Client-side persistence for questionnaire answers (sessionStorage).
 *
 * Lets the results page read the brief, the finder re-open with answers
 * pre-populated ("Change preferences"), and "Start over" begin cleanly.
 */

import type { GiftAnswers } from "@/components/finder/finder-data";

export const ANSWERS_KEY = "thoughtful:gift-answers";

export function readAnswers(): GiftAnswers | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(ANSWERS_KEY);
    const candidate = raw ? (JSON.parse(raw) as Partial<GiftAnswers>) : null;
    if (
      !candidate ||
      typeof candidate.recipient !== "string" ||
      !Array.isArray(candidate.interests)
    ) {
      return null;
    }
    return {
      recipient: candidate.recipient,
      occasion: candidate.occasion ?? null,
      interests: candidate.interests.filter((i) => typeof i === "string"),
      budget: candidate.budget ?? null,
      customBudget: candidate.customBudget ?? "",
      giftType: candidate.giftType ?? null,
      detail: typeof candidate.detail === "string" ? candidate.detail : "",
    };
  } catch {
    return null;
  }
}

export function writeAnswers(answers: GiftAnswers): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
  } catch {
    /* storage unavailable — answers simply won't persist */
  }
}

export function clearAnswers(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(ANSWERS_KEY);
  } catch {
    /* ignore */
  }
}
