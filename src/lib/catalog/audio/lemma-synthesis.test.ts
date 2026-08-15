import { describe, expect, it } from "vitest";

import { dictionaryLemmaSynthText } from "./lemma-synthesis";

describe("dictionaryLemmaSynthText", () => {
  it("capitalizes kam to avoid English Come", () => {
    expect(dictionaryLemmaSynthText("kam")).toBe("Kam");
  });

  it("returns undefined when synth matches display", () => {
    expect(dictionaryLemmaSynthText("či")).toBeUndefined();
    expect(dictionaryLemmaSynthText("niečo")).toBeUndefined();
  });
});
