/**
 * eBay OAuth — client credentials flow, server-side only.
 *
 * Credentials come from EBAY_CLIENT_ID / EBAY_CLIENT_SECRET and are read
 * only in this module — it must never be imported from client components.
 * Application access tokens are cached in memory and refreshed proactively
 * just before expiry. The token is never logged under any circumstance.
 */

const TOKEN_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const SCOPE = "https://api.ebay.com/oauth/api_scope";
const TOKEN_TIMEOUT_MS = 10_000;
/** Refresh at least this long before the actual expiry. */
const EXPIRY_BUFFER_MS = 60_000;

let cachedToken: { accessToken: string; expiresAt: number } | null = null;
let inflight: Promise<string> | null = null;

interface TokenPayload {
  access_token?: unknown;
  expires_in?: unknown;
}

async function requestToken(): Promise<string> {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("ebay-auth-missing-credentials");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TOKEN_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: `grant_type=client_credentials&scope=${encodeURIComponent(SCOPE)}`,
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    // Deliberately opaque — the response body may echo credentials.
    throw new Error(`ebay-auth-http-error:${response.status}`);
  }

  const payload = (await response.json().catch(() => null)) as
    | TokenPayload
    | null;
  const accessToken = payload?.access_token;
  if (typeof accessToken !== "string" || accessToken.length === 0) {
    throw new Error("ebay-auth-bad-payload");
  }

  const expiresIn =
    typeof payload?.expires_in === "number" && Number.isFinite(payload.expires_in)
      ? Math.max(0, payload.expires_in)
      : 3_600;
  cachedToken = {
    accessToken,
    expiresAt: Date.now() + expiresIn * 1_000,
  };
  return accessToken;
}

/**
 * Return a valid application access token, requesting (and caching) one if
 * needed. Concurrency-safe: parallel callers share one in-flight request.
 * Throws a typed error on any failure — callers convert that to a fallback.
 */
export function getEbayAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt - EXPIRY_BUFFER_MS > Date.now()) {
    return Promise.resolve(cachedToken.accessToken);
  }
  if (!inflight) {
    inflight = requestToken().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}
