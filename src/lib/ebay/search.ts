/**
 * eBay Browse API — `item_summary/search`, server-side only.
 *
 * Builds a gift query from the questionnaire's structured answers (the same
 * answers the API route already validated) and returns real, normalized
 * listings from the official eBay API.
 *
 * Failure contract: every failure mode — missing credentials, OAuth failure,
 * network error, timeout, non-2xx response, empty or malformed payload —
 * results in an empty array. This module never throws, so the recommendation
 * engine can continue with the local catalog on its own.
 */

import {
  GIFT_TYPE_OPTIONS,
  OCCASION_OPTIONS,
  type GiftAnswers,
} from "@/components/finder/finder-data";
import { getEbayAccessToken } from "./auth";
import { normalizeEbayListing, type EbayListing } from "./normalize";

const SEARCH_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search";
const SEARCH_TIMEOUT_MS = 12_000;
const REQUEST_LIMIT = 10;
const MAX_QUERY_CHARS = 120;

/**
 * Build the search query from structured questionnaire answers only —
 * free-text detail never reaches the API.
 * Example: "coffee birthday gift practical".
 */
export function buildGiftQuery(answers: GiftAnswers): string {
  const words: string[] = [];

  const interest = answers.interests[0]?.replace(/[&]/g, "").trim();
  if (interest) words.push(interest.toLowerCase());

  const occasionId =
    answers.occasion && answers.occasion !== "other"
      ? (answers.occasion as string)
      : null;
  const occasion = occasionId
    ? OCCASION_OPTIONS.find((o) => o.id === occasionId)?.label
    : null;
  // "Just because" reads unnaturally in a product search — skip it.
  if (occasion && occasion.toLowerCase() !== "just because") {
    words.push(`${occasion.toLowerCase()} gift`);
  }

  const styleId =
    answers.giftType && answers.giftType !== "surprise"
      ? (answers.giftType as string)
      : null;
  const style = styleId
    ? GIFT_TYPE_OPTIONS.find((o) => o.id === styleId)?.label
    : null;
  if (style) words.push(style.toLowerCase());

  if (words.length === 0) return "";
  if (!words.some((w) => w.includes("gift"))) words.push("gift");

  return words.join(" ").slice(0, MAX_QUERY_CHARS);
}

interface SearchPayload {
  items?: unknown;
}

/**
 * Search live eBay listings for the brief. Always resolves — an empty
 * array means "no usable eBay data, continue with the catalog".
 */
export async function searchEbayGiftListings(
  answers: GiftAnswers,
): Promise<EbayListing[]> {
  const query = buildGiftQuery(answers);
  if (!query) return [];

  let token: string;
  try {
    token = await getEbayAccessToken();
  } catch {
    return [];
  }

  const params = new URLSearchParams({
    q: query,
    limit: String(REQUEST_LIMIT),
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${SEARCH_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) return [];

  const payload = (await response.json().catch(() => null)) as
    | SearchPayload
    | null;
  if (!payload || !Array.isArray(payload.items)) return [];

  const listings: EbayListing[] = [];
  for (const raw of payload.items) {
    const listing = normalizeEbayListing(raw);
    if (listing) listings.push(listing);
  }
  return listings;
}
