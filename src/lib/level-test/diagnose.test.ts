import { describe, expect, it } from "vitest";

import { diagnose } from "./diagnose";
import type { ItemResponse, ProductionRecord, WordTag } from "./types";

function gap(
  expected: string,
  given: string,
  tag: WordTag,
  difficulty = 30,
): ItemResponse {
  const area =
    tag.class === "noun"
      ? "nouns"
      : tag.class === "verb"
        ? "verbs"
        : tag.class === "functionWord"
          ? "functionWords"
          : "vocabulary";
  return {
    itemId: `${expected}-${given}-${difficulty}`,
    kind: "readComplete",
    skill: "reading",
    difficulty,
    score: expected === given ? 1 : 0,
    adaptive: true,
    area,
    expected,
    given,
    tag,
  };
}

const noun: WordTag = { class: "noun", lemma: "škola", slug: "skola" };
const verb: WordTag = { class: "verb", lemma: "chodiť", slug: "chodit" };

describe("diagnose", () => {
  it("finds a gap in noun endings and a strength in verbs", () => {
    const responses = [
      ...[1, 2, 3, 4, 5].map((n) => gap("školy", `škol${"aeiou"[n - 1]}`, noun)),
      ...[1, 2, 3, 4, 5].map((n) => gap("chodí", "chodí", verb, 30 + n)),
    ];
    const result = diagnose(responses, [], 30);

    expect(result.areas.map((area) => area.area)).toEqual(["nouns", "verbs", "accents"]);
    expect(result.gaps[0]?.area).toBe("nouns");
    expect(result.gaps[0]?.examples[0]).toMatchObject({
      expected: "školy",
      note: "škola",
      href: "/dictionary/skola",
    });
    expect(result.gaps[0]?.links.map((link) => link.href)).toContain(
      "/grammar/cases-overview",
    );
    expect(result.strengths.map((area) => area.area)).toContain("verbs");
  });

  it("never calls an area strong with nothing right", () => {
    const responses = [1, 2, 3].map((n) => gap("malá", "maľ", noun, n));
    const result = diagnose(responses, [], 0);
    expect(result.strengths).toEqual([]);
  });

  it("leaves out an area with too few answers", () => {
    const result = diagnose(
      [gap("školy", "školu", noun), gap("školy", "školy", noun)],
      [],
      30,
    );
    expect(result.areas).toEqual([]);
  });

  it("counts a missing accent under accents, not under grammar", () => {
    const responses = [1, 2, 3].map((n) => gap("pekný", "pekny", noun, 20 + n));
    const result = diagnose(responses, [], 30);

    expect(result.areas.find((area) => area.area === "nouns")?.percent).toBe(100);
    expect(result.areas.find((area) => area.area === "accents")?.percent).toBe(0);
    expect(result.accentSlips).toMatchObject([{ kind: "long", count: 3 }]);
  });

  it("names the kind of accent slip", () => {
    const responses = [
      gap("manželkou", "manzelkou", noun),
      gap("ženy", "ženi", noun),
      gap("päť", "pät", noun),
      gap("kôň", "kon", noun),
    ];
    const kinds = diagnose(responses, [], 30).accentSlips.map((slip) => slip.kind);
    expect(kinds).toEqual(expect.arrayContaining(["hacek", "iy", "aeo"]));
  });

  it("matches dictation words before judging their accents", () => {
    const dictation: ItemResponse = {
      itemId: "lt-1",
      kind: "listenType",
      skill: "listening",
      difficulty: 20,
      score: 0.8,
      adaptive: true,
      area: "listening",
      expected: "Včera sme hrali karty do noci.",
      given: "vcera sme hrali karty do noci",
    };
    const result = diagnose([dictation, dictation, dictation], [], 30);
    expect(result.accentSlips[0]).toMatchObject({ kind: "hacek" });
    expect(result.accentSlips[0]?.examples[0]).toEqual({
      expected: "včera",
      given: "vcera",
    });
  });

  it("lists the real words the learner did not know", () => {
    const responses: ItemResponse[] = [
      {
        itemId: "rs-pes",
        kind: "readSelect",
        skill: "reading",
        difficulty: 5,
        score: 0,
        adaptive: true,
        area: "vocabulary",
        word: { text: "pes", real: true, slug: "pes", english: "dog" },
      },
      {
        itemId: "rs-fake",
        kind: "readSelect",
        skill: "reading",
        difficulty: 5,
        score: 0,
        adaptive: true,
        area: "vocabulary",
        word: { text: "bydlivo", real: false },
      },
    ];
    const result = diagnose(responses, [], 30);
    expect(result.wordsToLearn).toEqual([
      { text: "pes", english: "dog", href: "/dictionary/pes" },
    ]);
    expect(result.fakeWordsAccepted).toBe(1);
  });

  it("turns repeated writing slips into a gap with the right page", () => {
    const record: ProductionRecord = {
      id: "w1",
      kind: "writingSample",
      skill: "writing",
      prompt: "",
      response: "",
      status: "scored",
      result: {
        score: 30,
        level: "A2",
        criteria: { content: 30, coherence: 30, grammar: 25, lexis: 30 },
        feedback: "",
        issues: [
          { topic: "aspect", wrote: "včera som urobil", correct: "včera som robil" },
          { topic: "verbForms", wrote: "ja ide", correct: "ja idem" },
        ],
      },
    };
    const result = diagnose([], [record], 30);
    expect(result.gaps).toHaveLength(1);
    expect(result.gaps[0]).toMatchObject({ area: "verbs", summary: null });
    expect(result.gaps[0]?.links.map((link) => link.href)).toContain("/grammar/aspect");
  });
});
