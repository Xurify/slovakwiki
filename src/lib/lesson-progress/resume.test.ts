import { describe, expect, it } from "vitest";
import {
  clearLessonResume,
  LESSON_RESUME_PENDING_ATTR,
  lessonResumeBootScript,
  readLessonResume,
  writeLessonResume,
} from "./resume";

function memory() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    removeItem: (key: string) => void data.delete(key),
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

describe("lesson resume", () => {
  const steps = ["a", "b", "c", "d"];

  it("comes back to the step left", () => {
    const storage = memory();
    writeLessonResume(storage, "grammar/x", { answers: {}, at: 2, stepIds: steps });
    expect(readLessonResume(storage, "grammar/x", steps)?.at).toBe(2);
  });

  it("starts fresh once the lesson's steps changed", () => {
    const storage = memory();
    writeLessonResume(storage, "grammar/x", { answers: {}, at: 2, stepIds: steps });
    expect(readLessonResume(storage, "grammar/x", ["a", "b", "e", "d"])).toBeNull();
  });

  it("forgets a lesson once cleared, and keeps the others", () => {
    const storage = memory();
    writeLessonResume(storage, "grammar/x", { answers: {}, at: 2, stepIds: steps });
    writeLessonResume(storage, "grammar/y", { answers: {}, at: 1, stepIds: steps });
    clearLessonResume(storage, "grammar/x");
    expect(readLessonResume(storage, "grammar/x", steps)).toBeNull();
    expect(readLessonResume(storage, "grammar/y", steps)?.at).toBe(1);
  });

  it("hides the lesson before paint exactly when the player will resume it", () => {
    const cases: [string, string | null][] = [
      ["no save", null],
      ["not json", "{not json"],
      ["not an object", "7"],
      ["saved", JSON.stringify({ "grammar/x": { answers: {}, at: 2, stepIds: steps } })],
      [
        "first step",
        JSON.stringify({ "grammar/x": { answers: {}, at: 0, stepIds: steps } }),
      ],
      [
        "past the end",
        JSON.stringify({ "grammar/x": { answers: {}, at: 4, stepIds: steps } }),
      ],
      [
        "not a step",
        JSON.stringify({ "grammar/x": { answers: {}, at: 1.5, stepIds: steps } }),
      ],
      [
        "steps changed",
        JSON.stringify({
          "grammar/x": { answers: {}, at: 2, stepIds: ["a", "b", "e", "d"] },
        }),
      ],
      [
        "other lesson",
        JSON.stringify({ "grammar/y": { answers: {}, at: 2, stepIds: steps } }),
      ],
    ];

    for (const [label, raw] of cases) {
      const storage = memory();
      if (raw !== null) storage.setItem("slovak.wiki.lesson-resume.v1", raw);
      const attrs = new Set<string>();
      const root = {
        setAttribute: (name: string) => void attrs.add(name),
        removeAttribute: (name: string) => void attrs.delete(name),
      };
      new Function(
        "localStorage",
        "document",
        "addEventListener",
        lessonResumeBootScript("grammar/x", steps),
      )(storage, { documentElement: root }, () => {});
      expect(attrs.has(LESSON_RESUME_PENDING_ATTR), label).toBe(
        readLessonResume(storage, "grammar/x", steps) !== null,
      );
    }
  });

  it("ignores what it cannot read", () => {
    const storage = memory();
    storage.setItem("slovak.wiki.lesson-resume.v1", "{not json");
    expect(readLessonResume(storage, "grammar/x", steps)).toBeNull();
  });
});
