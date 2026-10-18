import { describe, expect, it } from "vitest";

import {
  CASES,
  casesOfForm,
  demonstrativeForm,
  paradigmRow,
  type DemonstrativeSeries,
  type Slot,
} from "./paradigm";

function column(series: DemonstrativeSeries, slot: Slot): string[] {
  return CASES.map((grammaticalCase) => demonstrativeForm(series, slot, grammaticalCase));
}

describe("demonstrative paradigm", () => {
  it("declines ten in every case, nominative through instrumental", () => {
    expect(column("ten", "masculine-animate")).toEqual([
      "ten",
      "toho",
      "tomu",
      "toho",
      "tom",
      "tým",
    ]);
    expect(column("ten", "masculine-inanimate")).toEqual([
      "ten",
      "toho",
      "tomu",
      "ten",
      "tom",
      "tým",
    ]);
    expect(column("ten", "feminine")).toEqual(["tá", "tej", "tej", "tú", "tej", "tou"]);
    expect(column("ten", "neuter")).toEqual(["to", "toho", "tomu", "to", "tom", "tým"]);
    expect(column("ten", "plural-personal")).toEqual([
      "tí",
      "tých",
      "tým",
      "tých",
      "tých",
      "tými",
    ]);
    expect(column("ten", "plural")).toEqual([
      "tie",
      "tých",
      "tým",
      "tie",
      "tých",
      "tými",
    ]);
  });

  it("adds -to for tento and writes tohto, not the Czech tohoto", () => {
    expect(column("tento", "masculine-animate")).toEqual([
      "tento",
      "tohto",
      "tomuto",
      "tohto",
      "tomto",
      "týmto",
    ]);
    expect(column("tento", "feminine")).toEqual([
      "táto",
      "tejto",
      "tejto",
      "túto",
      "tejto",
      "touto",
    ]);
    expect(column("tento", "neuter")).toEqual([
      "toto",
      "tohto",
      "tomuto",
      "toto",
      "tomto",
      "týmto",
    ]);
    expect(column("tento", "plural-personal")).toEqual([
      "títo",
      "týchto",
      "týmto",
      "týchto",
      "týchto",
      "týmito",
    ]);
    expect(column("tento", "plural")).toEqual([
      "tieto",
      "týchto",
      "týmto",
      "tieto",
      "týchto",
      "týmito",
    ]);
  });

  it("puts tam- in front for tamten", () => {
    expect(column("tamten", "masculine-animate")).toEqual([
      "tamten",
      "tamtoho",
      "tamtomu",
      "tamtoho",
      "tamtom",
      "tamtým",
    ]);
    expect(column("tamten", "feminine")).toEqual([
      "tamtá",
      "tamtej",
      "tamtej",
      "tamtú",
      "tamtej",
      "tamtou",
    ]);
    expect(demonstrativeForm("tamten", "neuter", "nominative")).toBe("tamto");
    expect(demonstrativeForm("tamten", "plural-personal", "nominative")).toBe("tamtí");
    expect(demonstrativeForm("tamten", "plural", "nominative")).toBe("tamtie");
  });

  it("names every case a shared form belongs to", () => {
    expect(casesOfForm("ten", "feminine", "tej")).toEqual([
      "genitive",
      "dative",
      "locative",
    ]);
    expect(casesOfForm("ten", "masculine-animate", "toho")).toEqual([
      "genitive",
      "accusative",
    ]);
  });

  it("splits only the masculine accusative in table rows", () => {
    expect(paradigmRow("ten", "accusative")).toEqual([
      "toho / ten",
      "tú",
      "to",
      "tých",
      "tie",
    ]);
    expect(paradigmRow("tento", "nominative")).toEqual([
      "tento",
      "táto",
      "toto",
      "títo",
      "tieto",
    ]);
  });
});
