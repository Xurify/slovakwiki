import { describe, expect, it } from "vitest";

import { gradeBuild } from "$lib/client/build-tiles";
import { daysDatesTimePracticeItems } from "$lib/learning/time/practice-catalog";
import { practiceItemById } from "$lib/catalog/practice";
import { materializeBuildItem } from "./materialize";
import { dayAppointmentTemplate } from "./templates/day-appointment";
import { introReplyTemplate } from "./templates/intro-reply";

describe("learning/build/materialize", () => {
  it("materializes day-appointment with a weekday answer and shuffled bank", () => {
    const first = dayAppointmentTemplate.materialize(() => 0);
    const second = dayAppointmentTemplate.materialize(() => 0.99);

    expect(first.prompt).toMatch(/We are meeting on/);
    expect(first.answer[0]).toBe("Stretneme");
    expect(first.answer[2]).toBe("v");
    expect(first.tiles.length).toBeGreaterThan(first.answer.length);
    expect(gradeBuild(first.answer, first.answer)).toBe(true);

    if (first.prompt !== second.prompt) {
      expect(second.answer[3]).not.toBe(first.answer[3]);
    }
  });

  it("materializes intro-reply with answer tokens in the bank", () => {
    const task = introReplyTemplate.materialize(() => 0.2);
    expect(task.answer).toHaveLength(4);
    for (const token of task.answer) {
      expect(task.tiles).toContain(token);
    }
    expect(task.prompt).toMatch(/My name is/);
  });

  it("wraps catalog items into practice items", () => {
    const catalog = daysDatesTimePracticeItems.find(
      (item) => item.id === "everyday/day-meeting",
    );
    expect(catalog).toBeDefined();
    if (!catalog || catalog.task.type !== "build") return;

    const item = materializeBuildItem(catalog, () => 0.5);
    expect(item.task.type).toBe("build");
    if (item.task.type === "build") {
      expect(item.task.tiles).not.toEqual(catalog.task.tiles);
      expect(item.task.answer).toHaveLength(4);
    }
  });

  it("materializes registered greeting build items from practice catalog", () => {
    const catalog = practiceItemById.get("everyday/introduction");
    expect(catalog).toBeDefined();
    if (!catalog) return;

    const item = materializeBuildItem(catalog, () => 0.3);
    if (item.task.type === "build") {
      expect(item.task.tiles.length).toBeGreaterThan(item.task.answer.length);
    }
  });
});
