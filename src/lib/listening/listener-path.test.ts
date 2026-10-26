import { describe, expect, it } from "vitest";

import type { DialogueTurn } from "$lib/learning/types";

import { NO_PICK, nextOnPath, pathScore } from "./listener-path";

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

describe("listener path", () => {
  it("follows each pick, and the host's right answer where there is none", () => {
    expect(walk({ q1: "b", q2: "b" })).toEqual(["q1", "q1-b", "q2", "q2-b", "one-right"]);
    expect(walk({ q1: "a" })).toEqual(["q1", "q1-a", "q2", "q2-none", "all-right"]);
  });

  it("ends on the unaided line when the listener picked nothing", () => {
    expect(walk({})).toEqual(["q1", "q1-a", "q2", "q2-none", "unaided"]);
  });

  it("scores a pick left to the host as right", () => {
    expect(pathScore(lines, { q1: "b" })).toBe(1);
    expect(pathScore(lines, { q1: "b", q2: "a" })).toBe(0);
  });
});
