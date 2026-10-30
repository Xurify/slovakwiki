import { describe, expect, it } from "vitest";

import { alignSyllables } from "./syllable-align";

const RATE = 16_000;

/** A clip of tone bursts, one per syllable, at the given spans in ms and loudness. */
function clip(
  bursts: Array<[number, number] | [number, number, number]>,
  lengthMs: number,
): Float32Array {
  const samples = new Float32Array((lengthMs * RATE) / 1000);
  for (const [from, to, amplitude = 0.5] of bursts) {
    for (let index = (from * RATE) / 1000; index < (to * RATE) / 1000; index += 1) {
      samples[index] = amplitude * Math.sin((2 * Math.PI * 220 * index) / RATE);
    }
  }
  return samples;
}

describe("alignSyllables", () => {
  it("puts the words after a [pause] after the silence it made", () => {
    // Pause 1.1 s long, where the text alone would expect the second word
    // early in it.
    const samples = clip(
      [
        [200, 360],
        [420, 560],
        [1660, 1820],
        [1880, 2040],
      ],
      2300,
    );
    const placed = alignSyllables("Áno. [pause] Áno.", samples, RATE);

    expect(placed.map(({ vowel }) => vowel)).toEqual(["a", "o", "a", "o"]);
    expect(placed[1].at).toBeLessThan(600);
    expect(placed[2].at).toBeGreaterThan(1650);
  });

  it("says nothing for a direction like [slowly]", () => {
    const samples = clip(
      [
        [200, 360],
        [420, 560],
      ],
      800,
    );

    expect(alignSyllables("[slowly] Áno.", samples, RATE)).toEqual(
      alignSyllables("Áno.", samples, RATE),
    );
  });

  it("finds the words after a comma the voice held far longer than the text", () => {
    const samples = clip(
      [
        [200, 360],
        [420, 560],
        [1400, 1560],
        [1620, 1760],
      ],
      2000,
    );
    const placed = alignSyllables("Áno, áno.", samples, RATE);

    expect(placed[1].at).toBeLessThan(600);
    expect(placed[2].at).toBeGreaterThan(1380);
  });

  it("starts the words after a sigh the text gives no time", () => {
    const samples = clip(
      [
        [100, 600, 0.2],
        [1000, 1160],
        [1220, 1360],
      ],
      1600,
    );
    const placed = alignSyllables("[sighs] Áno.", samples, RATE);

    expect(placed[0].at).toBeGreaterThan(980);
  });

  it("shuts the lips on the quiet hum of an m between two vowels", () => {
    const samples = clip(
      [
        [200, 360],
        [360, 440, 0.05],
        [440, 600],
      ],
      800,
    );
    const [first, second] = alignSyllables("ama", samples, RATE);

    expect(first.shut).toBeUndefined();
    expect(second.shut).toHaveLength(1);
    expect(second.shut![0]).toBeGreaterThanOrEqual(360);
    expect(second.shut![0]).toBeLessThan(440);
  });
});
