import { describe, expect, it } from "vitest";

import { nounGenderLabel } from "./types";

describe("nounGenderLabel", () => {
  it("labels ordinary genders with the Slovak term", () => {
    expect(nounGenderLabel("masculine-animate")).toEqual({
      english: "masculine (animate)",
      slovak: "mužský rod životný",
    });
    expect(nounGenderLabel("neuter")).toEqual({
      english: "neuter",
      slovak: "stredný rod",
    });
  });

  it("adds the dictionary gender to plural-only nouns", () => {
    expect(nounGenderLabel("plural-only", "feminine")).toEqual({
      english: "plural only (feminine)",
      slovak: "pomnožné podstatné meno, ženský rod",
    });
    expect(nounGenderLabel("plural-only", "masculine-inanimate")).toEqual({
      english: "plural only (masculine inanimate)",
      slovak: "pomnožné podstatné meno, mužský rod neživotný",
    });
  });

  it("falls back to plain plural only when the gender is unknown", () => {
    expect(nounGenderLabel("plural-only")).toEqual({
      english: "plural only",
      slovak: "pomnožné podstatné meno",
    });
  });

  it("ignores a plural-only gender on other genders", () => {
    expect(nounGenderLabel("feminine", "neuter").english).toBe("feminine");
  });
});
