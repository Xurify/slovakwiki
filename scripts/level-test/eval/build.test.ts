import { describe, expect, it } from "vitest";

import { photoSlugs } from "../../../src/lib/catalog/level-test/prompts";
import { ADVERSARIAL } from "./adversarial";
import { EVAL_BASES } from "./bases";
import { buildCases, errorCounts, placeMutations } from "./build";
import { hasCzech } from "./text";
import type { PhotoRef } from "./types";

const photos = new Map<string, PhotoRef>(
  photoSlugs.map((slug) => [
    slug,
    { src: `https://images.unsplash.com/${slug}`, alt: slug },
  ]),
);

describe("placeMutations", () => {
  it("records where each replacement lands, whatever order it was listed in", () => {
    const { text, placed } = placeMutations("Bývam v meste. Mám psa.", [
      { topic: "nounEndings", from: "psa", to: "pes" },
      { topic: "nounEndings", from: "v meste", to: "v mesto" },
    ]);
    expect(text).toBe("Bývam v mesto. Mám pes.");
    for (const error of placed) expect(text.slice(error.start, error.end)).toBe(error.to);
  });

  it("refuses a form that is missing, repeated or overlapping", () => {
    const text = "Mám psa a mám aj mačku a psa.";
    expect(() =>
      placeMutations(text, [{ topic: "vocabulary", from: "kozu", to: "x" }]),
    ).toThrow();
    expect(() =>
      placeMutations(text, [{ topic: "nounEndings", from: "psa", to: "pes" }]),
    ).toThrow();
    expect(() =>
      placeMutations(text, [
        { topic: "nounEndings", from: "psa a", to: "pes a" },
        { topic: "functionWords", from: "a mám", to: "aj mám" },
      ]),
    ).toThrow();
  });
});

describe("eval set", () => {
  const cases = buildCases(EVAL_BASES, ADVERSARIAL, photos);

  it("builds every answer and every error without a clash", () => {
    expect(cases.length).toBeGreaterThan(100);
    for (const entry of cases) {
      for (const error of entry.errors) {
        expect(entry.request.response.slice(error.start, error.end)).toBe(error.to);
      }
    }
  });

  it("covers every task at more than one level, and every topic with errors", () => {
    const kinds = new Map<string, Set<string>>();
    for (const base of EVAL_BASES) {
      kinds.set(base.kind, (kinds.get(base.kind) ?? new Set()).add(base.targetLevel));
    }
    expect(kinds.size).toBe(7);
    for (const levels of kinds.values()) expect(levels.size).toBeGreaterThan(1);

    const topics = new Set(
      EVAL_BASES.flatMap((base) => base.mutations.map((m) => m.topic)),
    );
    expect(topics.size).toBe(8);
  });

  it("keeps Czech out of the clean answers", () => {
    for (const base of EVAL_BASES) {
      expect(hasCzech(`${base.response} ${base.followUp ?? ""}`), base.id).toBe(false);
    }
  });

  it("keeps the dev and test splits apart by answer", () => {
    const splits = new Map<string, Set<string>>();
    for (const entry of cases) {
      splits.set(entry.group, (splits.get(entry.group) ?? new Set()).add(entry.split));
    }
    for (const seen of splits.values()) expect(seen.size).toBe(1);
    expect(cases.some((entry) => entry.split === "dev")).toBe(true);
  });

  it("sends a photo only to photo tasks, and the wrong photo only to its own case", () => {
    for (const entry of cases) {
      const photoTask =
        entry.request.kind === "writePhoto" || entry.request.kind === "speakPhoto";
      expect(Boolean(entry.request.imageUrl), entry.id).toBe(photoTask);
    }
    const base = EVAL_BASES.find((entry) => entry.wrongPhoto)!;
    const clean = cases.find((entry) => entry.id === `${base.id}/clean`)!;
    const wrong = cases.find((entry) => entry.id === `${base.id}/wrong-photo`)!;
    expect(wrong.request.response).toBe(clean.request.response);
    expect(wrong.request.imageUrl).not.toBe(clean.request.imageUrl);
  });

  it("copies what the learner was shown for the copy cases", () => {
    const prompt = cases.find((entry) => entry.id === "adv-copied-prompt")!;
    expect(prompt.request.response).toBe(prompt.request.prompt);
    const scenario = cases.find((entry) => entry.id === "adv-copied-scenario")!;
    expect(scenario.request.prompt).toContain(scenario.request.response);
  });
});

describe("errorCounts", () => {
  it("asks for one, three and all errors", () => {
    expect(errorCounts(6)).toEqual([1, 3, 6]);
    expect(errorCounts(3)).toEqual([1, 3]);
    expect(errorCounts(2)).toEqual([1, 2]);
  });
});
