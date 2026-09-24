import { describe, expect, it } from "vitest";

import { grammarEntries } from "./grammar";
import { namesHourAhead, parsePattern, parsePatternRow } from "./grammar-pattern";

function patternFor(slug: string) {
  const topic = grammarEntries.find((entry) => entry.slug === slug);
  if (!topic) throw new Error(`missing ${slug}`);
  return parsePattern(topic.pattern.lines);
}

describe("parsePattern", () => {
  it("lays a regular verb out as a paradigm with its endings split off", () => {
    const view = patternFor("present-tense");
    expect(view.kind).toBe("paradigm");
    if (view.kind !== "paradigm") return;

    expect(view.singular.map((cell) => [cell.pronoun, cell.stem, cell.ending])).toEqual([
      ["ja", "číta", "m"],
      ["ty", "číta", "š"],
      ["on / ona", "číta", ""],
    ]);
    expect(view.plural.map((cell) => cell.ending)).toEqual(["me", "te", "jú"]);
  });

  it("keeps irregular verbs whole instead of inventing a stem", () => {
    for (const slug of ["byt-present", "mat-present"]) {
      const view = patternFor(slug);
      expect(view.kind).toBe("paradigm");
      if (view.kind !== "paradigm") continue;
      expect([...view.singular, ...view.plural].every((cell) => cell.stem === "")).toBe(
        true,
      );
    }
  });

  it("falls back to rows for everything else", () => {
    expect(patternFor("negation").kind).toBe("rows");
    expect(patternFor("grammatical-gender").kind).toBe("rows");
  });
});

describe("parsePatternRow", () => {
  it("splits arrows and glosses", () => {
    expect(parsePatternRow("robiť → urobiť · do / get done")).toEqual({
      main: "robiť",
      result: "urobiť",
      gloss: "do / get done",
    });
  });

  it("splits label: value lines", () => {
    expect(parsePatternRow("feminine adjective ending: -á")).toEqual({
      label: "feminine adjective ending",
      main: "-á",
    });
  });

  it("keeps a lone phrase as the main text", () => {
    expect(parsePatternRow("päť+ + genitive plural")).toEqual({
      main: "päť+ + genitive plural",
      gloss: undefined,
    });
  });
});

describe("namesHourAhead", () => {
  it("is true only for quarters and halves", () => {
    expect([0, 5, 15, 30, 45, 55].map(namesHourAhead)).toEqual([
      false,
      false,
      true,
      true,
      true,
      false,
    ]);
  });
});
