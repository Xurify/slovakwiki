import { describe, expect, it } from "vitest";

import {
  CASES,
  NAME_OWNERS,
  nameOwnerForm,
  possessiveForm,
  whoseForm,
  withPreposition,
  type OwnerId,
  type Slot,
} from "./paradigm";

function column(owner: OwnerId, slot: Slot): string[] {
  return CASES.map((grammaticalCase) => possessiveForm(owner, slot, grammaticalCase));
}

describe("possessive paradigm", () => {
  it("declines môj in every case, nominative through instrumental", () => {
    expect(column("my", "masculine-animate")).toEqual([
      "môj",
      "môjho",
      "môjmu",
      "môjho",
      "mojom",
      "mojím",
    ]);
    expect(column("my", "masculine-inanimate")).toEqual([
      "môj",
      "môjho",
      "môjmu",
      "môj",
      "mojom",
      "mojím",
    ]);
    expect(column("my", "feminine")).toEqual([
      "moja",
      "mojej",
      "mojej",
      "moju",
      "mojej",
      "mojou",
    ]);
    expect(column("my", "neuter")).toEqual([
      "moje",
      "môjho",
      "môjmu",
      "moje",
      "mojom",
      "mojím",
    ]);
    expect(column("my", "plural-personal")).toEqual([
      "moji",
      "mojich",
      "mojim",
      "mojich",
      "mojich",
      "mojimi",
    ]);
    expect(column("my", "plural")).toEqual([
      "moje",
      "mojich",
      "mojim",
      "moje",
      "mojich",
      "mojimi",
    ]);
  });

  it("keeps the long stem only where Slovak writes it", () => {
    expect(column("our", "masculine-animate")).toEqual([
      "náš",
      "nášho",
      "nášmu",
      "nášho",
      "našom",
      "naším",
    ]);
    expect(column("your-vy", "feminine")).toEqual([
      "vaša",
      "vašej",
      "vašej",
      "vašu",
      "vašej",
      "vašou",
    ]);
    expect(possessiveForm("your-ty", "masculine-animate", "genitive")).toBe("tvojho");
    expect(possessiveForm("own", "masculine-animate", "dative")).toBe("svojmu");
  });

  it("separates instrumental singular -ím from dative plural -im", () => {
    expect(possessiveForm("our", "masculine-animate", "instrumental")).toBe("naším");
    expect(possessiveForm("our", "plural-personal", "dative")).toBe("našim");
    expect(possessiveForm("my", "neuter", "instrumental")).toBe("mojím");
    expect(possessiveForm("my", "plural", "dative")).toBe("mojim");
  });

  it("never changes jeho, jej, ich", () => {
    for (const grammaticalCase of CASES) {
      expect(possessiveForm("his", "feminine", grammaticalCase)).toBe("jeho");
      expect(possessiveForm("her", "plural-personal", grammaticalCase)).toBe("jej");
      expect(possessiveForm("their", "neuter", grammaticalCase)).toBe("ich");
    }
  });

  it("agrees čí and named-owner adjectives with the thing", () => {
    expect(whoseForm("masculine-inanimate")).toBe("čí");
    expect(whoseForm("feminine")).toBe("čia");
    expect(whoseForm("neuter")).toBe("čie");
    expect(whoseForm("plural")).toBe("čie");

    const anna = NAME_OWNERS.find((owner) => owner.id === "anna")!;
    const peter = NAME_OWNERS.find((owner) => owner.id === "peter")!;
    expect(nameOwnerForm(anna, "feminine")).toBe("Annina");
    expect(nameOwnerForm(peter, "neuter")).toBe("Petrovo");
    expect(nameOwnerForm(peter, "plural")).toBe("Petrove");
  });

  it("turns s into so before s, z, š, ž", () => {
    expect(withPreposition("s", "svojím bratom")).toBe("so svojím bratom");
    expect(withPreposition("s", "sestrou")).toBe("so sestrou");
    expect(withPreposition("s", "mojou sestrou")).toBe("s mojou sestrou");
    expect(withPreposition("o", "svojom aute")).toBe("o svojom aute");
  });
});
