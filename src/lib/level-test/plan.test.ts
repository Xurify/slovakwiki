import { describe, expect, it } from "vitest";

import { estimateAbility } from "./estimate";
import {
  CALIBRATION_TARGETS,
  buildPlan,
  pickNearest,
  planMinutes,
  seededRandom,
} from "./plan";
import { probabilityCorrect } from "./scale";
import { pickListenSelect, pickReadSelect } from "./select";
import type { AdaptiveItem, ReadSelectItem } from "./types";

const allOn = { scoring: true, transcription: true };
const allOff = { scoring: false, transcription: false };

describe("buildPlan", () => {
  it("opens with the calibration climb", () => {
    const plan = buildPlan({ mode: "full", capabilities: allOn, speaking: true });
    expect(plan.slice(0, 4).map((step) => step.calibration)).toEqual([
      ...CALIBRATION_TARGETS,
    ]);
    expect(plan[4]?.calibration).toBeUndefined();
  });

  it("keeps the quick test to the adaptive section", () => {
    const plan = buildPlan({ mode: "quick", capabilities: allOn, speaking: true });
    expect(plan.every((step) => step.section === "adaptive")).toBe(true);
    expect(plan.filter((step) => step.kind === "readSelect")).toHaveLength(12);
    expect(plan.filter((step) => step.kind === "chooseVerb")).toHaveLength(2);
    expect(plan.filter((step) => step.kind === "placeClitic")).toHaveLength(2);
  });

  it("matches the DET's per-test counts in the full test", () => {
    const plan = buildPlan({ mode: "full", capabilities: allOn, speaking: true });
    const count = (kind: string) => plan.filter((step) => step.kind === kind).length;
    expect(count("readSelect")).toBe(18);
    expect(count("fillBlank")).toBe(9);
    expect(count("listenLength")).toBe(3);
    expect(count("chooseVerb")).toBe(3);
    expect(count("placeClitic")).toBe(3);
    expect(count("listenType")).toBe(6);
    expect(count("readComplete")).toBe(3);
    expect(count("writePhoto")).toBe(3);
    expect(plan.at(-1)?.kind).toBe("speakingSample");
  });

  it("swaps AI-scored tasks for planned placeholders when scoring is off", () => {
    const plan = buildPlan({ mode: "full", capabilities: allOff, speaking: true });
    const planned = plan.filter((step) => step.kind === "planned");
    expect(planned.map((step) => step.section)).toEqual(["writing", "speaking"]);
    expect(plan.some((step) => step.kind === "writePhoto")).toBe(false);
  });

  it("keeps Read Aloud when only speech-to-text works", () => {
    const plan = buildPlan({
      mode: "full",
      capabilities: { scoring: false, transcription: true },
      speaking: true,
    });
    expect(plan.filter((step) => step.kind === "readAloud")).toHaveLength(3);
    expect(
      plan.find((step) => step.section === "speaking" && step.kind === "planned")
        ?.planned,
    ).toContain("speakPhoto");
  });

  it("always lists Interactive Speaking as planned", () => {
    const plan = buildPlan({ mode: "full", capabilities: allOn, speaking: true });
    expect(plan.find((step) => step.kind === "planned")?.planned).toEqual([
      "interactiveSpeaking",
    ]);
  });

  it("estimates minutes from the time limits", () => {
    const quick = planMinutes(
      buildPlan({ mode: "quick", capabilities: allOff, speaking: false }),
    );
    const full = planMinutes(
      buildPlan({ mode: "full", capabilities: allOn, speaking: true }),
    );
    expect(quick).toBeLessThan(full);
    expect(quick).toBeGreaterThan(5);
  });
});

function word(id: string, difficulty: number, real: boolean): ReadSelectItem {
  return { id, format: "readSelect", difficulty, word: id, real };
}

describe("pickNearest", () => {
  const pool = [10, 20, 30, 40, 50, 60].map((difficulty) => ({
    id: `w${difficulty}`,
    difficulty,
  }));

  it("stays near the target", () => {
    const random = seededRandom(1);
    for (let run = 0; run < 20; run++) {
      const picked = pickNearest(pool, 32, new Set(), random, 2);
      expect(["w30", "w40"]).toContain(picked?.id);
    }
  });

  it("skips used items", () => {
    const picked = pickNearest(pool, 10, new Set(["w10"]), seededRandom(2), 1);
    expect(picked?.id).toBe("w20");
  });

  it("prefers an item from no earlier run while one is close", () => {
    const seen = new Set(["w30"]);
    expect(pickNearest(pool, 34, new Set(), seededRandom(3), 1, seen)?.id).toBe("w40");
  });

  it("repeats a seen item rather than drift far from the target", () => {
    const seen = new Set(["w10", "w20", "w30"]);
    expect(pickNearest(pool, 10, new Set(), seededRandom(4), 1, seen)?.id).toBe("w10");
  });
});

describe("pickReadSelect", () => {
  const items: AdaptiveItem[] = Array.from({ length: 40 }, (_, index) =>
    word(`w${index}`, (index % 20) * 5, index % 2 === 0),
  );

  it("forces the other kind once one runs two ahead", () => {
    const picked = pickReadSelect(items, 40, new Set(), 2, seededRandom(3));
    expect(picked?.real).toBe(false);
  });
});

describe("pickListenSelect", () => {
  const items: AdaptiveItem[] = Array.from({ length: 30 }, (_, index) => ({
    id: `s${index}`,
    format: "listenSelect" as const,
    difficulty: index * 3,
    word: `s${index}`,
    real: index % 2 === 0,
    audio: `/a/${index}.mp3`,
  }));

  it("mixes real words and pseudowords", () => {
    const grid = pickListenSelect(items, 40, new Set(), seededRandom(4));
    expect(grid).toHaveLength(6);
    expect(grid.filter((item) => item.real)).toHaveLength(3);
  });
});

describe("adaptive simulation", () => {
  const bank: ReadSelectItem[] = Array.from({ length: 400 }, (_, index) =>
    word(`w${index}`, (index * 7) % 100, index % 2 === 0),
  );

  function simulate(trueTheta: number, seed: number): number {
    const random = seededRandom(seed);
    const used = new Set<string>();
    const observations: { difficulty: number; score: number; guess: number }[] = [];
    let balance = 0;

    for (let step = 0; step < 30; step++) {
      const target = CALIBRATION_TARGETS[step] ?? estimateAbility(observations).theta;
      const item = pickReadSelect(bank, target, used, balance, random);
      if (!item) break;
      used.add(item.id);
      balance += item.real ? 1 : -1;
      const correct =
        random() < probabilityCorrect(trueTheta, item.difficulty, 0.5) ? 1 : 0;
      observations.push({ difficulty: item.difficulty, score: correct, guess: 0.5 });
    }

    return estimateAbility(observations).theta;
  }

  it("separates a beginner from an advanced learner", () => {
    const beginner = [1, 2, 3, 4, 5].map((seed) => simulate(10, seed));
    const advanced = [1, 2, 3, 4, 5].map((seed) => simulate(70, seed));
    const average = (values: number[]) =>
      values.reduce((a, b) => a + b, 0) / values.length;
    expect(average(advanced) - average(beginner)).toBeGreaterThan(30);
  });
});
