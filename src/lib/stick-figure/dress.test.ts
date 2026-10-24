import { describe, expect, it } from "vitest";

import { dressFor } from "./dress";

describe("dress", () => {
  it("puts the umbrella up only in the rain and the scarf on only in the snow", () => {
    expect(dressFor("rain")).toEqual({
      scarf: false,
      umbrellaUp: true,
    });
    expect(dressFor("snow")).toEqual({
      scarf: true,
      umbrellaUp: false,
    });
    expect(dressFor("cloudy")).toEqual({
      scarf: false,
      umbrellaUp: false,
    });
    expect(dressFor("clear")).toEqual({
      scarf: false,
      umbrellaUp: false,
    });
    expect(dressFor("clear", { headwear: "headphones" }).headwear).toBe("headphones");
  });
});
