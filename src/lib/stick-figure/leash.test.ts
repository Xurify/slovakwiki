import { describe, expect, it } from "vitest";

import { leashPath } from "./leash";

/** How far below the straight line between the ends the lead's middle hangs. */
function dip(path: string): number {
  const [, y1, , cy, , y2] = path.match(/-?\d+(\.\d+)?/g)!.map(Number);
  return (y1 + 2 * cy + y2) / 4 - (y1 + y2) / 2;
}

describe("a lead", () => {
  it("starts at the hand and ends at the collar", () => {
    const path = leashPath({ x: 10, y: 20 }, { x: 70, y: 50 }, 90);

    expect(path.startsWith("M10 20Q")).toBe(true);
    expect(path.endsWith(" 70 50")).toBe(true);
  });

  it("hangs lower the closer the two come", () => {
    const near = dip(leashPath({ x: 0, y: 0 }, { x: 30, y: 0 }, 60));
    const far = dip(leashPath({ x: 0, y: 0 }, { x: 50, y: 0 }, 60));

    expect(near).toBeGreaterThan(far);
    expect(far).toBeGreaterThan(0);
  });

  it("pulls straight once the dog is a lead's length away", () => {
    expect(dip(leashPath({ x: 0, y: 0 }, { x: 80, y: 10 }, 60))).toBeCloseTo(0);
  });
});
