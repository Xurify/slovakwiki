import { describe, expect, it } from "vitest";

import {
  genderFromCode,
  genderFromEnding,
  genderFromPolishRecord,
  resolveNounGender,
  type KaikkiNounRecord,
} from "./noun-gender-mapping";

function englishNoun(
  word: string,
  code: string,
  options: { decl?: string; glosses?: string[]; senseTags?: string[] } = {},
): KaikkiNounRecord {
  return {
    word,
    pos: "noun",
    head_templates: [
      {
        name: "sk-noun",
        args: { "1": code, ...(options.decl ? { decl: options.decl } : {}) },
      },
    ],
    senses: [{ glosses: options.glosses ?? [word], tags: options.senseTags ?? [] }],
  };
}

function polishNoun(word: string, tags: string[]): KaikkiNounRecord {
  return { word, pos: "noun", tags, senses: [{ glosses: [word] }] };
}

function resolveGender(
  lemma: string,
  sources: { english?: KaikkiNounRecord[]; polish?: KaikkiNounRecord[] },
  english = lemma,
) {
  return resolveNounGender(lemma, english, {
    english: sources.english ?? [],
    polish: sources.polish ?? [],
  }).gender;
}

describe("genderFromCode", () => {
  it("maps English Wiktionary sk-noun codes", () => {
    expect(genderFromCode("m-pr")).toBe("masculine-animate");
    expect(genderFromCode("m-anml")).toBe("masculine-animate");
    expect(genderFromCode("m-in")).toBe("masculine-inanimate");
    expect(genderFromCode("f")).toBe("feminine");
    expect(genderFromCode("n")).toBe("neuter");
    expect(genderFromCode("f-p")).toBe("plural-only");
    expect(genderFromCode("m-in-p")).toBe("plural-only");
    expect(genderFromCode("?")).toBeNull();
  });
});

describe("resolveNounGender — spot checks", () => {
  it("priateľ → masculine animate (person)", () => {
    expect(resolveGender("priateľ", { english: [englishNoun("priateľ", "m-pr")] })).toBe(
      "masculine-animate",
    );
  });

  it("stôl → masculine inanimate", () => {
    expect(resolveGender("stôl", { english: [englishNoun("stôl", "m-in")] })).toBe(
      "masculine-inanimate",
    );
  });

  it("žena → feminine, mesto → neuter, dieťa → neuter", () => {
    expect(resolveGender("žena", { english: [englishNoun("žena", "f")] })).toBe(
      "feminine",
    );
    expect(resolveGender("mesto", { english: [englishNoun("mesto", "n")] })).toBe(
      "neuter",
    );
    expect(resolveGender("dieťa", { english: [englishNoun("dieťa", "n")] })).toBe(
      "neuter",
    );
  });

  it("nohavice → plural-only from the plural-only sense tag", () => {
    const nohavice = englishNoun("nohavice", "f", {
      senseTags: ["feminine", "plural", "plural-only"],
    });
    expect(resolveGender("nohavice", { english: [nohavice] })).toBe("plural-only");
  });

  it("dvere → plural-only from the -p code", () => {
    expect(resolveGender("dvere", { english: [englishNoun("dvere", "f-p")] })).toBe(
      "plural-only",
    );
  });
});

describe("resolveNounGender — sources and conflicts", () => {
  it("ignores inflected-form stubs (nohavice as a form of nohavica)", () => {
    const formStub: KaikkiNounRecord = {
      word: "nohavice",
      pos: "noun",
      head_templates: [{ name: "head", args: { "1": "sk", "2": "noun form" } }],
      senses: [{ tags: ["form-of", "genitive", "singular"] }],
    };
    expect(resolveGender("nohavice", { english: [formStub] })).toBeNull();
  });

  it("picks the homograph whose glosses match ours", () => {
    const records = [
      englishNoun("kuli", "m-pr", { glosses: ["coolie", "laborer"] }),
      englishNoun("kuli", "f", { glosses: ["bullet"] }),
    ];
    expect(resolveNounGender("kuli", "coolie", { english: records, polish: [] })).toEqual(
      {
        gender: "masculine-animate",
        source: "english-wiktionary-gloss-match",
      },
    );
  });

  it("falls back to Polish Wiktionary when English has no entry", () => {
    expect(
      resolveGender("zákon", {
        polish: [polishNoun("zákon", ["inanimate", "masculine"])],
      }),
    ).toBe("masculine-inanimate");
    expect(
      resolveGender("učiteľ", {
        polish: [polishNoun("učiteľ", ["animate", "masculine"])],
      }),
    ).toBe("masculine-animate");
  });

  it("leaves Polish masculine without animacy unset", () => {
    expect(genderFromPolishRecord(polishNoun("projekt", ["masculine"]))).toBeNull();
    expect(
      resolveGender("projekt", { polish: [polishNoun("projekt", ["masculine"])] }),
    ).toBeNull();
  });

  it("reads Polish plural headwords as plural-only", () => {
    expect(
      resolveGender("okuliare", {
        polish: [polishNoun("okuliare", ["inanimate", "masculine", "plural"])],
      }),
    ).toBe("plural-only");
  });

  it("lets Polish break an English tie caused by a code/pattern slip (želanie)", () => {
    const zelanie = englishNoun("želanie", "f", { decl: "vysvedčenie" });
    expect(
      resolveGender("želanie", {
        english: [zelanie],
        polish: [polishNoun("želanie", ["neuter"])],
      }),
    ).toBe("neuter");
  });

  it("does not let a Polish slip beat a confident ending (oddelenie)", () => {
    expect(
      resolveGender("oddelenie", {
        polish: [polishNoun("oddelenie", ["inanimate", "masculine"])],
      }),
    ).toBeNull();
  });
});

describe("genderFromEnding", () => {
  it("applies confident endings", () => {
    expect(genderFromEnding("radosť")?.gender).toBe("feminine");
    expect(genderFromEnding("stanica")).toBeNull();
    expect(genderFromEnding("investícia")?.gender).toBe("feminine");
    expect(genderFromEnding("rozhodnutie")?.gender).toBe("neuter");
    expect(genderFromEnding("ministerstvo")?.gender).toBe("neuter");
    expect(genderFromEnding("socializmus")?.gender).toBe("masculine-inanimate");
    expect(genderFromEnding("turista")?.gender).toBe("masculine-animate");
    expect(genderFromEnding("sudca")?.gender).toBe("masculine-animate");
  });

  it("skips endings that mix genders or animacy", () => {
    expect(genderFromEnding("ovca")).toBeNull();
    expect(genderFromEnding("hrdina")).toBeNull();
    expect(genderFromEnding("dedo")).toBeNull();
    expect(genderFromEnding("financie")).toBeNull();
    expect(genderFromEnding("učiteľ")).toBeNull();
    expect(genderFromEnding("Bratislava")).toBeNull();
  });

  it("feeds unresolved lemmas", () => {
    expect(
      resolveNounGender("komisia", "commission", { english: [], polish: [] }),
    ).toEqual({
      gender: "feminine",
      source: "ending-rule",
      note: "ending -cia / -zia / -sia / -ria / -gia (pattern ulica)",
    });
  });
});
