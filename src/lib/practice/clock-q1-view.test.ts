import { describe, expect, it } from "vitest";

import { materializeDaysDatesTimeItem } from "$lib/learning/time/session";

import { buildClockQ1View } from "./clock-q1-view";
import { readClockSession, stashClockSession } from "./clock-session-stash";

describe("buildClockQ1View", () => {
  it("maps a build meeting item without a player kicker", () => {
    const item = materializeDaysDatesTimeItem("everyday/day-meeting", () => 0.42);
    const view = buildClockQ1View(item);

    expect(view.tiles?.length).toBeGreaterThan(0);
    expect(view.prompt.length).toBeGreaterThan(0);
    expect(view.typed).toBe(false);
    expect(view.kicker).toBeNull();
    expect(view.hintChip).toBeNull();
    expect(view.choiceKeys).toBe(0);
  });

  it("matches PracticePlayer kicker and hint for a clock-face choice", () => {
    const item = materializeDaysDatesTimeItem("everyday/meeting-time", () => 0.2);
    const view = buildClockQ1View(item);

    expect(view.choiceStyle).toBe("clock");
    expect(view.choiceKeys).toBe(view.choices?.length);
    expect(view.kicker).toBe("Choose the answer");
    expect(view.prompt.length).toBeGreaterThan(0);
  });

  it("keeps one Anna offer on the negotiate scene for the Lepšie counter", () => {
    const item = materializeDaysDatesTimeItem("everyday/frame-negotiate", () => 0.4);
    const view = buildClockQ1View(item);

    expect(view.typed).toBe(true);
    expect(view.scene).toHaveLength(1);
    expect(view.scene[0]?.speaker).toBe("Anna");
    expect(view.scene[0]?.slovak).toMatch(/^Stretneme sa v \S+ o /);
    expect(view.scene[0]?.marks?.map((mark) => mark.role)).toEqual(["day", "time"]);
    expect(view.scene[0]?.englishToggle).toBe(true);
    expect(view.prompt).toMatch(/^Better at half past /);
  });
});

describe("clock-session-stash", () => {
  it("stashes and consumes clock session items cleanly without leaking", () => {
    const item = materializeDaysDatesTimeItem("everyday/day-meeting", () => 0.42);
    stashClockSession([item]);
    expect(readClockSession()).toEqual([item]);
    expect(readClockSession()).toBeNull();
  });
});
