import { describe, expect, it } from "vitest";

import { practiceSetById } from "$lib/catalog/practice";

import { practiceSessionContext, practiceTaskKindsPhrase } from "./hub";

function setById(id: string) {
  const set = practiceSetById.get(id);
  if (!set) throw new Error(`missing set ${id}`);
  return set;
}

describe("practiceSessionContext", () => {
  it("places a set within its track and links the next set in hub order", () => {
    const context = practiceSessionContext(setById("meet-someone"));

    expect(context.step).toBe(1);
    expect(context.stepCount).toBeGreaterThan(1);
    expect(context.trackTitle).toBe("Everyday Slovak");
    expect(context.lessonHref).toBe("/lessons/everyday/meet-someone");
    expect(context.nextSet).toEqual({
      href: "/practice/meeting-questions",
      title: "Questions when meeting someone",
    });
  });

  it("continues into the next track after a track's last set", () => {
    const context = practiceSessionContext(setById("negation-in-conversation"));

    expect(context.step).toBe(context.stepCount);
    expect(context.nextSet?.href).toBe("/practice/present-tense-i");
  });
});

describe("practiceTaskKindsPhrase", () => {
  it("joins formats as a lowercase prose list", () => {
    expect(practiceTaskKindsPhrase([])).toBe("");
    expect(practiceTaskKindsPhrase(["type"])).toBe("type");
    expect(practiceTaskKindsPhrase(["choose", "type"])).toBe("choose and type");
    expect(practiceTaskKindsPhrase(["choose", "build", "type"])).toBe(
      "choose, build, and type",
    );
    expect(practiceTaskKindsPhrase(["fill", "select"])).toBe(
      "fill the gap and select all",
    );
  });
});
