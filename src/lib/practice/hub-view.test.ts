import { describe, expect, it } from "vitest";

import type { PracticeBootPayload } from "./boot-payload";
import { PRACTICE_RECENTS_CAP, buildPracticeHubView } from "./hub-view";

const payload: PracticeBootPayload = {
  sheets: [
    { id: "greet", lessonId: "everyday/a", title: "Greetings and introductions" },
    { id: "ask", lessonId: "everyday/b", title: "Questions" },
  ],
  items: [
    {
      id: "item-a",
      href: "/practice/greet?at=item-a",
      slovak: "Ahoj.",
      english: "Hi.",
      sourceLabel: "Greetings",
    },
    {
      id: "item-b",
      href: "/practice/ask?at=item-b",
      slovak: "Ako sa máš?",
      english: "How are you?",
      sourceLabel: "Questions",
    },
  ],
};

describe("buildPracticeHubView", () => {
  it("empty storage features first sheet", () => {
    const view = buildPracticeHubView(payload, [], []);

    expect(view.featuredSetId).toBe("greet");
    expect(view.recents).toEqual([]);
  });

  it("skips completed lessons for featured pick", () => {
    const view = buildPracticeHubView(payload, ["everyday/a"], []);

    expect(view.featuredSetId).toBe("ask");
  });

  it("all-done keeps the first sheet featured", () => {
    const view = buildPracticeHubView(payload, ["everyday/a", "everyday/b"], []);

    expect(view.featuredSetId).toBe("greet");
  });

  it("recents reverse order, cap, and skip unknown ids", () => {
    const extra = Array.from({ length: PRACTICE_RECENTS_CAP + 2 }, (_, index) => ({
      id: `extra-${index}`,
      href: `/practice/greet?at=extra-${index}`,
      slovak: `Sk ${index}`,
      english: `En ${index}`,
      sourceLabel: "Greetings",
    }));

    const fatPayload: PracticeBootPayload = {
      ...payload,
      items: [...payload.items, ...extra],
    };

    const recentIds = ["missing", "item-a", ...extra.map((item) => item.id)];
    const view = buildPracticeHubView(fatPayload, [], recentIds);

    expect(view.recents).toHaveLength(PRACTICE_RECENTS_CAP);
    expect(view.recents[0]?.id).toBe(`extra-${PRACTICE_RECENTS_CAP + 1}`);
    expect(view.recents.some((item) => item.id === "item-a")).toBe(false);
  });
});
