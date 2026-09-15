import { createHash } from "crypto";
import { NextResponse } from "next/server";

/**
 * eBay Marketplace Account Deletion — public verification endpoint.
 *
 * GET  : eBay Developer Portal challenge handshake. eBay sends
 *        ?challenge_code=… and expects back the SHA-256 hex of
 *        challengeCode + verificationToken + endpoint.
 *        The endpoint value is derived from the incoming request URL
 *        (origin + pathname, no query string), so it automatically
 *        matches whatever public URL eBay actually called.
 * POST : account-deletion notifications. Acknowledged immediately —
 *        Thoughtful persists no eBay user data, so there is nothing
 *        to delete and nothing sensitive to log.
 *
 * The verification token is server-side configuration only and is
 * never exposed to the client or logged.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN_ENV = "EBAY_MARKETPLACE_VERIFICATION_TOKEN";

/** 32–80 chars of letters, digits, underscore and hyphen only. */
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,80}$/;

const json = (body: Record<string, unknown>, status: number) =>
  NextResponse.json(body, { status });

const serverError = (code: string) =>
  json({ error: `server-misconfiguration:${code}` }, 500);

type Token =
  | { ok: true; value: string }
  | { ok: false; response: NextResponse };

function readVerificationToken(): Token {
  const token = process.env[TOKEN_ENV];

  if (!token) return { ok: false, response: serverError("missing-env") };
  if (!TOKEN_PATTERN.test(token)) {
    return { ok: false, response: serverError("invalid-verification-token") };
  }

  return { ok: true, value: token };
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const challengeCode = requestUrl.searchParams.get("challenge_code");

  if (!challengeCode) {
    return json({ error: "missing-challenge_code" }, 400);
  }

  const token = readVerificationToken();
  if (!token.ok) return token.response;

  /**
   * Canonical endpoint = origin + pathname of the URL eBay called.
   * Query parameters (including challenge_code) are never included.
   * For the production deployment this resolves to exactly:
   * https://<your-domain>/api/ebay/account-deletion
   */
  const endpoint = requestUrl.origin + requestUrl.pathname;

  const challengeResponse = createHash("sha256")
    .update(challengeCode, "utf8")
    .update(token.value, "utf8")
    .update(endpoint, "utf8")
    .digest("hex");

  return json({ challengeResponse }, 200);
}

export async function POST(request: Request) {
  // Absorb the payload (tolerating empty or invalid bodies) without ever
  // logging it — notifications may contain sensitive eBay user data.
  try {
    await request.json();
  } catch {
    /* intentionally ignored */
  }

  // Acknowledge immediately — no slow work before responding.
  return json({ received: true }, 200);
}
