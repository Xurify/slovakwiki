import { describe, expect, it } from "vitest";

import { alive, blinkAt, breathAt } from "./idle";
import { REST_POSE } from "./pose";

/** Start times of the blinks in a minute, sampled every 10 ms. */
function blinks(id: string): number[] {
  const starts: number[] = [];
  for (let now = 10; now < 60_000; now += 10) {
    if (blinkAt(now, id) > 0 && blinkAt(now - 10, id) === 0) starts.push(now);
  }
  return starts;
}

describe("life in a still body", () => {
  it("blinks every 4 s or so, never on a beat, differently for each person", () => {
    for (const id of ["anna", "marek", "maria"]) {
      const starts = blinks(id);
      const gaps = starts.slice(1).map((start, index) => start - starts[index]);
      expect(starts.length).toBeGreaterThanOrEqual(12);
      expect(Math.min(...gaps)).toBeGreaterThanOrEqual(600);
      expect(Math.max(...gaps)).toBeLessThanOrEqual(7_400);
    }
    expect(blinks("anna").slice(0, 3)).not.toEqual(blinks("marek").slice(0, 3));
  });

  it("closes the lids without squeezing the eyes", () => {
    const peak = Math.max(
      ...Array.from(
        { length: 6000 },
        (_, index) => alive(REST_POSE, index * 10, "anna", true).shut,
      ),
    );
    expect(peak).toBeGreaterThan(0.45);
    expect(peak).toBeLessThanOrEqual(0.5);
  });

  it("breathes in and out, out of step with the others", () => {
    const anna = Array.from({ length: 400 }, (_, index) => breathAt(index * 20, "anna"));
    expect(Math.min(...anna)).toBeLessThan(0.02);
    expect(Math.max(...anna)).toBeGreaterThan(0.98);
    expect(breathAt(1000, "anna")).not.toBeCloseTo(breathAt(1000, "marek"), 2);
  });

  it("leaves the arms to a cue", () => {
    const held = alive(REST_POSE, 2000, "anna", false);
    expect(held.leadRaise).toBe(REST_POSE.leadRaise);
    expect(held.rearRaise).toBe(REST_POSE.rearRaise);
  });
});
