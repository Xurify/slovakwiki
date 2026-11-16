import { describe, expect, it } from "vitest";

import { TRAM, tramShift } from "./street";

describe("the tram pulling in", () => {
  it("comes in from off the right edge and slows to a stop at the sign", () => {
    expect(tramShift(0)).toBe(TRAM.away);
    expect(tramShift(TRAM.ms)).toBe(0);
    expect(tramShift(TRAM.ms * 2)).toBe(0);
    const steps = Array.from({ length: 11 }, (_, index) =>
      tramShift((TRAM.ms * index) / 10),
    );
    for (let index = 1; index < steps.length; index += 1) {
      expect(steps[index]).toBeLessThan(steps[index - 1]);
    }
    // Eased out: more than half the way in by half the time, as Street.svelte's ease-out has it.
    expect(tramShift(TRAM.ms / 2)).toBeLessThan(TRAM.away / 2);
  });
});
