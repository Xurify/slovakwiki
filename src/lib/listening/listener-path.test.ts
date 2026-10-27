import { describe, expect, it } from "vitest";

import type { DialogueTurn } from "$lib/learning/types";

import { NO_PICK, cardAt, nextOnPath, pathScore, prevOnPath } from "./listener-path";

function turn(id: string, extra: Partial<DialogueTurn> = {}): DialogueTurn {
  return { id, speaker: "Anna", slovak: id, english: id, ...extra };
}

const ask = (answerId: string) => ({
  prompt: "?",
  answerId,
  choices: [
    { id: "a", label: "a", english: "a" },
    { id: "b", label: "b", english: "b" },
  ],
});

const lines: DialogueTurn[] = [
  turn("q1", { ask: ask("a") }),
  turn("q1-a", { when: { ask: "q1", picks: ["a", NO_PICK] } }),
  turn("q1-b", { when: { ask: "q1", picks: ["b"] } }),
  turn("q2", { ask: ask("b") }),
  turn("q2-b", { when: { ask: "q2", picks: ["b"] } }),
  turn("q2-none", { when: { ask: "q2", picks: [NO_PICK] } }),
  turn("all-right", { when: { score: [2] } }),
  turn("one-right", { when: { score: [1] } }),
  turn("unaided", { when: { unaided: true } }),
];

function walk(picks: Record<string, string>): string[] {
  const heard = [lines[0]!.id];
  for (
    let at = nextOnPath(lines, picks, 0);
    at !== undefined;
    at = nextOnPath(lines, picks, at)
  ) {
    heard.push(lines[at]!.id);
  }
  return heard;
}

function walkBack(picks: Record<string, string>): string[] {
  const path = walk(picks);
  const reversed: string[] = [];
  const lastIndex = lines.findIndex((l) => l.id === path[path.length - 1]);
  for (
    let at: number | undefined = lastIndex;
    at !== undefined;
    at = prevOnPath(lines, picks, at)
  ) {
    reversed.push(lines[at]!.id);
  }
  return reversed.reverse();
}

describe("listener path", () => {
  it("follows each pick, and the host's right answer where there is none", () => {
    expect(walk({ q1: "b", q2: "b" })).toEqual(["q1", "q1-b", "q2", "q2-b", "one-right"]);
    expect(walk({ q1: "a" })).toEqual(["q1", "q1-a", "q2", "q2-none", "all-right"]);
  });

  it("ends on the unaided line when the listener picked nothing", () => {
    expect(walk({})).toEqual(["q1", "q1-a", "q2", "q2-none", "unaided"]);
  });

  it("steps backward through lines on the active path with prevOnPath", () => {
    expect(walkBack({ q1: "b", q2: "b" })).toEqual([
      "q1",
      "q1-b",
      "q2",
      "q2-b",
      "one-right",
    ]);
    expect(walkBack({ q1: "a" })).toEqual(["q1", "q1-a", "q2", "q2-none", "all-right"]);
    expect(walkBack({})).toEqual(["q1", "q1-a", "q2", "q2-none", "unaided"]);
  });

  it("scores a pick left to the host as right", () => {
    expect(pathScore(lines, { q1: "b" })).toBe(1);
    expect(pathScore(lines, { q1: "b", q2: "a" })).toBe(0);
  });

  it("keeps the answered card, not the one before, in the beat after a pick", () => {
    expect(cardAt(lines, { q1: "a", q2: "b" }, 3, false)).toBe(3);
    expect(cardAt(lines, { q1: "a" }, 3, true)).toBe(3);
    expect(cardAt(lines, { q1: "a" }, 4, false)).toBe(-1);
    expect(cardAt(lines, { q1: "a" }, 1, false)).toBe(0);
  });
});
