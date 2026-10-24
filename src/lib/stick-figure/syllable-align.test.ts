import { describe, expect, it } from "vitest";

import { alignSyllables } from "./syllable-align";

const RATE = 16_000;

/** A clip of tone bursts, one per syllable, at the given spans in ms. */
function clip(bursts: Array<[number, number]>, lengthMs: number): Float32Array {
  const samples = new Float32Array((lengthMs * RATE) / 1000);
  for (const [from, to] of bursts) {
    for (let index = (from * RATE) / 1000; index < (to * RATE) / 1000; index += 1) {
      samples[index] = 0.5 * Math.sin((2 * Math.PI * 220 * index) / RATE);
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
});
