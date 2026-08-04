/**
 * Audio QA judge: dual STT + ending near-miss + Scribe logprob gates.
 *
 * Scribe alone autocorrects mushy endings (mýliu → mýlil). Whisper is noisier
 * but more acoustic. Require both to look sane; fail on last-word disagreement
 * or weak Scribe logprob on the final content word.
 */

import {
  scoreTranscript,
  softFoldSlovak,
  tokenizeFolded,
  editDistance,
} from "./verify-score";
import { transcribeAudio, type SttProvider, type SttResult } from "./stt";

export type JudgeMode = "dual" | "elevenlabs" | "whisper";

export interface JudgeOptions {
  apiKey?: string;
  /** Default dual. */
  mode?: JudgeMode;
  scribeModel?: string;
  whisperModel?: string;
  /** Absolute floor (very weak). Prefer relative gap vs other words. */
  minLastLogprob?: number;
  /** Fail when last-word logprob is this much worse than median of earlier words. */
  logprobGap?: number;
}

export interface JudgeResult {
  ok: boolean;
  reasons: string[];
  score: number;
  scribe?: SttResult;
  whisper?: SttResult;
  scribeScore?: ReturnType<typeof scoreTranscript>;
  whisperScore?: ReturnType<typeof scoreTranscript>;
}

/** Near-miss spellings for final consonants Whisper catches and Scribe fixes. */
export function nearMissEndings(token: string): string[] {
  const t = softFoldSlovak(token);
  if (t.length < 4) return [];
  const miss: string[] = [];
  const last = t.at(-1);
  if (last === "l") {
    miss.push(`${t.slice(0, -1)}u`); // mylil → myliu
    miss.push(t.slice(0, -1)); // truncated
  }
  if (last === "n") miss.push(`${t.slice(0, -1)}m`);
  if (last === "t") miss.push(`${t.slice(0, -1)}d`);
  return [...new Set(miss.filter((m) => m && m !== t))];
}

export function lastContentToken(text: string): string | undefined {
  return [...tokenizeFolded(text)].reverse().find((t) => t.length >= 3);
}

/**
 * True when transcript's best last-word match is closer to a near-miss than to expected.
 * Catches Whisper "mýliu" even if overall token recall is messy.
 */
export function prefersNearMissEnding(expected: string, transcript: string): boolean {
  const expLast = lastContentToken(expected);
  if (!expLast) return false;
  const gotTokens = tokenizeFolded(transcript);
  if (gotTokens.length === 0) return false;

  let best = "";
  let bestDist = Infinity;
  for (const candidate of gotTokens) {
    const dist = editDistance(expLast, candidate);
    if (dist < bestDist) {
      bestDist = dist;
      best = candidate;
    }
  }
  if (!best) return false;

  const distExpected = editDistance(best, expLast);
  for (const miss of nearMissEndings(expLast)) {
    if (editDistance(best, miss) < distExpected) return true;
  }
  return false;
}

/** Soft-folded last content tokens disagree (Scribe vs Whisper). */
export function lastWordDisagreement(a: string, b: string): boolean {
  const left = lastContentToken(a);
  const right = lastContentToken(b);
  if (!left || !right) return false;
  if (left === right) return false;
  // Allow ý/í already folded; still fail if endings differ.
  if (left.slice(0, -1) === right.slice(0, -1) && left.at(-1) !== right.at(-1)) {
    return true;
  }
  return editDistance(left, right) > 1;
}

function contentWordLogprobs(stt: SttResult): number[] {
  const out: number[] = [];
  for (const w of stt.words ?? []) {
    const raw = w.text.replace(/[^\p{L}\p{N}]+/gu, "");
    // Include short function words so last-content gap has a baseline.
    if (raw.length >= 2 && typeof w.logprob === "number") out.push(w.logprob);
  }
  return out;
}

/** Last content word much less confident than the rest of the sentence. */
export function weakLastLogprob(
  stt: SttResult,
  options?: { absoluteFloor?: number; gap?: number },
): boolean {
  const probs = contentWordLogprobs(stt);
  if (probs.length < 2) return false;
  const last = probs[probs.length - 1]!;
  const earlier = probs.slice(0, -1).sort((a, b) => a - b);
  const mid = earlier[Math.floor(earlier.length / 2)]!;
  const absoluteFloor = options?.absoluteFloor ?? -0.5;
  const gap = options?.gap ?? 0.003;
  if (last < absoluteFloor) return true;
  return last < mid - gap;
}

export async function judgeClip(
  expected: string,
  audioPath: string,
  options: JudgeOptions = {},
): Promise<JudgeResult> {
  const mode = options.mode ?? "dual";
  const reasons: string[] = [];
  let score = 1;

  let scribe: SttResult | undefined;
  let whisper: SttResult | undefined;

  if (mode === "dual" || mode === "elevenlabs") {
    scribe = await transcribeAudio(audioPath, {
      apiKey: options.apiKey,
      provider: "elevenlabs",
      model: options.scribeModel ?? "scribe_v2",
    });
  }

  if (mode === "dual" || mode === "whisper") {
    whisper = await transcribeAudio(audioPath, {
      provider: "whisper",
      model: options.whisperModel ?? "small",
    });
  }

  const scribeScore = scribe ? scoreTranscript(expected, scribe.text) : undefined;
  const whisperScore = whisper ? scoreTranscript(expected, whisper.text) : undefined;

  if (scribeScore) {
    score = Math.min(score, scribeScore.score);
    if (!scribeScore.ok) {
      reasons.push(`scribe:${scribeScore.unmatched.join("|") || "score"}`);
    }
    if (prefersNearMissEnding(expected, scribe.text)) {
      reasons.push("scribe:near-miss-ending");
    }
    if (
      scribe &&
      weakLastLogprob(scribe, {
        absoluteFloor: options.minLastLogprob ?? -0.5,
        gap: options.logprobGap ?? 0.003,
      })
    ) {
      reasons.push("scribe:weak-last-logprob");
    }
  }

  if (whisperScore) {
    // Whisper is noisier mid-sentence — weight ending / hard fail more than full score.
    if (prefersNearMissEnding(expected, whisper.text)) {
      score = Math.min(score, 0.85);
      reasons.push("whisper:near-miss-ending");
    } else if (!whisperScore.ok && whisperScore.score < 0.75) {
      score = Math.min(score, whisperScore.score);
      reasons.push(`whisper:${whisperScore.unmatched.join("|") || "score"}`);
    } else if (
      !whisperScore.ok &&
      whisperScore.unmatched.some((u) => u.startsWith("(ending:"))
    ) {
      score = Math.min(score, whisperScore.score);
      reasons.push(`whisper:${whisperScore.unmatched.join("|")}`);
    }
  }

  if (scribe && whisper && lastWordDisagreement(scribe.text, whisper.text)) {
    reasons.push(
      `disagree:${lastContentToken(scribe.text)}≠${lastContentToken(whisper.text)}`,
    );
    score = Math.min(score, 0.8);
  }

  return {
    ok: reasons.length === 0,
    reasons,
    score,
    scribe,
    whisper,
    scribeScore,
    whisperScore,
  };
}

export function judgeModeFromSttProvider(provider: SttProvider | "dual"): JudgeMode {
  if (provider === "dual") return "dual";
  return provider;
}
