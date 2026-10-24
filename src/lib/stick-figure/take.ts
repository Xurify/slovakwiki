import { MOUTH_FRAME_MS, encodeMouthTrack, frameHop, rmsFrames } from "./mouth-track";

/** A line the learner recorded, ready to play in a figure's place. */
export interface Take {
  durationMs: number;
  /** Loudness track, for the figure's mouth. */
  mouth: string;
  /** Object URL of the WAV. */
  src: string;
}

/** Quieter than this under the loudest frame is room tone, not voice. */
const SILENCE_DB = 30;
/** Kept either side of the voice, so a soft first or last consonant is not cut. */
const PAD_MS = 120;

/**
 * The recording from just before the voice starts to just after it stops,
 * or undefined when nothing was said. The silence while reaching for the
 * button would otherwise hold the figure's mouth shut.
 */
export function trimSilence(
  samples: Float32Array,
  sampleRate: number,
): Float32Array | undefined {
  const hop = frameHop(sampleRate, MOUTH_FRAME_MS);
  const levels = rmsFrames(samples, sampleRate, MOUTH_FRAME_MS);
  const loudest = Math.max(0, ...levels);
  if (loudest < 1e-4) return undefined;

  const gate = loudest * 10 ** (-SILENCE_DB / 20);
  const first = levels.findIndex((level) => level > gate);
  const last = levels.findLastIndex((level) => level > gate);
  const pad = Math.round((sampleRate * PAD_MS) / 1000);
  return samples.subarray(
    Math.max(0, first * hop - pad),
    Math.min(samples.length, (last + 1) * hop + pad),
  );
}

/** 16-bit mono PCM WAV, which every browser plays and knows the length of. */
export function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const text = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  text(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  text(8, "WAVE");
  text(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, samples.length * 2, true);

  samples.forEach((sample, index) => {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(
      44 + index * 2,
      clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff,
      true,
    );
  });
  return buffer;
}

/** The trimmed voice as WAV bytes and its mouth track, or undefined for silence. */
export function voiceFrom(
  samples: Float32Array,
  sampleRate: number,
): { durationMs: number; mouth: string; wav: ArrayBuffer } | undefined {
  const voice = trimSilence(samples, sampleRate);
  if (!voice) return undefined;

  return {
    durationMs: (voice.length / sampleRate) * 1000,
    mouth: encodeMouthTrack(voice, sampleRate),
    wav: encodeWav(voice, sampleRate),
  };
}
