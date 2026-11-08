import { describe, expect, it } from "vitest";

import { caseTopics } from "$lib/catalog/reference/cases";
import { grammarEntries } from "$lib/catalog/reference/grammar";

import { sketchParts, markedParts } from "./sketches";
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

describe("sketches", () => {
  const caseSlugs = [
    "nominative",
    "genitive",
    "dative",
    "accusative",
    "locative",
    "instrumental",
  ];

  it("every case and every grammar topic has a scene, drawn in finite numbers", () => {
    for (const slug of [...caseSlugs, ...grammarEntries.map((entry) => entry.slug)]) {
      const parts = sketchParts(slug);
      expect(parts.length, slug).toBeGreaterThan(3);
      for (const part of parts) {
        if (part.type !== "note")
          expect(numbers(part.d).every(Number.isFinite), slug).toBe(true);
      }
    }
  });

  it("every note stays inside the sheet", () => {
    for (const slug of [...caseSlugs, ...grammarEntries.map((entry) => entry.slug)]) {
      for (const part of sketchParts(slug)) {
        if (part.type === "note") {
          expect(part.y, slug).toBeLessThanOrEqual(128);
          expect(part.x, slug).toBeGreaterThan(10);
          expect(part.x, slug).toBeLessThan(330);
        }
      }
    }
  });

  it("every case marks its one thing with a patch", () => {
    for (const slug of caseSlugs) {
      expect(
        sketchParts(slug).some((part) => part.type === "patch"),
        slug,
      ).toBe(true);
    }
  });

  it("every grammar topic and case page has a caption for its sketch", () => {
    for (const entry of grammarEntries) {
      expect(entry.sketch, entry.slug).toBeDefined();
      expect(
        markedParts(entry.sketch!.sentence).some((part) => part.marked),
        entry.slug,
      ).toBe(true);
      expect(entry.sketch!.alt.length, entry.slug).toBeGreaterThan(30);
    }
    for (const topic of caseTopics) expect(topic.sketch, topic.slug).toBeDefined();
  });

  it("an unknown case draws nothing", () => {
    expect(sketchParts("vocative")).toEqual([]);
  });

  it("the word to light comes out of its markers", () => {
    expect(markedParts("Idem z **práce**.")).toEqual([
      { text: "Idem z ", marked: false },
      { text: "práce", marked: true },
      { text: ".", marked: false },
    ]);
  });
});
