import { describe, expect, it } from "vitest";

import type { PracticeItem } from "$lib/learning/types";

import { dictionaryHrefsForItems, dictionaryPathForLemmaId } from "./lemma-href";

describe("lemma href lookup", () => {
  it("falls back for unknown lemma ids", () => {
    expect(dictionaryPathForLemmaId("not-a-real-lemma")).toBe(
      "/dictionary/not-a-real-lemma",
    );
  });

  it("uses canonical sense paths for POS siblings", () => {
    expect(dictionaryPathForLemmaId("malo-adv")).toBe("/dictionary/malo#adverb");
    expect(dictionaryPathForLemmaId("domaci-n")).toBe("/dictionary/domaci#noun");
  });

  it("collects unique cloze lemma ids from practice items", () => {
    const items = [
      {
        id: "a",
        prompt: "x",
        task: { type: "cloze", lemmaId: "malo-adv", id: "t1" },
      },
      {
        id: "b",
        prompt: "y",
        task: { type: "cloze", lemmaId: "malo-adv", id: "t2" },
      },
      {
        id: "c",
        prompt: "z",
        task: { type: "choice", id: "t3" },
      },
    ] as unknown as PracticeItem[];

    expect(dictionaryHrefsForItems(items)).toEqual({
      "malo-adv": "/dictionary/malo#adverb",
    });
  });
});
