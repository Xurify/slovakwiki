import { textTimeline } from "./line-plan";
import type { VowelShape } from "./syllables";

const FRAME_MS = 10;
const GATE_DB = 35;
const SMOOTH_FRAMES = 2;

// Fitted on 120 lesson clips against faster-whisper word spans: 91% of
// syllables land inside their own word, against 80% for text timing alone
// and 73% for loudness alone. The prior keeps each syllable near where the
// text puts it; loudness pulls it onto the vowel.
const PRIOR_SIGMA_MS = 120;
const PRIOR_WEIGHT = 0.05;
const MIN_GAP_MS = 70;

export interface AlignedSyllable {
  /** Vowel centre in the clip, ms. */
  at: number;
  vowel: VowelShape;
}

function rmsFrames(samples: ArrayLike<number>, sampleRate: number): number[] {
  const hop = Math.max(1, Math.round((sampleRate * FRAME_MS) / 1000));
  const levels: number[] = [];

  for (let start = 0; start + hop <= samples.length; start += hop) {
    let sum = 0;
    for (let index = start; index < start + hop; index += 1) sum += samples[index] ** 2;
    levels.push(Math.sqrt(sum / hop));
  }

  return levels;
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

/**
 * Place each syllable of `text` on the clip: a dynamic-programming pass picks
 * one 10 ms frame per syllable, in order and at least 70 ms apart, scoring
 * loudness (vowels are the loud part of a syllable) against distance from the
 * text-timed guess. Offline only — it runs in `scripts/audio/mouth.ts`.
 */
export function alignSyllables(
  text: string,
  samples: ArrayLike<number>,
  sampleRate: number,
): AlignedSyllable[] {
  const { speechMs, syllables } = textTimeline(text);
  const levels = rmsFrames(samples, sampleRate);
  if (syllables.length === 0 || levels.length === 0) return [];

  const loud = loudness(levels);
  const [start, end] = voicedSpan(levels);
  const scale = speechMs > 0 ? (end - start) / speechMs : 1;
  const expected = syllables.map((syllable) => (start + syllable.at * scale) / FRAME_MS);
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
    // Too many syllables for the clip to keep them 70 ms apart: keep the text timing.
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

  return syllables.map((syllable, k) => ({
    at: placed[k] * FRAME_MS,
    vowel: syllable.vowel,
  }));
}
