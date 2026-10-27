import type { AlignedSyllable } from "./syllable-align";
import type { VowelShape } from "./syllables";

/**
 * A clip's loudness, one digit (0–9) per frame, so the mouth follows the real
 * recording, plus the vowel each frame belongs to for the lip shape. Built
 * offline by `scripts/audio/mouth.ts`; text timing alone lands syllables too
 * loosely to read as lip sync.
 */
export const MOUTH_FRAME_MS = 50;

/** Lips move a little before the sound they make. */
export const MOUTH_LEAD_MS = 40;

/** Breath and room tone this far under the loudest frame stay shut. */
const GATE_DB = 35;

/** Scale to a high voiced frame, not the single loudest, so most syllables open well. */
const REFERENCE_PERCENTILE = 0.95;

/** Lift quiet syllables so unstressed ones still read. */
const OPEN_GAMMA = 0.7;

/** Samples in one `frameMs` frame. */
export function frameHop(sampleRate: number, frameMs: number): number {
  return Math.max(1, Math.round((sampleRate * frameMs) / 1000));
}

/**
 * A clip's loudness frame by frame: the root mean square of each `frameMs`
 * of samples. A shorter last frame counts too, unless `whole` drops it.
 */
export function rmsFrames(
  samples: ArrayLike<number>,
  sampleRate: number,
  frameMs: number,
  whole = false,
): number[] {
  const hop = frameHop(sampleRate, frameMs);
  const levels: number[] = [];

  for (let start = 0; start < samples.length; start += hop) {
    const end = Math.min(samples.length, start + hop);
    if (whole && end - start < hop) break;

    let sum = 0;
    for (let index = start; index < end; index += 1) sum += samples[index] ** 2;
    levels.push(Math.sqrt(sum / (end - start)));
  }

  return levels;
}

export function encodeMouthTrack(samples: ArrayLike<number>, sampleRate: number): string {
  const levels = rmsFrames(samples, sampleRate, MOUTH_FRAME_MS);

  const loudest = Math.max(0, ...levels);
  if (loudest === 0) return "0".repeat(levels.length);

  const gate = loudest * 10 ** (-GATE_DB / 20);
  const voiced = levels.filter((level) => level > gate).sort((a, b) => a - b);
  const reference = voiced[Math.floor((voiced.length - 1) * REFERENCE_PERCENTILE)];

  return levels
    .map((level) => {
      if (level <= gate) return "0";
      const open = Math.min(1, level / reference) ** OPEN_GAMMA;
      return String(Math.max(1, Math.round(open * 9)));
    })
    .join("");
}

/**
 * One letter per frame: the nearest aligned syllable's vowel, `-` where the
 * mouth is shut by silence, `m` where an m, b or p shuts the lips mid-voice.
 */
export function encodeVowelTrack(loudness: string, syllables: AlignedSyllable[]): string {
  const letters = [...loudness].map((digit, frame): string => {
    if (digit === "0" || syllables.length === 0) return "-";

    const centre = (frame + 0.5) * MOUTH_FRAME_MS;
    let nearest = syllables[0];
    for (const syllable of syllables) {
      if (Math.abs(syllable.at - centre) < Math.abs(nearest.at - centre))
        nearest = syllable;
    }
    return nearest.vowel;
  });

  for (const at of syllables.flatMap((syllable) => syllable.shut ?? [])) {
    const frame = Math.floor(at / MOUTH_FRAME_MS);
    // A loud frame is mostly vowel: shutting there looks worse than no closure.
    if (letters[frame] !== undefined && letters[frame] !== "-" && loudness[frame] <= "4")
      letters[frame] = SHUT;
  }
  return letters.join("");
}

const SHUT = "m";

export interface LipShape {
  /** Rounding: 0 spread, 1 fully rounded. */
  round: number;
  /** Mouth width against a neutral `a`. */
  width: number;
}

/** Lip shape per vowel; a shut frame keeps the shape it closes from. */
const VOWEL_LIPS: Record<VowelShape, LipShape> = {
  a: { round: 0, width: 1 },
  e: { round: 0, width: 1.1 },
  i: { round: 0, width: 1.18 },
  o: { round: 0.75, width: 0.72 },
  u: { round: 1, width: 0.58 },
  r: { round: 0.2, width: 0.9 },
};

export const NEUTRAL_LIPS: LipShape = VOWEL_LIPS.a;

export interface LipTrack {
  round: number[];
  /** Frames where the lips press shut on an m, b or p. */
  shut: boolean[];
  width: number[];
}

export function decodeVowelTrack(track: string): LipTrack {
  const round: number[] = [];
  const shut: boolean[] = [];
  const width: number[] = [];
  let held = NEUTRAL_LIPS;

  for (const letter of track) {
    if (letter in VOWEL_LIPS) held = VOWEL_LIPS[letter as VowelShape];
    round.push(held.round);
    shut.push(letter === SHUT);
    width.push(held.width);
  }

  return { round, shut, width };
}

export function lipsFromTrack(lips: LipTrack, timeMs: number): LipShape {
  return {
    round: sampleFrames(lips.round, timeMs, NEUTRAL_LIPS.round),
    width: sampleFrames(lips.width, timeMs, NEUTRAL_LIPS.width),
  };
}

/**
 * Whether the lips are pressed shut at a clip time. Not interpolated: eased
 * in and out over one 50 ms frame, a closure would barely reach shut.
 */
export function lipsShutAt(lips: LipTrack, timeMs: number): boolean {
  return lips.shut[Math.floor((timeMs + MOUTH_LEAD_MS) / MOUTH_FRAME_MS)] ?? false;
}

export function decodeMouthTrack(track: string): number[] {
  return [...track].map((digit) => Number(digit) / 9);
}

/** A value at a clip time, interpolated between frame centres; `outside` past either end. */
function sampleFrames(frames: number[], timeMs: number, outside: number): number {
  const position = (timeMs + MOUTH_LEAD_MS) / MOUTH_FRAME_MS - 0.5;
  if (position < -0.5 || position > frames.length - 0.5) return outside;

  const before = Math.max(0, Math.floor(position));
  const after = Math.min(frames.length - 1, before + 1);
  const t = Math.min(1, Math.max(0, position - before));
  return frames[before] + (frames[after] - frames[before]) * t;
}

/** Openness at a clip time; 0 outside the clip. */
export function mouthFromTrack(track: number[], timeMs: number): number {
  return sampleFrames(track, timeMs, 0);
}

export interface TrackSpan {
  end: number;
  start: number;
}

/** First to last sounding frame, in ms. */
export function trackSpeechSpan(track: number[]): TrackSpan | undefined {
  const first = track.findIndex((value) => value > 0);
  if (first === -1) return undefined;

  const last = track.findLastIndex((value) => value > 0);
  return { start: first * MOUTH_FRAME_MS, end: (last + 1) * MOUTH_FRAME_MS };
}

/** Silent stretches inside the speech, in ms: where sentence breaks can land. */
export function trackPauses(track: number[], minMs = 150): TrackSpan[] {
  const span = trackSpeechSpan(track);
  if (!span) return [];

  const pauses: TrackSpan[] = [];
  let runStart = -1;

  for (
    let index = span.start / MOUTH_FRAME_MS;
    index < span.end / MOUTH_FRAME_MS;
    index += 1
  ) {
    if (track[index] === 0) {
      if (runStart === -1) runStart = index;
      continue;
    }

    if (runStart !== -1 && (index - runStart) * MOUTH_FRAME_MS >= minMs) {
      pauses.push({ start: runStart * MOUTH_FRAME_MS, end: index * MOUTH_FRAME_MS });
    }
    runStart = -1;
  }

  return pauses;
}
