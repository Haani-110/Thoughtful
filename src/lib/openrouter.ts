/**
 * Server-side OpenRouter client.
 *
 * The API key lives in OPENROUTER_API_KEY and is only ever read here —
 * this module must never be imported from client components.
 */

export interface ChatMessage {
  role: "system" | "user";
  content: string;
}

/* ------------------------------------------------------------------ */
/*  Model configuration — the single place the model name lives        */
/* ------------------------------------------------------------------ */

export const OPENROUTER_MODEL = "openrouter/free";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_OUTPUT_TOKENS = 1_400;

/* ------------------------------------------------------------------ */
/*  Result type                                                        */
/* ------------------------------------------------------------------ */

export type OpenRouterCompletion =
  | { ok: true; content: string }
  | {
      ok: false;
      error:
        | "missing-key"
        | "timeout"
        | "http-error"
        | "bad-payload"
        | "network";
    };

/* ------------------------------------------------------------------ */
/*  Low-level request helper                                           */
/* ------------------------------------------------------------------ */

async function postCompletion(
  apiKey: string,
  messages: ChatMessage[],
  useJsonMode: boolean,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://thoughtful.gifts",
        "X-Title": "Thoughtful",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        temperature: 0.4,
        max_tokens: MAX_OUTPUT_TOKENS,
        // JSON mode where the routed model supports it; we always
        // validate the payload ourselves regardless.
        ...(useJsonMode
          ? { response_format: { type: "json_object" } }
          : {}),
      }),
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Run one chat completion against OpenRouter.
 * Never throws — every failure mode is reported as a typed result so
 * callers can fall back to deterministic recommendations.
 */
export async function createCompletion(
  messages: ChatMessage[],
): Promise<OpenRouterCompletion> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return { ok: false, error: "missing-key" };

  let response: Response;
  try {
    response = await postCompletion(apiKey, messages, true);

    // Some routed models reject response_format — retry once without it.
    if (response.status === 400) {
      response = await postCompletion(apiKey, messages, false);
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, error: "timeout" };
    }
    return { ok: false, error: "network" };
  }

  if (!response.ok) return { ok: false, error: "http-error" };

  try {
    const payload = (await response.json()) as {
      choices?: { message?: { content?: unknown } }[];
    };
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.trim().length === 0) {
      return { ok: false, error: "bad-payload" };
    }
    return { ok: true, content };
  } catch {
    return { ok: false, error: "bad-payload" };
  }
}

/**
 * Lenient JSON extraction: tolerates code fences and stray prose around
 * the object, without ever trusting what it can't parse.
 */
export function extractJsonObject(content: string): unknown | null {
  const cleaned = content
    .replace(/```(?:json)?/gi, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}
