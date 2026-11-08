import { describe, expect, it } from "vitest";

import { caseSketchParts, markedParts } from "./case-sketches";
import { arrowD, boxD, inkRandom, lineD, loopD, patchD, smoothD } from "./ink-paths";

const numbers = (d: string) => (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);

describe("ink paths", () => {
  it("the same seed draws the same stroke, a new seed a different one", () => {
    expect(lineD([0, 0], [100, 0], 4)).toBe(lineD([0, 0], [100, 0], 4));
    expect(lineD([0, 0], [100, 0], 4)).not.toBe(lineD([0, 0], [100, 0], 5));
    const first = inkRandom(9);
    const second = inkRandom(9);
    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });

  it("every builder returns finite numbers only", () => {
    const { shaft, head } = arrowD([10, 10], [200, 90], 5, 8);
    for (const d of [
      lineD([10, 10], [200, 90], 1),
      boxD(10, 10, 60, 40, 2),
      loopD(100, 60, 30, 20, 3),
      patchD(100, 60, 30, 20, 4),
      smoothD([
        [0, 0],
        [10, 20],
        [30, 10],
      ]),
      shaft,
      head,
    ]) {
      expect(d.startsWith("M"), d).toBe(true);
      expect(numbers(d).every(Number.isFinite), d).toBe(true);
    }
  });
});

describe("case sketches", () => {
  it("every case has a scene, drawn in finite numbers", () => {
    for (const slug of [
      "nominative",
      "genitive",
      "dative",
      "accusative",
      "locative",
      "instrumental",
    ]) {
      const parts = caseSketchParts(slug);
      expect(parts.length, slug).toBeGreaterThan(3);
      for (const part of parts) {
        if (part.type !== "note")
          expect(numbers(part.d).every(Number.isFinite), slug).toBe(true);
      }
      expect(
        parts.some((part) => part.type === "patch"),
        `${slug} marks its one thing`,
      ).toBe(true);
    }
  });

  it("an unknown case draws nothing", () => {
    expect(caseSketchParts("vocative")).toEqual([]);
  });

  it("the word to light comes out of its markers", () => {
    expect(markedParts("Idem z **práce**.")).toEqual([
      { text: "Idem z ", marked: false },
      { text: "práce", marked: true },
      { text: ".", marked: false },
    ]);
  });
});
