import { describe, expect, it } from "vitest";

import { grammarEntries } from "./grammar";
import {
  addedPrefix,
  markSuffix,
  namesHourAhead,
  parsePattern,
  parsePatternRow,
} from "./grammar-pattern";

function patternFor(slug: string) {
  const topic = grammarEntries.find((entry) => entry.slug === slug);
  if (!topic) throw new Error(`missing ${slug}`);
  return parsePattern(topic.pattern.lines, topic.examples);
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

  it("reads an English gloss after ` · ` on each person", () => {
    const view = patternFor("byt-present");
    if (view.kind !== "paradigm") throw new Error("expected paradigm");

    expect(view.singular.map((cell) => [cell.pronoun, cell.form, cell.gloss])).toEqual([
      ["ja", "som", "I am"],
      ["ty", "si", "you are (informal)"],
      ["on / ona / ono", "je", "he, she, it is"],
    ]);
  });

  it("pairs gender endings with the example that shows them", () => {
    const view = patternFor("grammatical-gender");
    expect(view.kind).toBe("tiles");
    if (view.kind !== "tiles") return;

    expect(view.tiles.map((tile) => [tile.label, tile.ending])).toEqual([
      ["Masculine", "-ý"],
      ["Feminine", "-á"],
      ["Neuter", "-é"],
    ]);
    expect(view.tiles[1]?.example?.slovak).toEqual({
      before: "dobr",
      mark: "á",
      after: " žena",
    });
  });

  it("falls back to rows for everything else", () => {
    expect(patternFor("negation").kind).toBe("rows");
    expect(patternFor("questions").kind).toBe("rows");
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
    expect(parsePatternRow("Feminine: -á")).toEqual({ label: "Feminine", main: "-á" });
  });

  it("keeps a lone phrase as the main text", () => {
    expect(parsePatternRow("päť+ + genitive plural")).toEqual({
      main: "päť+ + genitive plural",
      gloss: undefined,
    });
  });
});

describe("markSuffix", () => {
  it("marks the first word ending in the suffix", () => {
    expect(markSuffix("veľmi dobré mesto", "é")).toEqual({
      before: "veľmi dobr",
      mark: "é",
      after: " mesto",
    });
  });

  it("ignores a suffix that is the whole word or absent", () => {
    expect(markSuffix("a b", "a")).toBeUndefined();
    expect(markSuffix("muž", "á")).toBeUndefined();
  });
});

describe("addedPrefix", () => {
  it("finds the prefix a derived form adds", () => {
    expect(addedPrefix(parsePatternRow("mám → nemám"))).toEqual({
      before: "",
      mark: "ne",
      after: "mám",
    });
    expect(
      addedPrefix(parsePatternRow("čítať → prečítať · read / read through"))?.mark,
    ).toBe("pre");
  });

  it("returns nothing when the result is not the base plus a prefix", () => {
    expect(
      addedPrefix(parsePatternRow("subject + verb + object → neutral")),
    ).toBeUndefined();
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
