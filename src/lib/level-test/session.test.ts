import { describe, expect, it } from "vitest";

import { buildLevelTestBank } from "$lib/catalog/level-test/bank";

import { CEFR_ANCHOR } from "./scale";
import { resolveStep, type Picker } from "./session";
import type { StepKind } from "./types";

const bank = buildLevelTestBank();

function picker(seen: string[] = []): Picker {
  let state = 7;
  return {
    used: new Set(),
    balance: 0,
    random: () => {
      state = (state * 16807) % 2147483647;
      return state / 2147483647;
    },
    seen: new Set(seen),
    coverage: new Map(),
  };
}

function promptLevels(kind: StepKind, theta: number): string[] {
  const pick = picker();
  const levels: string[] = [];
  for (let run = 0; run < 3; run++) {
    const content = resolveStep(bank, { kind, section: "writing" }, theta, pick);
    if (content && "prompt" in content) levels.push(content.prompt.level);
  }
  return levels;
}

describe("writing and speaking prompts", () => {
  const kinds: StepKind[] = [
    "interactiveWriting",
    "writingSample",
    "readThenSpeak",
    "speakingSample",
  ];

  it.each(kinds)("%s gives a beginner the easiest prompts", (kind) => {
    const pool = {
      interactiveWriting: bank.interactiveWriting,
      writingSample: bank.writingSamples,
      readThenSpeak: bank.readThenSpeak,
      speakingSample: bank.speakingSamples,
    }[kind as "interactiveWriting"];
    const easiest = Math.min(...pool.map((prompt) => CEFR_ANCHOR[prompt.level]));
    for (const level of promptLevels(kind, 0)) {
      expect(CEFR_ANCHOR[level as "A1"]).toBe(easiest);
    }
  });

  it("gives an advanced learner the hardest speaking topics", () => {
    expect(promptLevels("speakingSample", 85)).toEqual(["C1", "C1", "C1"]);
  });

  it("still varies on a retake: unseen prompts at the level come first", () => {
    const first = resolveStep(
      bank,
      { kind: "writingSample", section: "writing" },
      60,
      picker(),
    );
    const id = first && "prompt" in first ? first.prompt.id : "";
    const again = resolveStep(
      bank,
      { kind: "writingSample", section: "writing" },
      60,
      picker([id]),
    );
    expect(again && "prompt" in again ? again.prompt.id : id).not.toBe(id);
  });
});
