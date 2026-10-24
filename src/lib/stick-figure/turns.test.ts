import { describe, expect, it } from "vitest";

import { TURN_AFTER_MS, TURN_APART_MS, turnDelays } from "./turns";

describe("turn delays", () => {
  it("turns the speaker at once and the others a beat later, nearest first", () => {
    expect(turnDelays(["lucia", "alex", "anna", "marek"], "alex")).toEqual({
      alex: 0,
      lucia: TURN_AFTER_MS,
      anna: TURN_AFTER_MS,
      marek: TURN_AFTER_MS + TURN_APART_MS,
    });
  });

  it("turns everyone on the same beat when nobody on stage speaks", () => {
    expect(turnDelays(["anna", "marek"], null)).toEqual({
      anna: TURN_AFTER_MS,
      marek: TURN_AFTER_MS,
    });
  });
});
