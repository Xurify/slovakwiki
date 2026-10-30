import { textTimeline, type LineSpan, type TimedSyllable } from "./line-plan";
import { rmsFrames } from "./mouth-track";
import type { VowelShape } from "./syllables";

const FRAME_MS = 10;
const GATE_DB = 35;
const SMOOTH_FRAMES = 2;

// Fitted on half of 297 lesson clips against Scribe word spans and checked
// on the other half: 92% of held-out syllables land inside their own word,
// against 80% before pauses were anchored and 75% for text timing alone.
// The prior keeps each syllable near where the text puts it; loudness pulls
// it onto the vowel.
const PRIOR_SIGMA_MS = 120;
const PRIOR_WEIGHT = 0.1;
const MIN_GAP_MS = 110;
/** This far under the loudest frame, for this long, the voice has paused. */
const SILENCE_DB = 25;
const MIN_SILENCE_MS = 200;
/** What leaving a text pause unmatched costs, against ms of misfit; a heard silence costs half. */
const SKIP_MS = 600;
/** A sound before the first word, which the text gives no time. */
const LEADING_SOUND = /^\s*\[(chuckles|laughs|laughing|sighs|yawns)\]/i;
/** A closure keeps this clear of the vowels either side of it. */
const SHUT_CLEAR_MS = 30;
/** How far from its vowel an m, b or p is looked for at the edge of the speech. */
const SHUT_REACH_MS = 150;

export interface AlignedSyllable {
  /** Vowel centre in the clip, ms. */
  at: number;
  /** Where the lips shut on an m, b or p next to the vowel, ms. */
  shut?: number[];
  vowel: VowelShape;
}

/** Scaled to the 95th-percentile frame and lightly smoothed. */
function loudness(levels: number[]): number[] {
  const reference =
    [...levels].sort((a, b) => a - b)[Math.floor(levels.length * 0.95)] || 1;
  const loud = levels.map((level) => Math.min(1, level / reference));

  return loud.map((_, index) => {
    const window = loud.slice(
      Math.max(0, index - SMOOTH_FRAMES),
      index + SMOOTH_FRAMES + 1,
    );
    return window.reduce((sum, value) => sum + value, 0) / window.length;
  });
}

/** First and last frame within 35 dB of the loudest, in ms. */
function voicedSpan(levels: number[]): [number, number] {
  const gate = Math.max(0, ...levels) * 10 ** (-GATE_DB / 20);
  const first = Math.max(
    0,
    levels.findIndex((level) => level > gate),
  );
  const last = Math.max(
    0,
    levels.findLastIndex((level) => level > gate),
  );
  return [first * FRAME_MS, last * FRAME_MS];
}

/** Stretches inside the voiced span where the voice drops away, in ms. */
function silences(levels: number[], start: number, end: number): LineSpan[] {
  const gate = Math.max(0, ...levels) * 10 ** (-SILENCE_DB / 20);
  const last = Math.round(end / FRAME_MS);
  const runs: LineSpan[] = [];

  for (let t = Math.round(start / FRAME_MS); t <= last; t += 1) {
    if (levels[t] >= gate) continue;
    const from = t;
    while (t <= last && levels[t] < gate) t += 1;
    if (t <= last && (t - from) * FRAME_MS >= MIN_SILENCE_MS)
      runs.push({ start: from * FRAME_MS, end: t * FRAME_MS });
  }
  return runs;
}

/**
 * Text time to clip time. Real pauses vary far more than the text's guess
 * at them, so one stretch over the whole clip puts the words after a long
 * `[pause]` too early. Instead each text pause is matched, in order, to the
 * heard silence nearest where it should fall, and the time is stretched
 * piece by piece between them.
 */
function textToClip(
  text: string,
  pauses: LineSpan[],
  speechMs: number,
  heard: LineSpan[],
  [start, end]: [number, number],
): (ms: number) => number {
  let origin = start;
  let runs = heard;
  if (LEADING_SOUND.test(text) && runs.length > 0 && runs[0].start - start < 2000) {
    origin = runs[0].end;
    runs = runs.slice(1);
  }

  const scale = (end - origin) / (speechMs || 1);
  const knots: Array<[number, number]> = [[0, origin]];
  const pairs = matchInOrder(
    pauses.map((pause) => origin + ((pause.start + pause.end) / 2) * scale),
    runs.map((run) => (run.start + run.end) / 2),
  );
  for (const [a, b] of pairs) {
    knots.push([pauses[a].start, runs[b].start], [pauses[a].end, runs[b].end]);
  }
  knots.push([speechMs, end]);

  return (ms) => {
    const after = knots.findIndex(([x], index) => index > 0 && ms <= x);
    const [[x0, y0], [x1, y1]] = after === -1 ? knots.slice(-2) : knots.slice(after - 1);
    return x1 > x0 ? y0 + ((ms - x0) / (x1 - x0)) * (y1 - y0) : y0;
  };
}

/** Pair expected with heard times in order, at least total misfit plus skips. */
function matchInOrder(expected: number[], heard: number[]): Array<[number, number]> {
  const rows = expected.length + 1;
  const cols = heard.length + 1;
  const cost = new Float64Array(rows * cols).fill(Number.POSITIVE_INFINITY);
  const step = new Uint8Array(rows * cols);
  cost[0] = 0;

  for (let a = 0; a < rows; a += 1) {
    for (let b = 0; b < cols; b += 1) {
      const here = cost[a * cols + b];
      if (!Number.isFinite(here)) continue;
      const relax = (to: number, value: number, kind: number) => {
        if (value < cost[to]) {
          cost[to] = value;
          step[to] = kind;
        }
      };
      if (a + 1 < rows) relax((a + 1) * cols + b, here + SKIP_MS, 1);
      if (b + 1 < cols) relax(a * cols + b + 1, here + SKIP_MS / 2, 2);
      if (a + 1 < rows && b + 1 < cols) {
        const misfit = Math.abs(expected[a] - heard[b]);
        if (misfit < SKIP_MS * 1.5) relax((a + 1) * cols + b + 1, here + misfit, 3);
      }
    }
  }

  const pairs: Array<[number, number]> = [];
  for (let a = rows - 1, b = cols - 1; a > 0 || b > 0;) {
    const kind = step[a * cols + b];
    if (kind === 3) pairs.push([a - 1, b - 1]);
    if (kind !== 2) a -= 1;
    if (kind !== 1) b -= 1;
  }
  return pairs.reverse();
}

/**
 * Place each syllable of `text` on the clip: a dynamic-programming pass picks
 * one 10 ms frame per syllable, in order and at least 110 ms apart, scoring
 * loudness (vowels are the loud part of a syllable) against distance from the
 * text-timed guess. Offline only — it runs in `scripts/audio/mouth.ts`.
 *
 * `text` is the clip text, tags and all: a `[pause]` is timed as silence, so
 * the words after it are looked for after it. Fed the text without its
 * pauses, only 63% of the podcast's syllables landed in their own word
 * (Scribe word spans), against 86% with them and 91% for clips with none.
 */
export function alignSyllables(
  text: string,
  samples: ArrayLike<number>,
  sampleRate: number,
): AlignedSyllable[] {
  const { pauses, speechMs, syllables } = textTimeline(text);
  const levels = rmsFrames(samples, sampleRate, FRAME_MS, true);
  if (syllables.length === 0 || levels.length === 0) return [];

  const loud = loudness(levels);
  const [start, end] = voicedSpan(levels);
  const clipTime = textToClip(text, pauses, speechMs, silences(levels, start, end), [
    start,
    end,
  ]);
  const expected = syllables.map((syllable) => clipTime(syllable.at) / FRAME_MS);
  const gap = Math.max(1, Math.round(MIN_GAP_MS / FRAME_MS));
  const sigma = PRIOR_SIGMA_MS / FRAME_MS;

  const frames = loud.length;
  let previous = new Float64Array(frames).fill(Number.NEGATIVE_INFINITY);
  const choices: Int32Array[] = [];

  syllables.forEach((_, k) => {
    const score = new Float64Array(frames).fill(Number.NEGATIVE_INFINITY);
    const choice = new Int32Array(frames).fill(-1);
    let bestBefore = Number.NEGATIVE_INFINITY;
    let bestFrame = -1;

    for (let t = 0; t < frames; t += 1) {
      if (k > 0 && t - gap >= 0 && previous[t - gap] > bestBefore) {
        bestBefore = previous[t - gap];
        bestFrame = t - gap;
      }

      const local = loud[t] - PRIOR_WEIGHT * ((t - expected[k]) / sigma) ** 2;
      if (k === 0) score[t] = local;
      else if (bestFrame >= 0) {
        score[t] = bestBefore + local;
        choice[t] = bestFrame;
      }
    }

    choices.push(choice);
    previous = score;
  });

  let frame = previous.indexOf(Math.max(...previous));
  if (!Number.isFinite(previous[frame])) {
    // Too many syllables for the clip to keep them 110 ms apart: keep the text timing.
    return syllables.map((syllable, k) => ({
      at: expected[k] * FRAME_MS,
      vowel: syllable.vowel,
    }));
  }

  const placed = new Array<number>(syllables.length);
  for (let k = syllables.length - 1; k >= 0; k -= 1) {
    placed[k] = frame;
    frame = choices[k][frame];
  }

  const shuts = shutFrames(syllables, placed, levels);
  return syllables.map((syllable, k) => ({
    at: placed[k] * FRAME_MS,
    ...(shuts[k].length > 0 && { shut: shuts[k].map((at) => at * FRAME_MS) }),
    vowel: syllable.vowel,
  }));
}

/**
 * The frame each m, b or p shuts the lips on: the quietest voiced frame
 * between its vowel and the next, since closed lips damp the voice. Loudness
 * alone holds the mouth open through an `m`; a silent `p` closure is already
 * shut by the loudness track, so silence is never picked.
 */
function shutFrames(
  syllables: TimedSyllable[],
  placed: number[],
  levels: number[],
): number[][] {
  const gate = Math.max(0, ...levels) * 10 ** (-GATE_DB / 20);
  const clear = Math.round(SHUT_CLEAR_MS / FRAME_MS);
  const reach = Math.round(SHUT_REACH_MS / FRAME_MS);
  const quietest = (from: number, to: number): number[] => {
    let best = -1;
    for (let t = Math.max(0, from); t <= Math.min(levels.length - 1, to); t += 1) {
      if (levels[t] > gate && (best === -1 || levels[t] < levels[best])) best = t;
    }
    return best === -1 ? [] : [best];
  };

  return syllables.map((syllable, k) => {
    const frames: number[] = [];
    if (syllable.shutBefore) {
      const from = Math.max(placed[k] - reach, k > 0 ? placed[k - 1] + clear : 0);
      frames.push(...quietest(from, placed[k] - clear));
    }
    if (syllable.shutAfter) {
      const next = k + 1 < placed.length ? placed[k + 1] - clear : Infinity;
      const to = Math.min(placed[k] + reach, next);
      frames.push(...quietest(placed[k] + clear, to));
    }
    return frames;
  });
}
