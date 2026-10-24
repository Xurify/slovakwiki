import { describe, expect, it } from "vitest";

import { dressFor } from "./dress";

describe("dress", () => {
  it("puts the umbrella up only in the rain and the scarf on only in the snow", () => {
    expect(dressFor("rain")).toEqual({
      headphones: false,
      scarf: false,
      umbrellaUp: true,
    });
    expect(dressFor("snow")).toEqual({
      headphones: false,
      scarf: true,
      umbrellaUp: false,
    });
    expect(dressFor("cloudy")).toEqual({
      headphones: false,
      scarf: false,
      umbrellaUp: false,
    });
    expect(dressFor("clear")).toEqual({
      headphones: false,
      scarf: false,
      umbrellaUp: false,
    });
    expect(dressFor("clear", { headphones: true }).headphones).toBe(true);
  });
});
