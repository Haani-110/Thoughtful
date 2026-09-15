import { createHash } from "crypto";
import { NextResponse } from "next/server";

/**
 * eBay Marketplace Account Deletion — public verification endpoint.
 *
 * GET  : eBay Developer Portal challenge handshake. eBay sends
 *        ?challenge_code=… and expects back the SHA-256 hex of
 *        challengeCode + verificationToken + canonicalEndpoint.
 * POST : account-deletion notifications. Acknowledged immediately —
 *        Thoughtful persists no eBay user data, so there is nothing
 *        to delete and nothing sensitive to log.
 *
 * Both environment values are server-side configuration only and are
 * never exposed to the client.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN_ENV = "EBAY_MARKETPLACE_VERIFICATION_TOKEN";
const ENDPOINT_ENV = "EBAY_MARKETPLACE_NOTIFICATION_ENDPOINT";

/** 32–80 chars of letters, digits, underscore and hyphen only. */
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,80}$/;

const json = (body: Record<string, unknown>, status: number) =>
  NextResponse.json(body, { status });

const serverError = (code: string) =>
  json({ error: `server-misconfiguration:${code}` }, 500);

type Config =
  | { ok: true; token: string; endpoint: string }
  | { ok: false; response: NextResponse };

function readConfig(): Config {
  const token = process.env[TOKEN_ENV];
  const endpoint = process.env[ENDPOINT_ENV];

  if (!token || !endpoint) return { ok: false, response: serverError("missing-env") };
  if (!TOKEN_PATTERN.test(token)) {
    return { ok: false, response: serverError("invalid-verification-token") };
  }

  return { ok: true, token, endpoint };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const challengeCode = searchParams.get("challenge_code");

  if (!challengeCode) {
    return json({ error: "missing-challenge_code" }, 400);
  }

  const config = readConfig();
  if (!config.ok) return config.response;

  /**
   * Order matters and the endpoint value must be the EXACT canonical
   * URL entered in the eBay Developer Portal — no request-derived
   * origin, no localhost, and no query string.
   */
  const challengeResponse = createHash("sha256")
    .update(challengeCode, "utf8")
    .update(config.token, "utf8")
    .update(config.endpoint, "utf8")
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
