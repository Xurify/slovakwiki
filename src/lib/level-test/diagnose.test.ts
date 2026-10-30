import { describe, expect, it } from "vitest";

import { diagnose, type AreaStatus, type Diagnosis, type RunContext } from "./diagnose";
import { areaForTag } from "./areas";
import type { ItemResponse, ProductionRecord, StudyArea, WordTag } from "./types";

const QUICK: RunContext = {
  stepKinds: new Set([
    "readSelect",
    "listenSelect",
    "listenLength",
    "fillBlank",
    "chooseVerb",
    "placeClitic",
    "readComplete",
    "listenType",
  ]),
  mode: "quick",
  microphone: false,
  transcription: false,
};

function statusOf(result: Diagnosis, area: StudyArea): AreaStatus | undefined {
  return result.groups
    .flatMap((group) => group.areas)
    .find((entry) => entry.area === area)?.status;
}

function measured(result: Diagnosis): StudyArea[] {
  return result.groups.flatMap((group) =>
    group.areas.flatMap((entry) =>
      entry.status.kind === "measured" ? [entry.area] : [],
    ),
  );
}

function percent(result: Diagnosis, area: StudyArea): number | undefined {
  const status = statusOf(result, area);
  return status?.kind === "measured" ? status.summary.percent : undefined;
}

function gap(
  expected: string,
  given: string,
  tag: WordTag,
  difficulty = 30,
): ItemResponse {
  const area = areaForTag(tag);
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
  it("finds a gap in noun cases and a strength in verbs", () => {
    const responses = [
      ...[1, 2, 3, 4, 5].map((n) => gap("školy", `škol${"aeiou"[n - 1]}`, noun)),
      ...[1, 2, 3, 4, 5].map((n) => gap("chodí", "chodí", verb, 30 + n)),
    ];
    const result = diagnose(responses, [], 30, QUICK);

    expect(measured(result)).toEqual(["nouns", "conjugation", "spelling"]);
    expect(result.gaps[0]?.area).toBe("nouns");
    expect(result.gaps[0]?.examples[0]).toMatchObject({
      expected: "školy",
      note: "škola",
      href: "/dictionary/skola",
    });
    expect(result.gaps[0]?.links.map((link) => link.href)).toContain(
      "/grammar/cases-overview",
    );
    expect(result.strengths.map((area) => area.area)).toContain("conjugation");
  });

  it("lets a part with no misses reach the top near the scale's edge", () => {
    const responses = [0, 1, 2, 3, 4, 5].map((n) => gap("chodí", "chodí", verb, 40 + n));
    const status = statusOf(diagnose(responses, [], 100, QUICK), "conjugation");
    expect(status?.kind === "measured" && status.summary.score).toBeGreaterThanOrEqual(
      95,
    );
  });

  it("names missing speech recognition before a missing microphone", () => {
    const result = diagnose([], [], 40, {
      ...QUICK,
      mode: "full",
      stepKinds: new Set(),
      microphone: false,
      transcription: false,
    });
    expect(statusOf(result, "intelligibility")).toEqual({
      kind: "skipped",
      reason: "Needs speech recognition, not set up yet.",
    });
  });

  it("never calls an area strong with nothing right", () => {
    const responses = [1, 2, 3].map((n) => gap("malá", "maľ", noun, n));
    const result = diagnose(responses, [], 0, QUICK);
    expect(result.strengths).toEqual([]);
  });

  it("says so when an area has too few answers, instead of guessing", () => {
    const result = diagnose(
      [gap("školy", "školu", noun), gap("školy", "školy", noun)],
      [],
      30,
      QUICK,
    );
    expect(statusOf(result, "nouns")).toEqual({ kind: "thin", count: 2 });
    expect(statusOf(result, "adjectives")).toEqual({
      kind: "skipped",
      reason: "No answers this time.",
    });
  });

  it("shows every area, and why the run could not measure some", () => {
    const result = diagnose([], [], 30, QUICK);
    expect(result.groups.map((group) => group.group)).toEqual([
      "vocabulary",
      "declension",
      "conjugation",
      "aspect",
      "wordOrder",
      "functionWords",
      "spelling",
      "pronunciation",
    ]);
    expect(statusOf(result, "aspect")).toEqual({
      kind: "skipped",
      reason: "No answers this time.",
    });
    expect(statusOf(result, "intelligibility")).toEqual({
      kind: "skipped",
      reason: "Not part of the quick test.",
    });
  });

  it("counts a missing accent under accents, not under grammar", () => {
    const responses = [1, 2, 3].map((n) => gap("pekný", "pekny", noun, 20 + n));
    const result = diagnose(responses, [], 30, QUICK);

    expect(percent(result, "nouns")).toBe(100);
    expect(percent(result, "spelling")).toBe(0);
    expect(result.accentSlips).toMatchObject([{ kind: "long", count: 3 }]);
  });

  it("judges accents only in the letters the learner typed", () => {
    const printed = [1, 2, 3].map((n) => gap("tímu", "tímu", noun, 20 + n));
    const result = diagnose(printed, [], 30, QUICK);
    expect(statusOf(result, "spelling")?.kind).toBe("skipped");

    const typed = [1, 2, 3].map((n) => gap("malá", "mala", noun, 20 + n));
    expect(diagnose(typed, [], 30, QUICK).accentSlips).toMatchObject([
      { kind: "long", count: 3 },
    ]);
  });

  it("counts an i or y slip in a letter gap under spelling only", () => {
    const responses = [1, 2, 3].map((n) => gap("ženy", "ženi", noun, 20 + n));
    const result = diagnose(responses, [], 30, QUICK);

    expect(percent(result, "nouns")).toBe(100);
    expect(result.accentSlips).toMatchObject([{ kind: "iy", count: 3 }]);
  });

  it("does not call two right in three at the learner's level a strength", () => {
    const responses = [
      gap("chodí", "chodí", verb, 30),
      gap("chodí", "chodí", verb, 30),
      gap("chodí", "chodia", verb, 30),
    ];
    expect(diagnose(responses, [], 30, QUICK).strengths).toEqual([]);
  });

  it("does not call a single miss a gap, however easy the item", () => {
    const responses = [
      gap("školy", "školy", noun, 20),
      gap("školy", "školy", noun, 20),
      gap("školy", "školu", noun, 20),
    ];
    const result = diagnose(responses, [], 70, QUICK);
    const nouns = statusOf(result, "nouns");
    expect(nouns?.kind === "measured" && nouns.summary.delta).toBeLessThan(-5);
    expect(result.gaps).toEqual([]);
  });

  it("calls three misses at the learner's level a gap", () => {
    const responses = [1, 2, 3].map(() => gap("školy", "školu", noun, 30));
    expect(diagnose(responses, [], 30, QUICK).gaps.map((entry) => entry.area)).toEqual([
      "nouns",
    ]);
  });

  it("names the kind of accent slip", () => {
    const responses = [
      gap("manželkou", "manzelkou", noun),
      gap("ženy", "ženi", noun),
      gap("päť", "pät", noun),
      gap("kôň", "kon", noun),
    ];
    const kinds = diagnose(responses, [], 30, QUICK).accentSlips.map((slip) => slip.kind);
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
      expected: "Včera sme hrali karty do noci.",
      given: "vcera sme hrali karty do noci",
    };
    const result = diagnose([dictation, dictation, dictation], [], 30, QUICK);
    expect(result.accentSlips[0]).toMatchObject({ kind: "hacek" });
    expect(result.accentSlips[0]?.examples[0]).toEqual({
      expected: "včera",
      given: "vcera",
    });
  });

  it("counts each dictation word for its own area", () => {
    const dictation = (given: string, difficulty: number): ItemResponse => ({
      itemId: `lt-${difficulty}`,
      kind: "listenType",
      skill: "listening",
      difficulty,
      score: 0.5,
      adaptive: true,
      expected: "Bývam s manželkou.",
      given,
      wordTags: [
        { class: "verb", lemma: "bývať", slug: "byvat" },
        { class: "functionWord" },
        { class: "noun", lemma: "manželka", slug: "manzelka" },
      ],
    });
    const result = diagnose(
      [
        dictation("Bývam s manželka.", 20),
        dictation("Bývam s manželka", 25),
        dictation("bývam s manzelka", 30),
      ],
      [],
      40,
      QUICK,
    );
    expect(statusOf(result, "nouns")).toMatchObject({
      kind: "measured",
      summary: { total: 3, percent: 0 },
    });
    expect(percent(result, "conjugation")).toBe(100);
    const gap = result.gaps.find((entry) => entry.area === "nouns");
    expect(gap?.examples[0]).toMatchObject({
      expected: "manželkou",
      given: "manželka",
      note: "manželka",
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
    const result = diagnose(responses, [], 30, QUICK);
    expect(result.wordsToLearn).toEqual([
      { text: "pes", english: "dog", href: "/dictionary/pes" },
    ]);
    expect(result.fakeWordsAccepted).toBe(1);
  });

  it("measures aspect from Choose the Verb and shows the picked verb", () => {
    const responses: ItemResponse[] = [0, 1, 2].map((n) => ({
      itemId: `cv-${n}`,
      kind: "chooseVerb",
      skill: "reading",
      difficulty: 30,
      score: 0,
      guess: 0.5,
      adaptive: true,
      area: "aspect",
      choice: {
        expected: `Včera som celý deň písal list ${n}.`,
        given: "napísal",
        why: "Celý deň says how long it went on, so the imperfective.",
      },
    }));
    const result = diagnose(responses, [], 40, QUICK);
    expect(statusOf(result, "aspect")?.kind).toBe("measured");
    expect(statusOf(result, "spelling")?.kind).not.toBe("measured");
    expect(result.gaps[0]?.examples[0]).toMatchObject({
      given: "napísal",
      picked: true,
      note: "Celý deň says how long it went on, so the imperfective.",
    });
  });

  it("counts each reading blank for the part of Slovak it tests", () => {
    const responses: ItemResponse[] = [0, 1, 2].map((n) => ({
      itemId: `set#b${n}`,
      kind: "irCompleteSentences",
      skill: "reading",
      difficulty: 40,
      score: 1,
      guess: 0.5,
      adaptive: false,
      area: "wordOrder",
    }));
    expect(percent(diagnose(responses, [], 40, QUICK), "wordOrder")).toBe(100);
  });

  it("counts what the scorer saw used in writing, one answer per text", () => {
    const record = (id: string, right: number): ProductionRecord => ({
      id,
      kind: "writingSample",
      skill: "writing",
      prompt: "",
      response: "",
      status: "scored",
      result: {
        score: 40,
        level: "B1",
        criteria: { content: 40, coherence: 40, grammar: 40, lexis: 40 },
        feedback: "",
        usage: { aspect: { right, wrong: 4 - right }, wordOrder: { right: 2, wrong: 0 } },
      },
    });
    const result = diagnose(
      [],
      [record("a", 1), record("b", 2), record("c", 3)],
      40,
      QUICK,
    );
    const aspect = statusOf(result, "aspect");
    expect(aspect?.kind === "measured" && aspect.summary.total).toBe(3);
    expect(percent(result, "aspect")).toBe(50);
    expect(percent(result, "wordOrder")).toBe(100);
  });

  it("does not count 70% right in writing as at the writer's level", () => {
    const record = (id: string): ProductionRecord => ({
      id,
      kind: "writingSample",
      skill: "writing",
      prompt: "",
      response: "",
      status: "scored",
      result: {
        score: 40,
        level: "B1",
        criteria: { content: 40, coherence: 40, grammar: 40, lexis: 40 },
        feedback: "",
        usage: { nounEndings: { right: 7, wrong: 3 } },
      },
    });
    const result = diagnose([], [record("a"), record("b"), record("c")], 40, QUICK);
    const nouns = statusOf(result, "nouns");
    expect(nouns?.kind === "measured" && nouns.summary.delta).toBeLessThan(0);
    expect(result.strengths).toEqual([]);
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
          {
            topic: "aspect",
            wrote: "včera som celý deň urobil úlohy",
            correct: "včera som celý deň robil úlohy",
          },
          {
            topic: "aspect",
            wrote: "každý deň napíšem list",
            correct: "každý deň píšem list",
          },
        ],
      },
    };
    const result = diagnose([], [record], 30, QUICK);
    expect(result.gaps).toHaveLength(1);
    expect(result.gaps[0]).toMatchObject({ area: "aspect", summary: null });
    expect(result.gaps[0]?.links.map((link) => link.href)).toContain("/grammar/aspect");
  });
});
