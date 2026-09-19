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
});
