import { describe, expect, it } from "vitest";

import { encodeWav, trimSilence, voiceFrom } from "./take";

const RATE = 16_000;

/** `silence` s of quiet, `voice` s of a 220 Hz tone, then `silence` s again. */
function recording(silence: number, voice: number): Float32Array {
  const quiet = Math.round(silence * RATE);
  const loud = Math.round(voice * RATE);
  const samples = new Float32Array(quiet * 2 + loud);
  for (let index = 0; index < loud; index += 1) {
    samples[quiet + index] = 0.3 * Math.sin((2 * Math.PI * 220 * index) / RATE);
  }
  return samples;
}

describe("a recorded take", () => {
  it("is trimmed to the voice, with a little room either side", () => {
    const trimmed = trimSilence(recording(1, 0.5), RATE);

    expect(trimmed).toBeDefined();
    const seconds = trimmed!.length / RATE;
    expect(seconds).toBeGreaterThan(0.5);
    expect(seconds).toBeLessThan(0.9);
  });

  it("is nothing when nothing was said", () => {
    expect(trimSilence(new Float32Array(RATE), RATE)).toBeUndefined();
    expect(voiceFrom(new Float32Array(RATE), RATE)).toBeUndefined();
  });

  it("opens the mouth while the voice sounds", () => {
    const voice = voiceFrom(recording(0.5, 1), RATE);

    expect(voice?.durationMs).toBeGreaterThan(1000);
    expect(voice?.mouth).toMatch(/[5-9]{10}/);
  });

  it("is a WAV every browser plays", () => {
    const wav = new DataView(encodeWav(new Float32Array([0, 1, -1, 0.5]), RATE));
    const tag = (at: number) =>
      String.fromCharCode(...[0, 1, 2, 3].map((offset) => wav.getUint8(at + offset)));

    expect([tag(0), tag(8), tag(12), tag(36)]).toEqual(["RIFF", "WAVE", "fmt ", "data"]);
    expect(wav.getUint32(24, true)).toBe(RATE);
    expect(wav.getUint32(40, true)).toBe(8);
    expect([wav.getInt16(46, true), wav.getInt16(48, true)]).toEqual([32767, -32768]);
  });
});
