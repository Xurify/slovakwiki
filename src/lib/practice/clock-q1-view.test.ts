import { describe, expect, it } from "vitest";

import { materializeDaysDatesTimeItem } from "$lib/learning/time/session";

import { buildClockQ1View } from "./clock-q1-view";

describe("buildClockQ1View", () => {
  it("maps a build meeting item without a player kicker", () => {
    const item = materializeDaysDatesTimeItem("everyday/day-meeting", () => 0.42);
    const view = buildClockQ1View(item);

    expect(view.tiles?.length).toBeGreaterThan(0);
    expect(view.prompt.length).toBeGreaterThan(0);
    expect(view.typed).toBe(false);
    expect(view.kicker).toBeNull();
    expect(view.hintChip).toBeNull();
    expect(view.sourceLabel.length).toBeGreaterThan(0);
  });

  it("matches PracticePlayer kicker and hint for a clock-face choice", () => {
    const item = materializeDaysDatesTimeItem("everyday/meeting-time", () => 0.2);
    const view = buildClockQ1View(item);

    expect(view.choiceStyle).toBe("clock");
    expect(view.kicker).toBe("Choose the answer");
    expect(view.prompt.length).toBeGreaterThan(0);
  });

  it("keeps Anna on both negotiate scene lines for the Lepšie counter", () => {
    const item = materializeDaysDatesTimeItem("everyday/frame-negotiate", () => 0.4);
    const view = buildClockQ1View(item);

    expect(view.typed).toBe(true);
    expect(view.scene).toHaveLength(2);
    expect(view.scene.every((line) => line.speaker === "Anna")).toBe(true);
    expect(view.scene[1]?.slovak).toMatch(/^O /);
    expect(view.prompt).toMatch(/^Better at half past /);
  });
});
