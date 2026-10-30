import type { Transcript } from "$lib/level-test/server/transcribe";
import type {
  AiScore,
  LevelTestBank,
  ProductionKind,
  ScoringCapabilities,
} from "$lib/level-test/types";

const NO_CAPABILITIES: ScoringCapabilities = { scoring: false, transcription: false };

/** Scoring a long answer can take a while; past this the request is dead. */
const REQUEST_TIMEOUT_MS = 60_000;
/** Start waits for this one, so a slow status check must not hold it up. */
const STATUS_TIMEOUT_MS = 10_000;
/** Rate limits and a cold or restarting function usually clear within a second or two. */
const RETRY_STATUSES = new Set([429, 502, 503]);
const RETRY_DELAY_MS = 1500;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Posts once more after a short pause when the first try hit a passing failure. */
async function post(url: string, init: RequestInit): Promise<Response> {
  const send = () =>
    fetch(url, {
      ...init,
      method: "POST",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  try {
    const response = await send();
    if (!RETRY_STATUSES.has(response.status)) return response;
  } catch (error) {
    // fetch rejects with a TypeError when the network drops; a timeout is not retried.
    if (!(error instanceof TypeError)) throw error;
  }
  await wait(RETRY_DELAY_MS);
  return send();
}

/** A static preview has no functions; treat any failure as "nothing switched on". */
export async function fetchCapabilities(): Promise<ScoringCapabilities> {
  try {
    const response = await fetch("/api/level-test/status", {
      signal: AbortSignal.timeout(STATUS_TIMEOUT_MS),
    });
    if (!response.ok) return NO_CAPABILITIES;
    const body = (await response.json()) as Partial<ScoringCapabilities>;
    return { scoring: body.scoring === true, transcription: body.transcription === true };
  } catch {
    return NO_CAPABILITIES;
  }
}

export async function fetchBank(): Promise<LevelTestBank> {
  const response = await fetch("/level-test/bank.json", {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Could not load the test (${response.status})`);
  return (await response.json()) as LevelTestBank;
}

export interface ScoreBody {
  kind: ProductionKind;
  prompt: string;
  response: string;
  durationSeconds?: number;
  contentKey?: string[];
  imageUrl?: string;
}

export async function requestScore(body: ScoreBody): Promise<AiScore> {
  const response = await post("/api/level-test/score", {
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Scoring failed (${response.status})`);
  return (await response.json()) as AiScore;
}

export async function requestTranscript(audio: Blob): Promise<Transcript> {
  const form = new FormData();
  form.append("audio", audio, "answer");
  const response = await post("/api/level-test/transcribe", {
    body: form,
  });
  if (!response.ok) throw new Error(`Speech-to-text failed (${response.status})`);
  return (await response.json()) as Transcript;
}
