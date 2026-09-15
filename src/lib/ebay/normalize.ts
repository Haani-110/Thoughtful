/**
 * Normalisation of eBay Browse API item summaries into a safe internal
 * representation.
 *
 * Every field is strictly validated: an entry that fails validation is
 * discarded entirely, and nothing is ever fabricated. Data the API did not
 * provide (description, category, condition) stays null — never invented.
 * This module is pure (no network, no env access) and safe to reuse.
 */

export interface EbayListing {
  source: "ebay";
  /** eBay item ID exactly as returned by the API. */
  itemId: string;
  /** Listing title exactly as listed on eBay. */
  title: string;
  /** Numeric listing price in `currency`. */
  price: number;
  /** ISO-4217 currency code (e.g. "USD" for the eBay US marketplace). */
  currency: string;
  /** Primary listing image — https, eBay image CDNs only. */
  image: string;
  /** Listing page on ebay.com — https, eBay hostnames only. */
  url: string;
  /** Real eBay category name when the API provides one. */
  categoryName: string | null;
  /** Plain-text description extracted from the API payload, when present. */
  description: string | null;
  /** Listing condition (e.g. "New") when the API provides one. */
  condition: string | null;
}

const ITEM_ID_PATTERN = /^[A-Za-z0-9]{6,32}$/;
/** Item pages may only point at eBay's own https hosts. */
const ITEM_URL_HOST_PATTERN = /^www\.ebay\.[a-z]{2,3}(\.[a-z]{2})?$/;
const IMAGE_HOSTS = new Set(["i.ebayimg.com", "i.img.com"]);

const TITLE_MIN_CHARS = 3;
const TITLE_MAX_CHARS = 200;
const DESCRIPTION_MAX_CHARS = 240;
const PRICE_MAX = 1_000_000;

function isAllowedImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && IMAGE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

function isAllowedItemUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ITEM_URL_HOST_PATTERN.test(url.hostname);
  } catch {
    return false;
  }
}

/** Strip HTML tags and common entities from eBay's description field. */
function toPlainText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length === 0) return null;
  return text.slice(0, DESCRIPTION_MAX_CHARS);
}

/** Bounded string label; null when missing or unreasonable. */
function asLabel(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= 80 ? trimmed : null;
}

/**
 * Normalize one raw item from `item_summary/search`.
 * Returns null for anything malformed — callers simply skip it.
 */
export function normalizeEbayListing(raw: unknown): EbayListing | null {
  if (typeof raw !== "object" || raw === null) return null;
  const item = raw as Record<string, unknown>;

  const itemId =
    typeof item.itemId === "string" && ITEM_ID_PATTERN.test(item.itemId)
      ? item.itemId
      : null;
  if (!itemId) return null;

  const title =
    typeof item.title === "string"
      ? item.title.replace(/\s+/g, " ").trim()
      : null;
  if (!title || title.length < TITLE_MIN_CHARS || title.length > TITLE_MAX_CHARS) {
    return null;
  }

  const priceField = item.itemPrice as
    | { value?: unknown; currency?: unknown }
    | undefined;
  const rawPrice =
    typeof priceField?.value === "number"
      ? priceField.value
      : typeof priceField?.value === "string"
        ? Number.parseFloat(priceField.value)
        : Number.NaN;
  if (!Number.isFinite(rawPrice) || rawPrice <= 0 || rawPrice > PRICE_MAX) {
    return null;
  }

  const currency =
    typeof priceField?.currency === "string" &&
    /^[A-Za-z]{3}$/.test(priceField.currency)
      ? priceField.currency.toUpperCase()
      : "USD";

  const images = Array.isArray(item.image) ? item.image : [];
  let image: string | null = null;
  for (const candidate of images) {
    const imageUrl =
      typeof candidate === "object" && candidate !== null
        ? (candidate as { imageUrl?: unknown }).imageUrl
        : undefined;
    if (typeof imageUrl === "string" && isAllowedImageUrl(imageUrl)) {
      image = imageUrl;
      break;
    }
  }
  if (!image) return null;

  const url =
    typeof item.itemUrl === "string" && isAllowedItemUrl(item.itemUrl)
      ? item.itemUrl
      : null;
  if (!url) return null;

  const category =
    typeof item.category === "object" && item.category !== null
      ? (item.category as { categoryName?: unknown }).categoryName
      : undefined;

  return {
    source: "ebay",
    itemId,
    title,
    price: rawPrice,
    currency,
    image,
    url,
    categoryName: asLabel(category),
    description: toPlainText(item.itemDescription),
    condition: asLabel(item.condition),
  };
}

/** Display price for a live listing — an exact price, not an estimate. */
export function formatEbayPrice(price: number, currency: string): string {
  const formatted = Number.isInteger(price) ? price.toFixed(0) : price.toFixed(2);
  return currency === "USD" ? `$${formatted}` : `${formatted} ${currency}`;
}
