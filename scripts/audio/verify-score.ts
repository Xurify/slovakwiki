/**
 * Score expected Slovak text vs STT transcript for audio QA.
 * Tuned to catch real TTS mismatches while tolerating Whisper SK noise.
 */

const PUNCT_RE = /[^\p{L}\p{N}\s]+/gu;

export function foldSlovak(text: string): string {
  return text
    .normalize("NFC")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(PUNCT_RE, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extra softening for Whisper SK noise (ý/í often swap). */
export function softFoldSlovak(text: string): string {
  return foldSlovak(text).replaceAll("y", "i");
}

export function tokenizeFolded(text: string): string[] {
  const folded = softFoldSlovak(text);
  return folded ? folded.split(" ") : [];
}

/** Levenshtein distance. */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = new Array<number>(b.length + 1);
  const cur = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) prev[j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    cur[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1]! + cost);
    }
    for (let j = 0; j <= b.length; j += 1) prev[j] = cur[j]!;
  }

  return prev[b.length]!;
}

export interface VerifyScore {
  /** 0..1 — higher is better. */
  score: number;
  ok: boolean;
  expectedTokens: string[];
  transcriptTokens: string[];
  unmatched: string[];
  charErrorRate: number;
}

function charErrorRate(expected: string, got: string): number {
  const a = softFoldSlovak(expected).replace(/\s+/g, "");
  const b = softFoldSlovak(got).replace(/\s+/g, "");
  if (!a.length) return b.length ? 1 : 0;
  return editDistance(a, b) / a.length;
}

/**
 * Match each expected token to best unused transcript token.
 * Short (≤3): distance ≤1. Mid (4–5): exact after soft fold (catches mylil≠myliu).
 * Long (≥6): distance ≤ floor(len/5) — but single-token lemmas stay exact (budget 0).
 */
function tokenBudget(token: string, options?: { singleToken?: boolean }): number {
  if (options?.singleToken) return 0;
  if (token.length <= 3) return 1;
  if (token.length <= 5) return 0;
  return Math.max(1, Math.floor(token.length / 5));
}

export function scoreTranscript(
  expected: string,
  transcript: string,
  options?: { minScore?: number },
): VerifyScore {
  const minScore = options?.minScore ?? 0.92;
  const expectedTokens = tokenizeFolded(expected);
  const transcriptTokens = tokenizeFolded(transcript);
  const used = new Set<number>();
  const unmatched: string[] = [];
  let matched = 0;
  const singleToken = expectedTokens.length === 1;

  for (const token of expectedTokens) {
    let bestIdx = -1;
    let bestDist = Infinity;
    let bestConsume = 1;

    for (let i = 0; i < transcriptTokens.length; i += 1) {
      if (used.has(i)) continue;
      const candidate = transcriptTokens[i]!;
      let dist = editDistance(token, candidate);
      let consume = 1;

      // Whisper often glues words ("ovojak") or splits ("nie bol").
      if (dist > 0) {
        if (candidate.includes(token) || token.includes(candidate)) {
          const longer = Math.max(token.length, candidate.length);
          const shorter = Math.min(token.length, candidate.length);
          if (shorter / longer >= 0.7) dist = 0;
        }
      }

      // Try merging next token: "nie"+"bol" ≈ "nebol"
      if (dist > 0 && i + 1 < transcriptTokens.length && !used.has(i + 1)) {
        const merged = candidate + transcriptTokens[i + 1]!;
        const mergedDist = editDistance(token, merged);
        if (mergedDist < dist) {
          dist = mergedDist;
          consume = 2;
        }
      }

      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
        bestConsume = consume;
      }
      if (dist === 0) break;
    }

    const budget =
      tokenBudget(token, { singleToken }) + (bestConsume > 1 && !singleToken ? 1 : 0);

    if (bestIdx >= 0 && bestDist <= budget) {
      for (let k = 0; k < bestConsume; k += 1) used.add(bestIdx + k);
      matched += 1;
    } else {
      unmatched.push(token);
    }
  }

  const tokenScore = expectedTokens.length === 0 ? 1 : matched / expectedTokens.length;
  const cer = charErrorRate(expected, transcript);
  // Blend: token match dominates; CER penalizes junk insertions.
  const score = Math.max(0, Math.min(1, tokenScore * 0.85 + (1 - cer) * 0.15));

  // Final-consonant guard: catch mýlil→mýliu even when Whisper is generous.
  const endingMismatch = lastContentEndingMismatch(expectedTokens, transcriptTokens);

  return {
    score: endingMismatch ? Math.min(score, 0.9) : score,
    ok: score >= minScore && unmatched.length === 0 && !endingMismatch,
    expectedTokens,
    transcriptTokens,
    unmatched: endingMismatch
      ? [...unmatched, `(ending:${endingMismatch})`]
      : unmatched,
    charErrorRate: cer,
  };
}

/** If last long token's final letter differs (mylil vs myliu), flag it. */
function lastContentEndingMismatch(
  expectedTokens: string[],
  transcriptTokens: string[],
): string | null {
  const expectedLast = [...expectedTokens].reverse().find((t) => t.length >= 4);
  if (!expectedLast || transcriptTokens.length === 0) return null;

  let best = "";
  let bestDist = Infinity;
  for (const candidate of transcriptTokens) {
    const dist = editDistance(expectedLast, candidate);
    if (dist < bestDist) {
      bestDist = dist;
      best = candidate;
    }
  }

  if (!best) return null;
  const a = expectedLast.at(-1);
  const b = best.at(-1);
  if (a && b && a !== b) return `${expectedLast}≠${best}`;
  return null;
}
