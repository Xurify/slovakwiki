import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { ROOT } from "../lib/paths";
import {
  assignNounGender,
  genderFromEnding,
  validateExceptions,
  type NounGenderExceptions,
} from "./noun-gender-rules";

const exceptions = JSON.parse(
  readFileSync(
    path.join(ROOT, "content", "dictionary", "noun-gender-exceptions.json"),
    "utf8",
  ),
) as NounGenderExceptions;

describe("genderFromEnding", () => {
  it("follows the regular Slovak patterns", () => {
    expect(genderFromEnding("stôl")).toBe("masculine-inanimate");
    expect(genderFromEnding("žena")).toBe("feminine");
    expect(genderFromEnding("akcia")).toBe("feminine");
    expect(genderFromEnding("radosť")).toBe("feminine");
    expect(genderFromEnding("mesto")).toBe("neuter");
    expect(genderFromEnding("srdce")).toBe("neuter");
    expect(genderFromEnding("rozhodnutie")).toBe("neuter");
    expect(genderFromEnding("múzeum")).toBe("neuter");
    expect(genderFromEnding("vedúci")).toBe("masculine-animate");
  });

  it("has no rule for other endings", () => {
    expect(genderFromEnding("pani")).toBeUndefined();
  });
});

describe("assignNounGender with the reviewed exceptions", () => {
  it("passes validation", () => {
    expect(() => validateExceptions(exceptions)).not.toThrow();
  });

  it("uses the ending rule for regular nouns", () => {
    expect(assignNounGender("stôl", exceptions)).toEqual({
      gender: "masculine-inanimate",
      source: "ending-rule",
    });
    expect(assignNounGender("dobytok", exceptions).gender).toBe("masculine-inanimate");
  });

  it("lists people and animals as masculine animate", () => {
    expect(assignNounGender("učiteľ", exceptions).gender).toBe("masculine-animate");
    expect(assignNounGender("pes", exceptions).gender).toBe("masculine-animate");
  });

  it("covers feminine nouns ending in a consonant and dieťa-type neuters", () => {
    expect(assignNounGender("vec", exceptions).gender).toBe("feminine");
    expect(assignNounGender("pieseň", exceptions).gender).toBe("feminine");
    expect(assignNounGender("dieťa", exceptions).gender).toBe("neuter");
  });

  it("gives plural-only nouns their dictionary gender", () => {
    expect(assignNounGender("nohavice", exceptions)).toEqual({
      gender: "plural-only",
      pluralOnlyGender: "feminine",
      source: "exception",
    });
    expect(assignNounGender("okuliare", exceptions).pluralOnlyGender).toBe(
      "masculine-inanimate",
    );
  });

  it("keeps deliberate unsets unset", () => {
    expect(assignNounGender("sprievodca", exceptions)).toEqual({ source: "unset" });
  });
});

describe("validateExceptions", () => {
  it("rejects a lemma listed twice", () => {
    expect(() =>
      validateExceptions({ ...exceptions, feminine: [...exceptions.feminine, "dieťa"] }),
    ).toThrow(/dieťa/);
  });
});
