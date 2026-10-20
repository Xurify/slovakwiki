import type { Transcript } from "$lib/level-test/server/transcribe";
import type {
  AiScore,
  LevelTestBank,
  ProductionKind,
  ScoringCapabilities,
} from "$lib/level-test/types";

const NO_CAPABILITIES: ScoringCapabilities = { scoring: false, transcription: false };

/** A static preview has no functions; treat any failure as "nothing switched on". */
export async function fetchCapabilities(): Promise<ScoringCapabilities> {
  try {
    const response = await fetch("/api/level-test/status");
    if (!response.ok) return NO_CAPABILITIES;
    const body = (await response.json()) as Partial<ScoringCapabilities>;
    return { scoring: body.scoring === true, transcription: body.transcription === true };
  } catch {
    return NO_CAPABILITIES;
  }
}

export async function fetchBank(): Promise<LevelTestBank> {
  const response = await fetch("/level-test/bank.json");
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
  const response = await fetch("/api/level-test/score", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Scoring failed (${response.status})`);
  return (await response.json()) as AiScore;
}

export async function requestTranscript(audio: Blob): Promise<Transcript> {
  const form = new FormData();
  form.append("audio", audio, "answer");
  const response = await fetch("/api/level-test/transcribe", {
    method: "POST",
    body: form,
  });
  if (!response.ok) throw new Error(`Speech-to-text failed (${response.status})`);
  return (await response.json()) as Transcript;
}
