import type { APIRoute } from "astro";
import { getSecret } from "astro:env/server";

import { allowRequest, isSameOrigin, json } from "$lib/level-test/server/guard";
import {
  isPhotoUrl,
  MAX_PROMPT_CHARS,
  MAX_RESPONSE_CHARS,
  ScoringBusyError,
  ScoringRefusedError,
  scoreProduction,
  type ScoreRequest,
} from "$lib/level-test/server/score";
import type { ProductionKind } from "$lib/level-test/types";

export const prerender = false;

/** The largest valid request, all Slovak at two bytes a character, is about 15 KB. */
const MAX_BODY_BYTES = 20_000;

/** The longest summary point in the listening bank is about 180 characters. */
const MAX_CONTENT_KEY_CHARS = 300;

const KINDS: ReadonlySet<ProductionKind> = new Set([
  "summarizeConversation",
  "writePhoto",
  "interactiveWriting",
  "writingSample",
  "speakPhoto",
  "readThenSpeak",
  "speakingSample",
]);

function parseRequest(body: unknown): ScoreRequest | null {
  if (!body || typeof body !== "object") return null;
  const input = body as Record<string, unknown>;
  if (typeof input.kind !== "string" || !KINDS.has(input.kind as ProductionKind))
    return null;
  if (typeof input.prompt !== "string" || typeof input.response !== "string") return null;
  if (
    input.prompt.length > MAX_PROMPT_CHARS ||
    input.response.length > MAX_RESPONSE_CHARS
  ) {
    return null;
  }

  const contentKey = Array.isArray(input.contentKey)
    ? input.contentKey
        .filter((line): line is string => typeof line === "string")
        .slice(0, 8)
    : undefined;
  if (contentKey?.some((line) => line.length > MAX_CONTENT_KEY_CHARS)) return null;
  const durationSeconds =
    typeof input.durationSeconds === "number" && Number.isFinite(input.durationSeconds)
      ? Math.min(600, Math.max(0, input.durationSeconds))
      : undefined;

  const imageUrl =
    typeof input.imageUrl === "string" && isPhotoUrl(input.imageUrl)
      ? input.imageUrl
      : undefined;

  return {
    kind: input.kind as ProductionKind,
    prompt: input.prompt,
    response: input.response,
    contentKey,
    durationSeconds,
    imageUrl,
  };
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const apiKey = getSecret("OPENROUTER_API_KEY");
  if (!apiKey) return json({ error: "AI scoring is not switched on" }, 503);
  if (!isSameOrigin(request)) return json({ error: "Forbidden" }, 403);
  if (!allowRequest(`score:${clientAddress}`))
    return json({ error: "Too many requests" }, 429);

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return json({ error: "Request too large" }, 413);
  const text = await request.text().catch(() => "");
  if (text.length > MAX_BODY_BYTES) return json({ error: "Request too large" }, 413);

  const scoreRequest = parseRequest(parseJson(text));
  if (!scoreRequest) return json({ error: "Bad request" }, 400);

  try {
    const result = await scoreProduction(
      { apiKey, model: getSecret("SCORING_MODEL") || undefined },
      scoreRequest,
    );
    return json(result);
  } catch (error) {
    if (error instanceof ScoringRefusedError)
      return json({ error: "Could not score" }, 422);
    if (error instanceof ScoringBusyError) return json({ error: "Busy" }, 503);
    console.error("level-test score failed", error);
    return json({ error: "Scoring failed" }, 502);
  }
};
