/**
 * A clip's loudness, one digit (0–9) per frame, so the mouth follows the real
 * recording. Built offline by `scripts/audio/mouth.ts`; text timing alone
 * lands syllables too loosely to read as lip sync.
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

export function encodeMouthTrack(samples: ArrayLike<number>, sampleRate: number): string {
  const hop = Math.max(1, Math.round((sampleRate * MOUTH_FRAME_MS) / 1000));
  const levels: number[] = [];

  for (let start = 0; start < samples.length; start += hop) {
    const end = Math.min(samples.length, start + hop);
    let sum = 0;
    for (let index = start; index < end; index += 1) sum += samples[index] ** 2;
    levels.push(Math.sqrt(sum / (end - start)));
  }

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

export function decodeMouthTrack(track: string): number[] {
  return [...track].map((digit) => Number(digit) / 9);
}

/** Openness at a clip time, interpolated between frame centres; 0 outside the clip. */
export function mouthFromTrack(track: number[], timeMs: number): number {
  const position = (timeMs + MOUTH_LEAD_MS) / MOUTH_FRAME_MS - 0.5;
  if (position < -0.5 || position > track.length - 0.5) return 0;

  const before = Math.max(0, Math.floor(position));
  const after = Math.min(track.length - 1, before + 1);
  const t = Math.min(1, Math.max(0, position - before));
  return track[before] + (track[after] - track[before]) * t;
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
