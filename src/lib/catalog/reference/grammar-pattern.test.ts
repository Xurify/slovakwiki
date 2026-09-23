import { describe, expect, it } from "vitest";
import { grammarEntries } from "./grammar";
import { looksSlovak, parsePatternLines } from "./grammar-pattern";

function patternLines(slug: string): string[] {
  const entry = grammarEntries.find((candidate) => candidate.slug === slug);
  if (!entry) throw new Error(`missing grammar topic ${slug}`);
  return entry.pattern.lines;
}

describe("parsePatternLines", () => {
  it("splits a regular conjugation into stem and ending", () => {
    const rows = parsePatternLines(patternLines("present-tense"));
    expect(rows.every((row) => row.kind === "person")).toBe(true);
    expect(rows[0]).toEqual({
      kind: "person",
      pronoun: "ja",
      form: "čítam",
      stem: "číta",
      ending: "m",
    });
    expect(rows[2]).toMatchObject({ pronoun: "on / ona", form: "číta", ending: "" });
    expect(rows[5]).toMatchObject({ pronoun: "oni / ony", ending: "jú" });
  });

  it("leaves irregular or short-stem verbs unsplit", () => {
    for (const slug of ["byt-present", "mat-present"]) {
      const rows = parsePatternLines(patternLines(slug));
      expect(rows.every((row) => row.kind === "person" && row.stem === "")).toBe(true);
    }
    expect(parsePatternLines(patternLines("byt-present"))[2]).toMatchObject({
      pronoun: "on / ona / ono",
      form: "je",
    });
  });

  it("reads change, gloss, and label rows", () => {
    expect(parsePatternLines(["robiť → urobiť · do / get done"])[0]).toEqual({
      kind: "change",
      from: "robiť",
      to: "urobiť",
      gloss: "do / get done",
    });
    expect(parsePatternLines(["mám → nemám"])[0]).toEqual({
      kind: "change",
      from: "mám",
      to: "nemám",
    });
    expect(parsePatternLines(["Mám kávu. · I have coffee."])[0]).toEqual({
      kind: "gloss",
      slovak: "Mám kávu.",
      english: "I have coffee.",
    });
    expect(parsePatternLines(["masculine adjective ending: -ý"])[0]).toEqual({
      kind: "label",
      label: "masculine adjective ending",
      value: "-ý",
    });
    expect(parsePatternLines(["Prepáč · informal / Prepáčte · formal"])[0]).toEqual({
      kind: "plain",
      text: "Prepáč · informal / Prepáčte · formal",
    });
  });

  it("reads clock rows and labels in clock mode", () => {
    const rows = parsePatternLines(patternLines("telling-time"), { withClocks: true });
    expect(rows[3]).toEqual({
      kind: "time",
      digital: "02:30",
      hour: 2,
      minute: 30,
      lookingAhead: true,
      slovak: "Je pol tretej.",
    });
    expect(
      rows.find((row) => row.kind === "time" && row.digital === "10:05"),
    ).toMatchObject({
      lookingAhead: false,
    });
    expect(rows.find((row) => row.kind === "label")).toEqual({
      kind: "label",
      label: "9:55 countdown",
      value: "za päť minút desať",
    });
  });
});

describe("looksSlovak", () => {
  it("spots Slovak letters", () => {
    expect(looksSlovak("robiť")).toBe(true);
    expect(looksSlovak("subject + verb + object")).toBe(false);
  });
});
