import { describe, expect, it } from "vitest";

import { leashSpan } from "./leash";

const mark = (left: number) => ({ left, top: 0, width: 80 });

describe("a lead", () => {
  it("runs from the hand down to the collar of a dog ahead of its walker", () => {
    const span = leashSpan({ mark: mark(0), facing: 1 }, { mark: mark(60), facing: 1 });

    expect(span.flip).toBe(false);
    expect(span.left).toBeCloseTo(49.6);
    expect(span.width).toBeCloseTo(63.2);
    expect(span.hand).toBeGreaterThan(span.collar);
  });

  it("mirrors when the dog is on the walker's other side", () => {
    const span = leashSpan(
      { mark: mark(100), facing: -1 },
      { mark: mark(20), facing: -1 },
    );

    expect(span.flip).toBe(true);
    expect(span.left).toBeCloseTo(47.2);
  });
});
